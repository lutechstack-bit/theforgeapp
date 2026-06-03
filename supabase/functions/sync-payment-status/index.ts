// sync-payment-status
//
// Called by n8n (or any automation) when a student's payment status changes
// in the Google Sheet. Accepts x-forge-secret auth so the caller never needs
// the Supabase service role key — the key stays inside this function.
//
// Body:
//   email          string   — student email (used to look up profile)
//   payment_status string   — CONFIRMED_15K | BALANCE_PAID | DEFERRED
//
// Responses:
//   200 { status: 'updated', profile_id, payment_status, unlock_level }
//   200 { status: 'no_profile' }   — email not found, not an error
//   400 { error: '...' }           — bad input
//   401 { error: 'Unauthorized' }
//   500 { error: '...' }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forge-secret',
};

const VALID_STATUSES = ['CONFIRMED_15K', 'BALANCE_PAID', 'DEFERRED'];

// Maps payment_status → unlock_level
function unlockLevel(status: string): string {
  if (status === 'BALANCE_PAID') return 'FULL';
  return 'PREVIEW'; // CONFIRMED_15K and DEFERRED both get PREVIEW
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const secret = req.headers.get('x-forge-secret');
    const automationSecret = Deno.env.get('FORGE_AUTOMATION_SECRET');

    if (!automationSecret || secret !== automationSecret) {
      return respond({ error: 'Unauthorized' }, 401);
    }

    // ── Parse body ───────────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return respond({ error: 'Invalid JSON body' }, 400);
    }

    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const payment_status = (body.payment_status as string | undefined)?.trim().toUpperCase();

    if (!email || !email.includes('@')) {
      return respond({ error: 'Valid email is required' }, 400);
    }
    if (!payment_status || !VALID_STATUSES.includes(payment_status)) {
      return respond({
        error: `payment_status must be one of: ${VALID_STATUSES.join(', ')}`,
      }, 400);
    }

    // ── DB update ────────────────────────────────────────────────────────────
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find the profile first (so we can return useful info + skip unknown emails)
    const { data: profile, error: fetchErr } = await admin
      .from('profiles')
      .select('id, email, payment_status')
      .eq('email', email)
      .maybeSingle();

    if (fetchErr) {
      console.error('Profile fetch error:', fetchErr);
      return respond({ error: 'Database error fetching profile' }, 500);
    }

    if (!profile) {
      // Not an error — student simply doesn't have an app account yet
      console.log(`sync-payment-status: no profile found for ${email} — skipping`);
      return respond({ status: 'no_profile', email });
    }

    // Skip if already the same status (no-op)
    if (profile.payment_status === payment_status) {
      return respond({
        status: 'no_change',
        profile_id: profile.id,
        payment_status,
        unlock_level: unlockLevel(payment_status),
      });
    }

    const unlock_level = unlockLevel(payment_status);

    const { error: updateErr } = await admin
      .from('profiles')
      .update({ payment_status, unlock_level })
      .eq('id', profile.id);

    if (updateErr) {
      console.error('Profile update error:', updateErr);
      return respond({ error: 'Database error updating profile' }, 500);
    }

    console.log(`sync-payment-status: ${email} → ${payment_status} (${unlock_level})`);

    return respond({
      status: 'updated',
      profile_id: profile.id,
      email,
      payment_status,
      unlock_level,
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return respond({ error: 'Internal server error' }, 500);
  }
});

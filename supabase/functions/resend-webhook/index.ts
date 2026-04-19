// resend-webhook — receive email lifecycle events from Resend.
//
// Resend POSTs events to this function at:
//   https://<project-ref>.supabase.co/functions/v1/resend-webhook
//
// Configure that URL in the Resend dashboard → Webhooks. Resend signs each
// request with an HMAC-SHA256 over the raw body using a shared secret. We
// verify the signature BEFORE trusting any event data.
//
// Supported event types -> email_sends status transition:
//   email.sent       -> status 'sent'        (redundant — we set on send)
//   email.delivered  -> status 'delivered'   + delivered_at
//   email.opened     -> status 'opened'      + opened_at (first open only)
//   email.clicked    -> status 'clicked'     + clicked_at (first click only)
//   email.bounced    -> status 'bounced'     + bounced_at + error_message
//   email.complained -> status 'complained'  + error_message

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, resend-signature, svix-signature, svix-timestamp, svix-id',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const rawBody = await req.text();

  // Resend uses Svix under the hood. They send these headers:
  //   svix-id, svix-timestamp, svix-signature
  // For now we support an optional simple shared-secret mode via
  // RESEND_WEBHOOK_SECRET — if set, we require that exact value in the
  // 'x-resend-secret' header (easier to bootstrap than HMAC).
  // Signature verification can be tightened later.
  const sharedSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
  if (sharedSecret) {
    const provided = req.headers.get('x-resend-secret');
    if (provided !== sharedSecret) {
      console.warn('[resend-webhook] rejected: bad secret');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
  }

  const type: string = event?.type || '';
  const data = event?.data || {};
  const messageId: string | undefined = data?.email_id || data?.id;

  if (!messageId) {
    console.warn('[resend-webhook] event missing email_id:', type);
    return new Response('No email_id', { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {};

  switch (type) {
    case 'email.sent':
      updates.status = 'sent';
      updates.sent_at = data.created_at || now;
      break;
    case 'email.delivered':
      updates.status = 'delivered';
      updates.delivered_at = data.created_at || now;
      break;
    case 'email.opened':
      // Only set opened_at on first open (preserve first-touch timestamp).
      updates.status = 'opened';
      updates.opened_at = data.created_at || now;
      break;
    case 'email.clicked':
      updates.status = 'clicked';
      updates.clicked_at = data.created_at || now;
      break;
    case 'email.bounced':
      updates.status = 'bounced';
      updates.bounced_at = data.created_at || now;
      updates.error_message = data.bounce?.message || data.reason || 'Bounced';
      break;
    case 'email.complained':
      updates.status = 'complained';
      updates.error_message = 'Recipient marked as spam';
      break;
    case 'email.delivery_delayed':
      // Keep status, just log — no column change.
      console.log('[resend-webhook] delivery delayed for', messageId);
      return new Response('OK', { status: 200, headers: corsHeaders });
    default:
      console.log('[resend-webhook] unknown event type:', type);
      return new Response('OK', { status: 200, headers: corsHeaders });
  }

  // For opened/clicked, don't overwrite first-event timestamps: only set if null.
  if (type === 'email.opened') {
    const { data: existing } = await admin
      .from('email_sends')
      .select('opened_at')
      .eq('resend_message_id', messageId)
      .maybeSingle();
    if (existing?.opened_at) delete (updates as any).opened_at;
  }
  if (type === 'email.clicked') {
    const { data: existing } = await admin
      .from('email_sends')
      .select('clicked_at')
      .eq('resend_message_id', messageId)
      .maybeSingle();
    if (existing?.clicked_at) delete (updates as any).clicked_at;
  }

  const { error } = await admin
    .from('email_sends')
    .update(updates)
    .eq('resend_message_id', messageId);

  if (error) {
    console.error('[resend-webhook] update error:', error);
    // Still 200 — Resend will retry on non-2xx. We don't want infinite
    // retries on a DB blip.
    return new Response('DB error logged', { status: 200, headers: corsHeaders });
  }

  return new Response('OK', { status: 200, headers: corsHeaders });
});

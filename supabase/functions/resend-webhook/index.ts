// resend-webhook — receive email lifecycle events from Resend.
//
// Resend POSTs events to this function at:
//   https://<project-ref>.supabase.co/functions/v1/resend-webhook
//
// Resend signs each request using Svix HMAC-SHA256. We verify the
// svix-id / svix-timestamp / svix-signature headers against the raw body
// using the RESEND_WEBHOOK_SECRET (starts with whsec_) before trusting
// any event data. Unverified requests are logged and rejected with 401.
//
// Every inbound request (verified or not) is written to webhook_events_log
// for audit and debugging.
//
// Supported event types → email_sends status transition:
//   email.sent       → status 'sent'        (redundant — we set on send)
//   email.delivered  → status 'delivered'   + delivered_at
//   email.opened     → status 'opened'      + opened_at  (first open only)
//   email.clicked    → status 'clicked'     + clicked_at (first click only)
//   email.bounced    → status 'bounced'     + bounced_at + error_message
//   email.complained → status 'complained'  + error_message

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Webhook } from 'https://esm.sh/svix@1.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const rawBody = await req.text();

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Extract Svix signature headers
  const svixId = req.headers.get('svix-id') ?? '';
  const svixTimestamp = req.headers.get('svix-timestamp') ?? '';
  const svixSignature = req.headers.get('svix-signature') ?? '';

  // Source IP (best-effort)
  const sourceIp =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null;

  // ── Svix HMAC verification ────────────────────────────────────────────────────
  const signingSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
  let verificationStatus: 'verified' | 'rejected' | 'skipped' = 'skipped';
  let event: any = null;

  // Pre-parse body for logging (even on rejection)
  try { event = JSON.parse(rawBody); } catch { /* handled below */ }

  if (signingSecret) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.warn('[resend-webhook] rejected: missing Svix headers');
      await logEvent(admin, {
        sourceIp, svixId, svixTimestamp, eventType: event?.type ?? null,
        resendMessageId: event?.data?.email_id ?? null,
        verificationStatus: 'rejected',
        rawPayload: event,
        processingError: 'Missing Svix headers',
      });
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    try {
      const wh = new Webhook(signingSecret);
      // verify() throws if the signature is invalid or timestamp is stale (> 5 min)
      wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
      verificationStatus = 'verified';
    } catch (err) {
      console.warn('[resend-webhook] rejected: Svix verification failed', err);
      await logEvent(admin, {
        sourceIp, svixId, svixTimestamp, eventType: event?.type ?? null,
        resendMessageId: event?.data?.email_id ?? null,
        verificationStatus: 'rejected',
        rawPayload: event,
        processingError: String(err),
      });
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
  } else {
    // No secret configured — accept but flag as skipped (local dev / bootstrapping)
    console.warn('[resend-webhook] RESEND_WEBHOOK_SECRET not set — skipping verification');
    verificationStatus = 'skipped';
  }

  // ── Parse event ───────────────────────────────────────────────────────────────
  if (!event) {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
  }

  const type: string = event?.type || '';
  const data = event?.data || {};
  const messageId: string | undefined = data?.email_id || data?.id;

  // Log every verified / skipped event before processing
  await logEvent(admin, {
    sourceIp, svixId, svixTimestamp, eventType: type,
    resendMessageId: messageId ?? null,
    verificationStatus,
    rawPayload: event,
    processingError: null,
  });

  if (!messageId) {
    console.warn('[resend-webhook] event missing email_id:', type);
    return new Response('No email_id', { status: 200, headers: corsHeaders });
  }

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
      console.log('[resend-webhook] delivery delayed for', messageId);
      return new Response('OK', { status: 200, headers: corsHeaders });
    default:
      console.log('[resend-webhook] unknown event type:', type);
      return new Response('OK', { status: 200, headers: corsHeaders });
  }

  // For opened/clicked: preserve first-touch timestamps — don't overwrite
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
    // Return 200 so Resend doesn't retry indefinitely on a transient DB blip
    return new Response('DB error logged', { status: 200, headers: corsHeaders });
  }

  return new Response('OK', { status: 200, headers: corsHeaders });
});

// ── Audit log helper ──────────────────────────────────────────────────────────
async function logEvent(
  admin: ReturnType<typeof createClient>,
  opts: {
    sourceIp: string | null;
    svixId: string;
    svixTimestamp: string;
    eventType: string | null;
    resendMessageId: string | null;
    verificationStatus: 'verified' | 'rejected' | 'skipped';
    rawPayload: unknown;
    processingError: string | null;
  }
) {
  try {
    await admin.from('webhook_events_log').insert({
      source_ip: opts.sourceIp,
      svix_id: opts.svixId || null,
      svix_timestamp: opts.svixTimestamp || null,
      event_type: opts.eventType,
      resend_message_id: opts.resendMessageId,
      verification_status: opts.verificationStatus,
      raw_payload: opts.rawPayload ? JSON.parse(JSON.stringify(opts.rawPayload)) : null,
      processing_error: opts.processingError,
    });
  } catch (e) {
    // Never let audit logging crash the main flow
    console.error('[resend-webhook] log error:', e);
  }
}

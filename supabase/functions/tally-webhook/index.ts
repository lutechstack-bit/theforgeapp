// Tally webhook receiver.
//
// Flow:
//   1. Tally posts a signed JSON payload here whenever a student submits one
//      of the Forge forms (Premise / First Draft Script / Production Schedule).
//   2. We verify the signature against TALLY_WEBHOOK_SECRET (HMAC-SHA256
//      over the raw body, per https://tally.so/help/webhooks).
//   3. We pull `student_id` from a hidden field the form must carry, map
//      the Tally form ID to our internal form_key, resolve the student's
//      current mentor from mentor_assignments, and INSERT a submissions row.
//   4. The Tally answer payload itself is NOT stored — only the fact of
//      submission + the tally_response_id so the mentor can open it in Tally.
//
// Secrets (`supabase secrets set ...`):
//   - TALLY_WEBHOOK_SECRET : the signing secret you set in Tally's webhook UI.
//   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY are auto-provided in the fn runtime.
//
// Required env to map form IDs → internal keys:
//   - TALLY_FORM_PREMISE    (e.g. "mRE0p9")
//   - TALLY_FORM_SCRIPT     (e.g. "wMobBA")
//   - TALLY_FORM_PRODUCTION (e.g. "q45QEO")

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, tally-signature',
};

type TallyField = {
  key?: string;
  label?: string;
  value?: unknown;
};

type TallyPayload = {
  eventId?: string;
  eventType?: string;
  createdAt?: string;
  data?: {
    formId?: string;
    responseId?: string;
    createdAt?: string;
    fields?: TallyField[];
  };
};

async function verifyTallySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  // Tally sends base64 of the HMAC digest.
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  // Timing-safe-ish compare.
  if (b64.length !== signatureHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < b64.length; i++) diff |= b64.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  return diff === 0;
}

function findStudentId(fields: TallyField[]): string | null {
  const match = fields.find((f) => {
    const k = (f.key ?? '').toLowerCase();
    const l = (f.label ?? '').toLowerCase();
    return k === 'student_id' || l === 'student_id' || l === 'student id';
  });
  const val = match?.value;
  return typeof val === 'string' && val.length > 0 ? val : null;
}

function formKeyFor(formId: string | undefined): string | null {
  if (!formId) return null;
  const map: Record<string, string> = {};
  const pre = Deno.env.get('TALLY_FORM_PREMISE');
  const scr = Deno.env.get('TALLY_FORM_SCRIPT');
  const prd = Deno.env.get('TALLY_FORM_PRODUCTION');
  if (pre) map[pre] = 'premise';
  if (scr) map[scr] = 'script';
  if (prd) map[prd] = 'production';
  return map[formId] ?? null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const rawBody = await req.text();
  const signatureHeader = req.headers.get('tally-signature');
  const secret = Deno.env.get('TALLY_WEBHOOK_SECRET');

  if (!secret) {
    console.error('TALLY_WEBHOOK_SECRET not configured');
    return new Response('Server not configured', { status: 500, headers: corsHeaders });
  }

  const valid = await verifyTallySignature(rawBody, signatureHeader, secret);
  if (!valid) {
    console.warn('Rejected webhook — bad signature');
    return new Response('Invalid signature', { status: 401, headers: corsHeaders });
  }

  let payload: TallyPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Bad JSON', { status: 400, headers: corsHeaders });
  }

  const formId = payload.data?.formId;
  const responseId = payload.data?.responseId;
  const fields = payload.data?.fields ?? [];
  const formKey = formKeyFor(formId);

  if (!formKey) {
    // Unknown form — log and 200 so Tally doesn't keep retrying.
    console.log('Unknown Tally form id, ignoring:', formId);
    return new Response('Unknown form (ignored)', { status: 200, headers: corsHeaders });
  }

  const studentId = findStudentId(fields);
  if (!studentId) {
    console.warn('Missing student_id hidden field on form', formId);
    return new Response('Missing student_id hidden field', { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRole) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    return new Response('Server not configured', { status: 500, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Look up profile + edition.
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('edition_id')
    .eq('id', studentId)
    .maybeSingle();
  if (profErr) {
    console.error('Profile lookup failed', profErr);
    return new Response('Profile lookup failed', { status: 500, headers: corsHeaders });
  }

  // Resolve the current mentor for the student (scoped to their edition if set).
  let mentorUserId: string | null = null;
  {
    let q = supabase
      .from('mentor_assignments')
      .select('mentor_user_id, edition_id')
      .eq('student_user_id', studentId);
    if (profile?.edition_id) q = q.eq('edition_id', profile.edition_id);
    const { data: assignment } = await q.maybeSingle();
    mentorUserId = (assignment?.mentor_user_id as string | undefined) ?? null;
  }

  // Find the previous submission for this form to build the revision chain.
  const { data: prev } = await supabase
    .from('submissions')
    .select('id')
    .eq('student_user_id', studentId)
    .eq('form_key', formKey)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: insertErr } = await supabase.from('submissions').insert({
    student_user_id: studentId,
    mentor_user_id: mentorUserId,
    edition_id: profile?.edition_id ?? null,
    form_key: formKey,
    status: 'pending',
    tally_form_id: formId,
    tally_response_id: responseId,
    tally_submitted_at: payload.data?.createdAt ?? payload.createdAt ?? null,
    revision_of: prev?.id ?? null,
  });

  if (insertErr) {
    // Idempotent: if responseId already recorded, return 200 so Tally stops retrying.
    const msg = insertErr.message || '';
    if (msg.includes('duplicate') || msg.includes('unique constraint')) {
      return new Response('Already processed', { status: 200, headers: corsHeaders });
    }
    console.error('Insert failed', insertErr);
    return new Response('Insert failed: ' + msg, { status: 500, headers: corsHeaders });
  }

  return new Response('OK', { status: 200, headers: corsHeaders });
});

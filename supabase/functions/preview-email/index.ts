// preview-email — admin-only server-side render of a template.
//
// Used by the admin template-edit page to render real merge-tag substitutions
// using actual profile/edition data from the DB (instead of client-side
// guesses). Returns subject + html + any unresolved tag names.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─────────── Merge helpers (duplicate of send-email; keep in sync) ────────
function titleCase(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''; }
function firstName(fn?: string | null) { return fn ? titleCase(fn.trim().split(/\s+/)[0] || '') : ''; }
function lastName(fn?: string | null) { return fn ? fn.trim().split(/\s+/).slice(1).join(' ') : ''; }
function formatDate(iso?: string | null) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}
function daysUntil(iso?: string | null) {
  if (!iso) return '';
  return String(Math.ceil((new Date(iso).getTime() - Date.now()) / (86_400_000)));
}

function buildMergeValues(profile: any, edition: any, overrides?: Record<string, string>) {
  const fullName = profile?.full_name || '';
  return {
    'user.first_name': firstName(fullName),
    'user.last_name': lastName(fullName),
    'user.full_name': fullName,
    'user.email': profile?.email || '',
    'user.phone': profile?.phone || '',
    'user.city': profile?.city || '',
    'user.temp_password': overrides?.temp_password || '[temp_password will be set at send time]',
    'edition.name': edition?.name || '',
    'edition.cohort_type': edition?.cohort_type || '',
    'edition.city': edition?.city || '',
    'edition.forge_start_date': formatDate(edition?.forge_start_date),
    'edition.forge_end_date': formatDate(edition?.forge_end_date),
    'edition.days_until_start': daysUntil(edition?.forge_start_date),
    'app.login_url': 'https://app.forgebylevelup.com/auth',
    'app.name': 'The Forge',
    ...overrides,
  } as Record<string, string | null | undefined>;
}

function resolveMergeTags(template: string, values: Record<string, any>, required: string[]) {
  const unresolvedTags: string[] = [];
  const rendered = template.replace(/\{\{\s*([a-z_.]+)\s*\}\}/gi, (_, key: string) => {
    const v = values[key];
    if (v === undefined || v === null || v === '') {
      if (required.includes(key)) unresolvedTags.push(key);
      return '';
    }
    return String(v);
  });
  return { rendered, unresolvedTags };
}

function extractTags(template: string): string[] {
  const tags = new Set<string>();
  const regex = /\{\{\s*([a-z_.]+)\s*\}\}/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(template)) !== null) tags.add(m[1]);
  return [...tags];
}

// ────────────────────────── Handler ──────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'No authorization header' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callingUser }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !callingUser) return json({ error: 'Unauthorized' }, 401);
    const { data: roles } = await userClient
      .from('user_roles').select('role').eq('user_id', callingUser.id).eq('role', 'admin');
    if (!roles?.length) return json({ error: 'Admin access required' }, 403);

    const body = await req.json();
    const {
      templateId,
      htmlContent: htmlInput,          // optional — allows previewing unsaved edits
      subject: subjectInput,
      testRecipientUserId,
      testVariables,
    }: {
      templateId?: string;
      htmlContent?: string;
      subject?: string;
      testRecipientUserId?: string;
      testVariables?: Record<string, string>;
    } = body;

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Resolve template (if id provided) or fall back to inline html+subject.
    let html = htmlInput;
    let subject = subjectInput;
    if (templateId) {
      const { data: tpl } = await admin
        .from('email_templates')
        .select('subject, html_content')
        .eq('id', templateId)
        .single();
      if (tpl) {
        html = htmlInput ?? tpl.html_content;
        subject = subjectInput ?? tpl.subject;
      }
    }
    if (!html || !subject) return json({ error: 'Nothing to preview' }, 400);

    // Resolve a sample profile for realistic merge values.
    let profile: any = null;
    let edition: any = null;
    if (testRecipientUserId) {
      const { data } = await admin
        .from('profiles')
        .select('id, full_name, email, phone, city, edition_id')
        .eq('id', testRecipientUserId)
        .single();
      profile = data;
    } else {
      // Fallback: first active (non-admin) student we can find so merge
      // tags render with real-shape values instead of blanks.
      const { data } = await admin
        .from('profiles')
        .select('id, full_name, email, phone, city, edition_id')
        .eq('is_admin', false)
        .not('full_name', 'is', null)
        .limit(1)
        .maybeSingle();
      profile = data;
    }
    if (profile?.edition_id) {
      const { data } = await admin
        .from('editions')
        .select('id, name, cohort_type, city, forge_start_date, forge_end_date')
        .eq('id', profile.edition_id)
        .single();
      edition = data;
    }

    const values = buildMergeValues(profile || {}, edition, testVariables);
    const requiredTags = extractTags(`${subject} ${html}`);
    const subjectR = resolveMergeTags(subject, values, requiredTags);
    const htmlR = resolveMergeTags(html, values, requiredTags);

    return json({
      subject: subjectR.rendered,
      htmlContent: htmlR.rendered,
      unresolvedTags: Array.from(new Set([...subjectR.unresolvedTags, ...htmlR.unresolvedTags])),
      usedSampleRecipient: profile ? {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        edition: edition?.name,
      } : null,
    });
  } catch (err) {
    console.error('[preview-email] error:', err);
    return json({ error: 'Internal server error', detail: String(err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

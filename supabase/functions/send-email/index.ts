// send-email — core Resend send primitive.
//
// Admin calls this from the Compose & Send UI. Given a templateId and a list
// of recipients (user IDs, raw emails, or both), we:
//   1. Resolve the target sender identity.
//   2. For each recipient: build merge values from profiles + editions, merge
//      per-recipient overrides on top, render subject+html.
//   3. POST to Resend's /emails API.
//   4. Log one email_sends row per recipient (source of truth).
//
// Failures on individual recipients don't abort the batch — we push the
// reason into `failures[]` and keep going.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ═════════════════════════ Merge tag resolver ═════════════════════════════
// Kept inline because Deno can't import from the Vite app's src/.
// Keep in sync with src/lib/mergeTags.ts.

type MergeValues = Record<string, string | null | undefined>;

function titleCase(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function firstName(fullName?: string | null): string {
  if (!fullName) return '';
  return titleCase(fullName.trim().split(/\s+/)[0] || '');
}

function lastName(fullName?: string | null): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts.slice(1).join(' ');
}

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function daysUntil(iso?: string | null): string {
  if (!iso) return '';
  const target = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return String(days);
}

function buildMergeValues(
  profile: Record<string, unknown>,
  edition: Record<string, unknown> | null,
  overrides?: Record<string, string>
): MergeValues {
  const fullName = (profile?.full_name as string) || '';
  return {
    'user.first_name': firstName(fullName),
    'user.last_name': lastName(fullName),
    'user.full_name': fullName,
    'user.email': (profile?.email as string) || '',
    'user.phone': (profile?.phone as string) || '',
    'user.city': (profile?.city as string) || '',
    'user.temp_password': overrides?.temp_password || '',
    'edition.name': (edition?.name as string) || '',
    'edition.cohort_type': (edition?.cohort_type as string) || '',
    'edition.city': (edition?.city as string) || '',
    'edition.forge_start_date': formatDate(edition?.forge_start_date as string),
    'edition.forge_end_date': formatDate(edition?.forge_end_date as string),
    'edition.days_until_start': daysUntil(edition?.forge_start_date as string),
    'app.login_url': 'https://app.forgebylevelup.com/auth',
    'app.name': 'The Forge',
    ...overrides,
  };
}

/**
 * Resolve `{{ key }}` style tags (key must match `/^[a-z_.]+$/i`).
 * Tags marked "required" in `requiredKeys` that resolve to empty string or
 * are missing entirely cause an error collected in `unresolvedTags`.
 */
function resolveMergeTags(
  template: string,
  values: MergeValues,
  requiredKeys: string[] = []
): { rendered: string; unresolvedTags: string[] } {
  const unresolvedTags: string[] = [];
  const rendered = template.replace(/\{\{\s*([a-z_.]+)\s*\}\}/gi, (match, key) => {
    const value = values[key];
    const isRequired = requiredKeys.includes(key);
    if (value === undefined || value === null || value === '') {
      if (isRequired) unresolvedTags.push(key);
      return '';
    }
    return String(value);
  });
  return { rendered, unresolvedTags };
}

/**
 * Extract every `{{ key }}` the template body references — used to auto-detect
 * which tags are "required" for a given template.
 */
function extractTags(template: string): string[] {
  const tags = new Set<string>();
  const regex = /\{\{\s*([a-z_.]+)\s*\}\}/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(template)) !== null) tags.add(m[1]);
  return Array.from(tags);
}

// ═════════════════════════ Handler ═════════════════════════════
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'No authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return json({ error: 'RESEND_API_KEY not configured' }, 500);

    // Admin auth gate — copied from create-user pattern.
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callingUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !callingUser) return json({ error: 'Unauthorized' }, 401);

    const { data: roles } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .eq('role', 'admin');
    if (!roles || roles.length === 0) return json({ error: 'Admin access required' }, 403);

    // Body --------------------------------------------------------------
    const body = await req.json();
    const {
      templateId,
      recipientUserIds = [],
      recipientEmails = [],
      overrides = {},
    }: {
      templateId: string;
      recipientUserIds?: string[];
      recipientEmails?: string[];
      overrides?: {
        senderId?: string;
        subject?: string;
        perRecipientVariables?: Record<string, Record<string, string>>;
      };
    } = body;

    if (!templateId) return json({ error: 'templateId is required' }, 400);
    if (recipientUserIds.length === 0 && recipientEmails.length === 0) {
      return json({ error: 'At least one recipient (user id or email) is required' }, 400);
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Load template + sender identity
    const { data: template, error: tplErr } = await admin
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    if (tplErr || !template) return json({ error: 'Template not found' }, 404);
    if (!template.is_active) return json({ error: 'Template is inactive' }, 400);

    const senderId = overrides.senderId || template.default_sender_id;
    if (!senderId) return json({ error: 'No sender identity configured for this template' }, 400);
    const { data: sender, error: sndErr } = await admin
      .from('email_sender_identities')
      .select('*')
      .eq('id', senderId)
      .single();
    if (sndErr || !sender) return json({ error: 'Sender identity not found' }, 404);
    if (!sender.is_active) return json({ error: 'Sender identity is inactive' }, 400);

    // Resolve all recipients to a unified shape ------------------------
    type Recipient = {
      email: string;
      userId: string | null;
      profile: Record<string, unknown> | null;
      edition: Record<string, unknown> | null;
    };
    const recipients: Recipient[] = [];

    if (recipientUserIds.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, full_name, email, phone, city, edition_id')
        .in('id', recipientUserIds);
      const editionIds = [
        ...new Set((profiles || []).map(p => p.edition_id).filter(Boolean)),
      ] as string[];
      const editionsById: Record<string, Record<string, unknown>> = {};
      if (editionIds.length > 0) {
        const { data: editions } = await admin
          .from('editions')
          .select('id, name, cohort_type, city, forge_start_date, forge_end_date')
          .in('id', editionIds);
        for (const e of editions || []) editionsById[e.id] = e;
      }
      for (const p of profiles || []) {
        recipients.push({
          email: (p.email as string) || '',
          userId: p.id as string,
          profile: p,
          edition: p.edition_id ? editionsById[p.edition_id as string] || null : null,
        });
      }
    }

    // Raw emails — no profile, no merge context.
    for (const email of recipientEmails) {
      if (!email) continue;
      recipients.push({ email, userId: null, profile: null, edition: null });
    }

    const requiredTags = extractTags(`${template.subject} ${template.html_content}`);

    // Sequential loop to respect Resend's 10 req/sec free-tier cap. We can
    // swap for Promise.all batching once we upgrade the plan.
    const successes: Array<{ email: string; messageId: string }> = [];
    const failures: Array<{ recipient: string; reason: string }> = [];

    for (const rec of recipients) {
      try {
        if (!rec.email) {
          failures.push({ recipient: rec.userId || 'unknown', reason: 'No email on profile' });
          await admin.from('email_sends').insert({
            template_id: template.id,
            template_version: template.current_version,
            sender_identity_id: sender.id,
            recipient_email: '',
            recipient_user_id: rec.userId,
            status: 'failed',
            error_message: 'No email on profile',
            trigger_type: 'manual',
          });
          continue;
        }

        // Per-recipient overrides keyed by userId OR email
        const perRecipient =
          overrides.perRecipientVariables?.[rec.userId as string] ||
          overrides.perRecipientVariables?.[rec.email] ||
          {};

        const values = buildMergeValues(rec.profile || {}, rec.edition, perRecipient);
        const subject = overrides.subject || template.subject;
        const subjectResolved = resolveMergeTags(subject, values, requiredTags);
        const htmlResolved = resolveMergeTags(template.html_content, values, requiredTags);

        const allUnresolved = Array.from(
          new Set([...subjectResolved.unresolvedTags, ...htmlResolved.unresolvedTags])
        );
        if (allUnresolved.length > 0) {
          const reason = `Unresolved merge tags: ${allUnresolved.join(', ')}`;
          failures.push({ recipient: rec.email, reason });
          await admin.from('email_sends').insert({
            template_id: template.id,
            template_version: template.current_version,
            sender_identity_id: sender.id,
            recipient_email: rec.email,
            recipient_user_id: rec.userId,
            status: 'failed',
            error_message: reason,
            variables_used: values,
            trigger_type: 'manual',
          });
          continue;
        }

        const fromAddress = `${sender.display_name} <${sender.email}>`;
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [rec.email],
            subject: subjectResolved.rendered,
            html: htmlResolved.rendered,
            reply_to: sender.reply_to_email || sender.email,
            headers: {
              'X-Template-Id': template.id,
              'X-Template-Slug': template.slug,
            },
          }),
        });

        const resendBody = await resendRes.json();
        if (!resendRes.ok) {
          const reason = resendBody?.message || resendBody?.error || `HTTP ${resendRes.status}`;
          failures.push({ recipient: rec.email, reason });
          await admin.from('email_sends').insert({
            template_id: template.id,
            template_version: template.current_version,
            sender_identity_id: sender.id,
            recipient_email: rec.email,
            recipient_user_id: rec.userId,
            status: 'failed',
            error_message: reason,
            variables_used: values,
            subject_rendered: subjectResolved.rendered,
            trigger_type: 'manual',
          });
          continue;
        }

        successes.push({ email: rec.email, messageId: resendBody.id });
        await admin.from('email_sends').insert({
          template_id: template.id,
          template_version: template.current_version,
          sender_identity_id: sender.id,
          recipient_email: rec.email,
          recipient_user_id: rec.userId,
          variables_used: values,
          subject_rendered: subjectResolved.rendered,
          resend_message_id: resendBody.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
          trigger_type: 'manual',
        });

        // Gentle throttle — Resend free tier is 10 req/sec.
        await new Promise((r) => setTimeout(r, 110));
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'Unknown error';
        failures.push({ recipient: rec.email || rec.userId || 'unknown', reason });
      }
    }

    return json({
      successCount: successes.length,
      failureCount: failures.length,
      successes,
      failures,
    });
  } catch (err) {
    console.error('[send-email] unexpected error:', err);
    return json({ error: 'Internal server error', detail: String(err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// forge-onboard-student — auto-onboards students from Google Sheet automation.
//
// Auth model (dual):
//   • Google Sheet / cron: pass `x-forge-secret: <FORGE_AUTOMATION_SECRET>` header.
//   • Manual admin trigger: pass a valid admin JWT as `Authorization: Bearer <token>`.
//
// Flow:
//   1. Authenticate caller (sheet secret OR admin JWT).
//   2. Load onboarding_automation_config; bail early if disabled.
//   3. Validate + deduplicate student data.
//   4. Resolve product → edition via product_mappings in config.
//   5. Create auth account + update profile (idempotent — resets pw if user exists).
//   6. Generate magic link / temp password and send welcome email.
//   7. Log every outcome to onboarding_automation_logs.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-forge-secret',
};

// ═══════════════════════ Types ════════════════════════════════════════════════

interface StudentData {
  student_id: string;
  email: string;
  full_name: string;
  phone?: string;
  city?: string;
  batch?: string;
  product: string;
  payment_amount?: number;
}

interface ProductMapping {
  product: string;
  edition_id: string;
  edition_name: string;
  cohort_type: string;
  is_active: boolean;
}

interface AutomationConfig {
  id: string;
  is_enabled: boolean;
  min_payment: number;
  product_mappings: ProductMapping[];
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notification_email: string | null;
}

// ═══════════════════════ Helpers ═════════════════════════════════════════════

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Generates a random 10-char alphanumeric temp password. */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ═══════════════════════ Logging helper ══════════════════════════════════════

async function logOnboardingAttempt(
  supabase: ReturnType<typeof createClient>,
  studentData: Partial<StudentData>,
  edition: Record<string, unknown> | null,
  result: {
    status: 'success' | 'failed' | 'duplicate' | 'skipped';
    error_message?: string;
    error_details?: unknown;
    created_user_id?: string;
    created_profile_id?: string;
    email_sent?: boolean;
    email_message_id?: string;
    trigger_source?: 'google_sheet' | 'manual_admin';
    triggered_by?: string | null;
  }
) {
  try {
    await supabase.from('onboarding_automation_logs').insert({
      student_id: studentData.student_id || null,
      student_name: studentData.full_name || null,
      student_email: studentData.email || null,
      student_phone: studentData.phone || null,
      sheet_product: studentData.product || null,
      sheet_batch: studentData.batch || null,
      payment_amount: studentData.payment_amount ?? null,
      matched_edition_id: edition?.id ?? null,
      matched_edition_name: edition?.name ?? null,
      matched_cohort_type: edition?.cohort_type ?? null,
      status: result.status,
      error_message: result.error_message ?? null,
      error_details: result.error_details ?? null,
      created_user_id: result.created_user_id ?? null,
      created_profile_id: result.created_profile_id ?? null,
      email_sent: result.email_sent ?? false,
      email_message_id: result.email_message_id ?? null,
      trigger_source: result.trigger_source ?? 'google_sheet',
      triggered_by: result.triggered_by ?? null,
    });
    console.log(`📝 Logged onboarding attempt: ${result.status}`);
  } catch (err) {
    // Never let a logging failure block the main flow.
    console.error('❌ Failed to log onboarding attempt:', err);
  }
}

// ═══════════════════════ Input validation ════════════════════════════════════

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStudentData(body: Record<string, unknown>): { data: StudentData; error: string | null } {
  const email = (body.email as string | undefined)?.trim().toLowerCase() || '';
  const full_name = (body.full_name as string | undefined)?.trim() || '';
  const product = (body.product as string | undefined)?.trim() || '';
  const student_id = (body.student_id as string | undefined)?.trim() || '';

  if (!student_id) return { data: {} as StudentData, error: 'student_id is required' };
  if (!email || !EMAIL_RE.test(email)) return { data: {} as StudentData, error: 'Valid email is required' };
  if (!full_name) return { data: {} as StudentData, error: 'full_name is required' };
  if (!product) return { data: {} as StudentData, error: 'product is required' };

  return {
    data: {
      student_id,
      email,
      full_name,
      phone: (body.phone as string | undefined)?.trim() || undefined,
      city: (body.city as string | undefined)?.trim() || undefined,
      batch: (body.batch as string | undefined)?.trim() || undefined,
      product,
      payment_amount: body.payment_amount != null ? Number(body.payment_amount) : 15000,
    },
    error: null,
  };
}

// ═══════════════════════ Main handler ════════════════════════════════════════

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const automationSecret = Deno.env.get('FORGE_AUTOMATION_SECRET');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    // ── Auth gate ─────────────────────────────────────────────────────────
    // Accept either:
    //   (a) x-forge-secret header  →  Google Sheet / cron automation
    //   (b) valid admin JWT         →  Manual admin trigger from the app
    let triggerSource: 'google_sheet' | 'manual_admin' = 'google_sheet';
    let triggeredBy: string | null = null;

    const forgeSecret = req.headers.get('x-forge-secret');
    const authHeader = req.headers.get('Authorization');

    if (forgeSecret) {
      // Path (a): sheet automation secret
      if (!automationSecret || forgeSecret !== automationSecret) {
        return json({ error: 'Invalid automation secret' }, 401);
      }
      triggerSource = 'google_sheet';
    } else if (authHeader) {
      // Path (b): admin JWT
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

      triggerSource = 'manual_admin';
      triggeredBy = callingUser.id;
    } else {
      return json({ error: 'Authentication required (x-forge-secret or Authorization header)' }, 401);
    }

    // ── Service-role client for all privileged DB operations ─────────────
    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Load automation config ────────────────────────────────────────────
    const { data: config, error: configErr } = await admin
      .from('onboarding_automation_config')
      .select('*')
      .single() as { data: AutomationConfig | null; error: unknown };

    if (configErr || !config) {
      console.error('❌ Failed to load automation config:', configErr);
      return json({ error: 'Automation configuration not found' }, 500);
    }

    if (!config.is_enabled) {
      console.log('⏸️  Automation is disabled');
      return json({ message: 'Automation is currently disabled', automation_enabled: false }, 200);
    }

    // ── Parse + validate request body ─────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const { data: studentData, error: validationError } = validateStudentData(body);
    if (validationError) {
      return json({ error: validationError }, 400);
    }

    console.log(`📋 Processing student: ${studentData.email} | product: ${studentData.product}`);

    // ── Duplicate check ───────────────────────────────────────────────────
    // Check if a user with this email already has a profile linked to an edition.
    const { data: existingProfiles } = await admin
      .from('profiles')
      .select('id, full_name, edition_id')
      .eq('email', studentData.email)
      .not('edition_id', 'is', null);

    if (existingProfiles && existingProfiles.length > 0) {
      console.log(`⚠️  Duplicate — ${studentData.email} already has an edition assigned`);
      await logOnboardingAttempt(admin, studentData, null, {
        status: 'duplicate',
        error_message: 'Account already exists with an edition assigned',
        created_user_id: existingProfiles[0].id,
        trigger_source: triggerSource,
        triggered_by: triggeredBy,
      });
      return json({
        message: 'Student already onboarded',
        status: 'duplicate',
        user_id: existingProfiles[0].id,
      }, 200);
    }

    // ── Resolve product → edition via config product_mappings ──────────────
    const productMappings = (config.product_mappings || []) as ProductMapping[];
    const mapping = productMappings.find(
      (m) => m.product === studentData.product && m.is_active
    );

    if (!mapping) {
      console.warn(`⚠️  No active mapping for product: ${studentData.product}`);
      await logOnboardingAttempt(admin, studentData, null, {
        status: 'skipped',
        error_message: `No active mapping found for product: ${studentData.product}`,
        trigger_source: triggerSource,
        triggered_by: triggeredBy,
      });
      return json({
        error: `No edition mapping configured for product: ${studentData.product}`,
        hint: 'Configure product mappings in Admin → Automation → Product Mapping',
      }, 400);
    }

    // Verify the mapped edition still exists in DB.
    const { data: edition, error: editionErr } = await admin
      .from('editions')
      .select('id, name, cohort_type, city, forge_start_date, forge_end_date')
      .eq('id', mapping.edition_id)
      .single();

    if (editionErr || !edition) {
      console.error(`❌ Mapped edition not found: ${mapping.edition_id}`);
      await logOnboardingAttempt(admin, studentData, null, {
        status: 'failed',
        error_message: `Edition not found: ${mapping.edition_id}`,
        trigger_source: triggerSource,
        triggered_by: triggeredBy,
      });
      return json({
        error: 'Mapped edition not found in database',
        edition_id: mapping.edition_id,
      }, 404);
    }

    console.log(`✅ Mapped product ${studentData.product} → Edition: ${edition.name}`);

    // ── Create auth user (idempotent) ─────────────────────────────────────
    const tempPassword = generateTempPassword();

    let userId: string | null = null;
    let userAction: 'created' | 'updated' = 'created';

    const { data: authData, error: createError } = await admin.auth.admin.createUser({
      email: studentData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: studentData.full_name },
    });

    if (createError) {
      const msg = (createError.message || '').toLowerCase();
      const alreadyExists =
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('duplicate') ||
        (createError as { status?: number }).status === 422;

      if (!alreadyExists) {
        console.error('❌ createUser error:', createError);
        await logOnboardingAttempt(admin, studentData, edition, {
          status: 'failed',
          error_message: createError.message,
          error_details: { code: (createError as { status?: number }).status },
          trigger_source: triggerSource,
          triggered_by: triggeredBy,
        });
        return json({ error: createError.message || 'Failed to create user account' }, 400);
      }

      // User already exists — reset password + re-sync.
      console.log(`♻️  User exists, resetting password for ${studentData.email}`);
      let foundId: string | null = null;
      const perPage = 1000;
      for (let page = 1; page <= 10 && !foundId; page++) {
        const { data: list } = await admin.auth.admin.listUsers({ page, perPage });
        const match = (list?.users || []).find(
          (u) => (u.email || '').toLowerCase() === studentData.email.toLowerCase()
        );
        if (match) foundId = match.id;
        if ((list?.users || []).length < perPage) break;
      }

      if (!foundId) {
        await logOnboardingAttempt(admin, studentData, edition, {
          status: 'failed',
          error_message: 'User exists but could not be located by email',
          trigger_source: triggerSource,
          triggered_by: triggeredBy,
        });
        return json({ error: 'User exists but lookup failed' }, 500);
      }

      const { error: updateErr } = await admin.auth.admin.updateUserById(foundId, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: studentData.full_name },
      });
      if (updateErr) {
        await logOnboardingAttempt(admin, studentData, edition, {
          status: 'failed',
          error_message: updateErr.message,
          trigger_source: triggerSource,
          triggered_by: triggeredBy,
        });
        return json({ error: 'Could not reset password: ' + updateErr.message }, 500);
      }

      userId = foundId;
      userAction = 'updated';
    } else {
      userId = authData.user.id;
    }

    // ── Update profile ─────────────────────────────────────────────────────
    const { error: profileError } = await admin
      .from('profiles')
      .update({
        full_name: studentData.full_name,
        phone: studentData.phone ?? null,
        city: studentData.city ?? null,
        edition_id: edition.id,
        payment_status: 'CONFIRMED_15K',
        unlock_level: 'PREVIEW',
        profile_setup_completed: false, // student completes this after login
      })
      .eq('id', userId);

    if (profileError) {
      console.error('⚠️  Profile update error (non-fatal):', profileError);
    }

    // ── Send welcome email via Resend (if API key is available) ───────────
    let emailSent = false;
    let emailMessageId: string | undefined;

    if (resendApiKey) {
      try {
        // Find the welcome/onboarding template from email_templates.
        const { data: template } = await admin
          .from('email_templates')
          .select('id, subject, html_content, default_sender_id, slug')
          .eq('slug', 'student-welcome')
          .eq('is_active', true)
          .single();

        if (template && template.default_sender_id) {
          const { data: sender } = await admin
            .from('email_sender_identities')
            .select('display_name, email, reply_to_email')
            .eq('id', template.default_sender_id)
            .eq('is_active', true)
            .single();

          if (sender) {
            // Simple merge tag resolution for welcome email.
            const formatDate = (iso: string | null) => {
              if (!iso) return '';
              try {
                return new Date(iso).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                });
              } catch { return iso; }
            };

            const mergeTags: Record<string, string> = {
              'user.first_name': studentData.full_name.trim().split(/\s+/)[0] || studentData.full_name,
              'user.full_name': studentData.full_name,
              'user.email': studentData.email,
              'user.temp_password': tempPassword,
              'edition.name': edition.name || '',
              'edition.cohort_type': edition.cohort_type || '',
              'edition.city': edition.city || '',
              'edition.forge_start_date': formatDate(edition.forge_start_date),
              'edition.forge_end_date': formatDate(edition.forge_end_date),
              'app.login_url': 'https://app.forgebylevelup.com/auth',
              'app.name': 'The Forge',
            };

            const resolve = (tmpl: string) =>
              tmpl.replace(/\{\{\s*([a-z_.]+)\s*\}\}/gi, (_, k) => mergeTags[k] ?? '');

            const resendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: `${sender.display_name} <${sender.email}>`,
                to: [studentData.email],
                subject: resolve(template.subject),
                html: resolve(template.html_content),
                reply_to: sender.reply_to_email || sender.email,
                headers: {
                  'X-Template-Slug': template.slug,
                  'List-Unsubscribe': `<mailto:unsubscribe@leveluplearning.in?subject=unsubscribe&body=${encodeURIComponent(studentData.email)}>`,
                  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                },
              }),
            });

            const resendBody = await resendRes.json();
            if (resendRes.ok) {
              emailSent = true;
              emailMessageId = resendBody.id;
              console.log(`📧 Welcome email sent → ${studentData.email} (${resendBody.id})`);
            } else {
              console.error('⚠️  Resend error (non-fatal):', resendBody);
            }

            // Log to email_sends for audit trail.
            await admin.from('email_sends').insert({
              template_id: template.id,
              template_version: 1,
              sender_identity_id: template.default_sender_id,
              recipient_email: studentData.email,
              recipient_user_id: userId,
              variables_used: mergeTags,
              subject_rendered: resolve(template.subject),
              resend_message_id: emailMessageId ?? null,
              status: emailSent ? 'sent' : 'failed',
              sent_at: emailSent ? new Date().toISOString() : null,
              trigger_type: 'automated',
            });
          }
        } else {
          console.log('ℹ️  No active student-welcome template found — skipping email');
        }
      } catch (emailErr) {
        // Email failure is non-fatal — student can be sent credentials manually.
        console.error('⚠️  Email send failed (non-fatal):', emailErr);
      }
    } else {
      console.log('ℹ️  RESEND_API_KEY not set — skipping email');
    }

    // ── Log success ────────────────────────────────────────────────────────
    await logOnboardingAttempt(admin, studentData, edition, {
      status: 'success',
      created_user_id: userId!,
      created_profile_id: userId!,
      email_sent: emailSent,
      email_message_id: emailMessageId,
      trigger_source: triggerSource,
      triggered_by: triggeredBy,
    });

    console.log(`🎉 Onboarded ${studentData.full_name} (${studentData.email}) → ${edition.name} [${userAction}]`);

    return json({
      success: true,
      status: 'success',
      action: userAction,
      user_id: userId,
      edition: {
        id: edition.id,
        name: edition.name,
        cohort_type: edition.cohort_type,
      },
      email_sent: emailSent,
      message: userAction === 'created'
        ? 'Student account created and onboarded successfully'
        : 'Existing account updated and linked to edition',
    });
  } catch (err) {
    console.error('[forge-onboard-student] unexpected error:', err);
    return json({
      error: 'Internal server error',
      detail: err instanceof Error ? err.message : String(err),
    }, 500);
  }
});

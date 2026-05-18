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
//      If no mapping exists BUT edition details are provided in the payload,
//      auto-create the edition + save the mapping (first-entry auto-provision).
//   5. Create auth account + update profile (idempotent — resets pw if user exists).
//   6. Send welcome email via Resend.
//   7. Log every outcome to onboarding_automation_logs.
//
// Sheet columns for auto-edition creation (only needed for first student of a new edition):
//   edition_name      e.g. "Forge Filmmaking - Edition 15 - Mumbai"
//   edition_city      e.g. "Mumbai"
//   cohort_type       e.g. "FORGE" | "FORGE_CREATORS" | "FORGE_WRITING"
//   forge_start_date  e.g. "2026-07-01"  (optional)
//   forge_end_date    e.g. "2026-07-14"  (optional)
//   online_start_date e.g. "2026-06-01"  (optional)
//   online_end_date   e.g. "2026-06-30"  (optional)

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
  // Edition auto-creation fields (only needed for first student of a new edition)
  edition_name?: string;
  edition_city?: string;
  cohort_type?: string;
  forge_start_date?: string;
  forge_end_date?: string;
  online_start_date?: string;
  online_end_date?: string;
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
    console.log(`📝 Logged: ${result.status}`);
  } catch (err) {
    console.error('❌ Log failed (non-fatal):', err);
  }
}

// ═══════════════════════ Input validation ════════════════════════════════════

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_COHORT_TYPES = ['FORGE', 'FORGE_CREATORS', 'FORGE_WRITING'];

function validateStudentData(body: Record<string, unknown>): { data: StudentData; error: string | null } {
  const email = (body.email as string | undefined)?.trim().toLowerCase() || '';
  const full_name = (body.full_name as string | undefined)?.trim() || '';
  const product = (body.product as string | undefined)?.trim() || '';
  const student_id = (body.student_id as string | undefined)?.trim() || '';

  if (!student_id) return { data: {} as StudentData, error: 'student_id is required' };
  if (!email || !EMAIL_RE.test(email)) return { data: {} as StudentData, error: 'Valid email is required' };
  if (!full_name) return { data: {} as StudentData, error: 'full_name is required' };
  if (!product) return { data: {} as StudentData, error: 'product is required' };

  // Validate cohort_type if provided
  const cohort_type = (body.cohort_type as string | undefined)?.trim().toUpperCase();
  if (cohort_type && !VALID_COHORT_TYPES.includes(cohort_type)) {
    return {
      data: {} as StudentData,
      error: `cohort_type must be one of: ${VALID_COHORT_TYPES.join(', ')}`,
    };
  }

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
      // Edition auto-creation fields
      edition_name: (body.edition_name as string | undefined)?.trim() || undefined,
      edition_city: (body.edition_city as string | undefined)?.trim() || undefined,
      cohort_type: cohort_type || undefined,
      forge_start_date: (body.forge_start_date as string | undefined)?.trim() || undefined,
      forge_end_date: (body.forge_end_date as string | undefined)?.trim() || undefined,
      online_start_date: (body.online_start_date as string | undefined)?.trim() || undefined,
      online_end_date: (body.online_end_date as string | undefined)?.trim() || undefined,
    },
    error: null,
  };
}

// ═══════════════════════ Auto-provision edition + mapping ═════════════════════
//
// Called when no active product mapping exists for studentData.product but the
// sheet row includes enough fields to create one (edition_name + edition_city +
// cohort_type at minimum).  Returns the newly-created (or pre-existing) edition.

async function autoProvisionEdition(
  admin: ReturnType<typeof createClient>,
  config: AutomationConfig,
  studentData: StudentData
): Promise<{ edition: Record<string, unknown> | null; error: string | null }> {
  const { edition_name, edition_city, cohort_type, product } = studentData;

  if (!edition_name || !edition_city || !cohort_type) {
    return {
      edition: null,
      error: `No active mapping for product "${product}" and no edition details provided. ` +
        'Add edition_name, edition_city, and cohort_type columns to the sheet for auto-provisioning.',
    };
  }

  console.log(`🏗️  Auto-provisioning edition "${edition_name}" for product "${product}"…`);

  // ── Step 1: Check if an edition with this name already exists ─────────
  const { data: existingEditions } = await admin
    .from('editions')
    .select('*')
    .eq('name', edition_name)
    .limit(1);

  let edition: Record<string, unknown>;

  if (existingEditions && existingEditions.length > 0) {
    edition = existingEditions[0];
    console.log(`♻️  Edition already exists: ${edition.id} — reusing`);
  } else {
    // ── Step 2: Create the edition ─────────────────────────────────────
    const insertPayload: Record<string, unknown> = {
      name: edition_name,
      city: edition_city,
      cohort_type,
      is_archived: false,
    };
    if (studentData.forge_start_date) insertPayload.forge_start_date = studentData.forge_start_date;
    if (studentData.forge_end_date) insertPayload.forge_end_date = studentData.forge_end_date;
    if (studentData.online_start_date) insertPayload.online_start_date = studentData.online_start_date;
    if (studentData.online_end_date) insertPayload.online_end_date = studentData.online_end_date;

    const { data: newEdition, error: editionErr } = await admin
      .from('editions')
      .insert(insertPayload)
      .select('*')
      .single();

    if (editionErr || !newEdition) {
      return { edition: null, error: `Failed to create edition: ${editionErr?.message}` };
    }

    edition = newEdition;
    console.log(`✅ Edition created: ${edition.id} — ${edition_name}`);
  }

  // ── Step 3: Save the product mapping so subsequent students skip this step ─
  const newMapping: ProductMapping = {
    product,
    edition_id: edition.id as string,
    edition_name: edition.name as string,
    cohort_type: edition.cohort_type as string,
    is_active: true,
  };

  const existingMappings = (config.product_mappings || []) as ProductMapping[];
  // Replace stale mapping for same product if any, otherwise append.
  const updatedMappings = [
    ...existingMappings.filter((m) => m.product !== product),
    newMapping,
  ];

  const { error: cfgErr } = await admin
    .from('onboarding_automation_config')
    .update({
      product_mappings: updatedMappings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', config.id);

  if (cfgErr) {
    console.error('⚠️  Mapping save failed (non-fatal):', cfgErr);
    // Don't abort — edition is created, student can still be onboarded.
  } else {
    console.log(`🗺️  Mapping saved: ${product} → ${edition_name}`);
  }

  return { edition, error: null };
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
    let triggerSource: 'google_sheet' | 'manual_admin' = 'google_sheet';
    let triggeredBy: string | null = null;

    const forgeSecret = req.headers.get('x-forge-secret');
    const authHeader = req.headers.get('Authorization');

    if (forgeSecret) {
      if (!automationSecret || forgeSecret !== automationSecret) {
        return json({ error: 'Invalid automation secret' }, 401);
      }
      triggerSource = 'google_sheet';
    } else if (authHeader) {
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

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Load automation config ────────────────────────────────────────────
    const { data: config, error: configErr } = await admin
      .from('onboarding_automation_config')
      .select('*')
      .single() as { data: AutomationConfig | null; error: unknown };

    if (configErr || !config) {
      return json({ error: 'Automation configuration not found' }, 500);
    }

    if (!config.is_enabled) {
      return json({ message: 'Automation is currently disabled', automation_enabled: false }, 200);
    }

    // ── Parse + validate body ─────────────────────────────────────────────
    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

    const { data: studentData, error: validationError } = validateStudentData(body);
    if (validationError) return json({ error: validationError }, 400);

    console.log(`📋 Processing: ${studentData.email} | product: ${studentData.product}`);

    // ── Duplicate check ───────────────────────────────────────────────────
    const { data: existingProfiles } = await admin
      .from('profiles')
      .select('id, full_name, edition_id')
      .eq('email', studentData.email)
      .not('edition_id', 'is', null);

    if (existingProfiles && existingProfiles.length > 0) {
      console.log(`⚠️  Duplicate: ${studentData.email}`);
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

    // ── Resolve product → edition ─────────────────────────────────────────
    // First try existing product_mappings in config.
    const productMappings = (config.product_mappings || []) as ProductMapping[];
    const existingMapping = productMappings.find(
      (m) => m.product === studentData.product && m.is_active
    );

    let edition: Record<string, unknown> | null = null;

    if (existingMapping) {
      // Happy path — mapping already exists, just verify edition is still in DB.
      const { data: dbEdition, error: editionErr } = await admin
        .from('editions')
        .select('id, name, cohort_type, city, forge_start_date, forge_end_date')
        .eq('id', existingMapping.edition_id)
        .single();

      if (editionErr || !dbEdition) {
        // Mapping points to a deleted edition — fall through to auto-provision.
        console.warn(`⚠️  Mapped edition ${existingMapping.edition_id} not found — will auto-provision`);
      } else {
        edition = dbEdition;
        console.log(`✅ Mapped: ${studentData.product} → ${edition.name}`);
      }
    }

    if (!edition) {
      // No valid mapping — try to auto-provision from sheet data.
      const { edition: provisioned, error: provisionErr } = await autoProvisionEdition(
        admin, config, studentData
      );

      if (provisionErr || !provisioned) {
        await logOnboardingAttempt(admin, studentData, null, {
          status: 'skipped',
          error_message: provisionErr ?? 'Could not resolve or create edition',
          trigger_source: triggerSource,
          triggered_by: triggeredBy,
        });
        return json({ error: provisionErr ?? 'Edition not found', status: 'skipped' }, 400);
      }

      edition = provisioned;
    }

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
        await logOnboardingAttempt(admin, studentData, edition, {
          status: 'failed',
          error_message: createError.message,
          trigger_source: triggerSource,
          triggered_by: triggeredBy,
        });
        return json({ error: createError.message }, 400);
      }

      // Reset existing user's password.
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
          error_message: 'User exists but lookup failed',
          trigger_source: triggerSource,
          triggered_by: triggeredBy,
        });
        return json({ error: 'User exists but lookup failed' }, 500);
      }

      await admin.auth.admin.updateUserById(foundId, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: studentData.full_name },
      });

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
        profile_setup_completed: false,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('⚠️  Profile update error (non-fatal):', profileError);
    }

    // ── Send welcome email ─────────────────────────────────────────────────
    let emailSent = false;
    let emailMessageId: string | undefined;

    if (resendApiKey) {
      try {
        const { data: template } = await admin
          .from('email_templates')
          .select('id, subject, html_content, default_sender_id, slug, current_version')
          .eq('slug', 'student-welcome')
          .eq('is_active', true)
          .single();

        if (template?.default_sender_id) {
          const { data: sender } = await admin
            .from('email_sender_identities')
            .select('display_name, email, reply_to_email')
            .eq('id', template.default_sender_id)
            .eq('is_active', true)
            .single();

          if (sender) {
            const formatDate = (iso: string | null) => {
              if (!iso) return '';
              try {
                return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              } catch { return iso; }
            };

            const mergeTags: Record<string, string> = {
              'user.first_name': studentData.full_name.trim().split(/\s+/)[0] || studentData.full_name,
              'user.full_name': studentData.full_name,
              'user.email': studentData.email,
              'user.temp_password': tempPassword,
              'edition.name': (edition.name as string) || '',
              'edition.cohort_type': (edition.cohort_type as string) || '',
              'edition.city': (edition.city as string) || '',
              'edition.forge_start_date': formatDate(edition.forge_start_date as string),
              'edition.forge_end_date': formatDate(edition.forge_end_date as string),
              'app.login_url': 'https://app.forgebylevelup.com/auth',
              'app.name': 'The Forge',
            };

            const resolve = (tmpl: string) =>
              tmpl.replace(/\{\{\s*([a-z_.]+)\s*\}\}/gi, (_, k) => mergeTags[k] ?? '');

            const resendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
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
              console.log(`📧 Welcome email sent → ${studentData.email}`);
            } else {
              console.error('⚠️  Resend error:', resendBody);
            }

            await admin.from('email_sends').insert({
              template_id: template.id,
              template_version: template.current_version ?? 1,
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
        }
      } catch (emailErr) {
        console.error('⚠️  Email error (non-fatal):', emailErr);
      }
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

    console.log(`🎉 Onboarded ${studentData.full_name} → ${edition.name} [${userAction}]`);

    return json({
      success: true,
      status: 'success',
      action: userAction,
      user_id: userId,
      edition: { id: edition.id, name: edition.name, cohort_type: edition.cohort_type },
      edition_created: !existingMapping,
      email_sent: emailSent,
      message: userAction === 'created'
        ? 'Student account created and onboarded successfully'
        : 'Existing account updated and linked to edition',
    });
  } catch (err) {
    console.error('[forge-onboard-student] unexpected error:', err);
    return json({ error: 'Internal server error', detail: err instanceof Error ? err.message : String(err) }, 500);
  }
});

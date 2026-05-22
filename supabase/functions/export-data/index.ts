import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_TABLES = new Set<string>([
  "alumni_showcase",
  "alumni_testimonials",
  "announcement_triggers",
  "announcements",
  "app_changelog",
  "app_doc_versions",
  "app_feature_flags",
  "city_groups",
  "cohort_groups",
  "collaborator_occupations",
  "collaborator_profiles",
  "collaborator_works",
  "community_highlights",
  "community_messages",
  "doubt_replies",
  "doubts",
  "editions",
  "email_audience_members",
  "email_audiences",
  "email_sender_identities",
  "email_sends",
  "email_template_versions",
  "email_templates",
  "equipment_items",
  "event_registrations",
  "event_types",
  "events",
  "explore_programs",
  "forge_equipment",
  "gigs",
  "hero_banners",
  "home_cards",
  "homepage_content",
  "homepage_hero_slides",
  "homepage_sections",
  "journey_stages",
  "journey_tasks",
  "ky_dynamic_responses",
  "ky_form_fields",
  "ky_form_questions",
  "ky_form_steps",
  "ky_forms",
  "kyf_responses",
  "kyc_responses",
  "kyw_responses",
  "learn_content",
  "learn_modules",
  "learn_programs",
  "learn_resource_editions",
  "learn_resources",
  "learn_watch_progress",
  "live_sessions",
  "mentor_assignments",
  "mentor_notes",
  "mentor_profiles",
  "mentors",
  "message_reactions",
  "network_members",
  "night_ritual_items",
  "nightly_rituals",
  "notifications",
  "onboarding_automation_config",
  "onboarding_automation_logs",
  "onboarding_checklist",
  "past_programs",
  "payment_config",
  "payment_defaults",
  "payments",
  "perk_claims",
  "perk_form_fields",
  "perks",
  "prep_checklist_items",
  "profiles",
  "public_portfolios",
  "roadmap_days",
  "roadmap_galleries",
  "roadmap_sidebar_content",
  "roadmap_sidebar_content_editions",
  "roadmap_sidebar_items",
  "saved_profiles",
  "stay_location_editions",
  "stay_locations",
  "student_films",
  "submission_feedback",
  "submissions",
  "targeted_cards",
  "today_focus_cards",
  "todays_focus",
  "user_activity_logs",
  "user_journey_progress",
  "user_nightly_progress",
  "user_notes",
  "user_prep_progress",
  "user_roles",
  "user_task_preferences",
  "user_works",
  "video_access_logs",
  "webhook_events_log",
]);

const MAX_LIMIT = 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller identity via JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Admin client (service role) — used only after admin check passes
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify admin role
    const { data: roleRow, error: roleError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleRow) {
      console.warn(`Non-admin export attempt by user ${user.id}`);
      return json({ error: "Admin access required" }, 403);
    }

    // Parse and validate body
    let body: { table?: unknown; limit?: unknown; offset?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const table = typeof body.table === "string" ? body.table : "";
    if (!table || !ALLOWED_TABLES.has(table)) {
      return json(
        {
          error: "Table not allowed",
          allowed: Array.from(ALLOWED_TABLES).sort(),
        },
        400,
      );
    }

    const rawLimit = Number(body.limit ?? MAX_LIMIT);
    const rawOffset = Number(body.offset ?? 0);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
      : MAX_LIMIT;
    const offset = Number.isFinite(rawOffset)
      ? Math.max(Math.trunc(rawOffset), 0)
      : 0;

    const { data, error, count } = await admin
      .from(table)
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(`Export error on ${table}:`, error);
      return json({ error: error.message }, 500);
    }

    console.log(
      `Admin ${user.id} exported ${data?.length ?? 0} rows from ${table} (offset=${offset}, limit=${limit})`,
    );

    return json({
      table,
      offset,
      limit,
      count,
      returned: data?.length ?? 0,
      data,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json(
      { error: err instanceof Error ? err.message : "Internal error" },
      500,
    );
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

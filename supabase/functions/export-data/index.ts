import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_TABLES = new Set<string>([
  "editions",
  "profiles",
  "user_roles",
  "roadmap_days",
  "learn_modules",
  "learn_resources",
  "learn_resource_editions",
  "announcements",
  "perks",
  "events",
  "homepage_content",
  "email_templates",
  "email_sender_identities",
  "email_audiences",
  "email_audience_members",
  "journey_stages",
  "journey_tasks",
  "equipment_items",
  "nightly_rituals",
  "mentors",
  "network_members",
  "community_highlights",
  "alumni_showcase",
  "app_changelog",
  "app_feature_flags",
  "city_groups",
  "cohort_groups",
  "explore_programs",
  "roadmap_sidebar_items",
  "todays_focus",
  "ky_form_questions",
  "payments",
  "live_sessions",
  "user_activity_logs",
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { user_ids } = await req.json();
    
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(JSON.stringify({ error: "user_ids array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is authenticated
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: userError } = await userClient.auth.getUser();
    if (userError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if caller is admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: adminRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter out the calling admin's ID for safety
    const idsToDelete = user_ids.filter((id: string) => id !== caller.id);
    
    if (idsToDelete.length === 0) {
      return new Response(JSON.stringify({ error: "No valid users to delete" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      deleted: 0,
      failed: 0,
      errors: [] as { email: string; error: string }[],
      deletedEmails: [] as string[],
    };

    // Tables to clean up user data from
    const tablesToClean = [
      "user_roles",
      "profiles",
      "kyf_responses",
      "kyc_responses",
      "kyw_responses",
      "ky_dynamic_responses",
      "event_registrations",
      "learn_watch_progress",
      "video_access_logs",
      "community_messages",
      "message_reactions",
      "user_nightly_progress",
      "user_prep_progress",
      "onboarding_checklist",
      "notifications",
      "public_portfolios",
      "user_works",
    ];

    for (const userId of idsToDelete) {
      try {
        // Get user email for logging
        const { data: userData } = await adminClient.auth.admin.getUserById(userId);
        const userEmail = userData?.user?.email || userId;

        // Delete from all related tables
        for (const table of tablesToClean) {
          await adminClient.from(table).delete().eq("user_id", userId);
        }

        // Delete the auth user
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
        if (deleteError) {
          throw deleteError;
        }

        results.deleted++;
        results.deletedEmails.push(userEmail);
      } catch (error: unknown) {
        results.failed++;
        results.errors.push({
          email: userId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(`Bulk delete complete: ${results.deleted} deleted, ${results.failed} failed`);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Bulk delete error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

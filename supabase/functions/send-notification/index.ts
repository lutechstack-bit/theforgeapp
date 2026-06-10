import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function renderTokens(text: string, ctx: Record<string, string>): string {
  if (!text) return text;
  return text.replace(/\[([A-Z0-9_]+)\]/g, (m, key) => (key in ctx ? ctx[key] : m));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@theforge.app";
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return json({ error: "VAPID keys are not configured on the server." }, 500);
    }
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await admin.auth.getUser(token);
    const caller = userData?.user;
    if (!caller) return json({ error: "Not authenticated." }, 401);

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin only." }, 403);

    const body = await req.json().catch(() => ({}));
    const { templateId, testUserIds, audienceId, title: titleOverride, body: bodyOverride, url } = body;

    if (!templateId) return json({ error: "templateId is required." }, 400);

    const { data: template, error: tErr } = await admin
      .from("notification_templates")
      .select("*")
      .eq("id", templateId)
      .single();
    if (tErr || !template) return json({ error: "Template not found." }, 404);

    let userIds: string[] = [];
    if (Array.isArray(testUserIds) && testUserIds.length) {
      userIds = testUserIds;
    } else if (audienceId) {
      return json({ error: "Audience-based sends aren't enabled yet. Use 'Send test' to send to yourself." }, 400);
    } else {
      userIds = [caller.id];
    }
    userIds = [...new Set(userIds)].filter(Boolean);
    if (!userIds.length) return json({ error: "No target users resolved." }, 400);

    const { data: campaign, error: cErr } = await admin
      .from("notification_campaigns")
      .insert({
        template_id: templateId,
        audience_id: audienceId || null,
        target_user_ids: userIds,
        title_override: titleOverride || null,
        body_override: bodyOverride || null,
        status: "sending",
        total_targeted: userIds.length,
        sent_at: new Date().toISOString(),
        created_by: caller.id,
      })
      .select()
      .single();
    if (cErr) return json({ error: "Could not create campaign: " + cErr.message }, 500);

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    const nameById: Record<string, string> = {};
    (profiles || []).forEach((p: any) => {
      nameById[p.id] = (p.full_name || "").split(" ")[0] || "there";
    });

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds)
      .eq("enabled", true);

    const subsByUser: Record<string, any[]> = {};
    (subs || []).forEach((s: any) => {
      (subsByUser[s.user_id] = subsByUser[s.user_id] || []).push(s);
    });

    let sent = 0;
    let delivered = 0;
    const deliveryRows: any[] = [];

    for (const uid of userIds) {
      const ctx = { FIRST_NAME: nameById[uid] || "there" };
      const titleR = renderTokens(titleOverride || template.title || "the Forge", ctx);
      const bodyR = renderTokens(bodyOverride || template.body || "", ctx);
      const deepLink = url || template.deep_link || "/";

      const userSubs = subsByUser[uid] || [];
      if (!userSubs.length) {
        deliveryRows.push({
          campaign_id: campaign.id, user_id: uid, channel: "push", status: "skipped",
          skipped_reason: "no_subscription", title_rendered: titleR, body_rendered: bodyR, deep_link_rendered: deepLink,
        });
        continue;
      }

      for (const s of userSubs) {
        const payload = JSON.stringify({ title: titleR, body: bodyR, url: deepLink, deliveryId: campaign.id });
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          );
          sent++;
          delivered++;
          deliveryRows.push({
            campaign_id: campaign.id, user_id: uid, channel: "push", status: "delivered",
            title_rendered: titleR, body_rendered: bodyR, deep_link_rendered: deepLink,
            sent_at: new Date().toISOString(), delivered_at: new Date().toISOString(),
          });
          await admin.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", s.id);
        } catch (err: any) {
          const statusCode = err?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await admin.from("push_subscriptions").update({ enabled: false }).eq("id", s.id);
          }
          deliveryRows.push({
            campaign_id: campaign.id, user_id: uid, channel: "push", status: "failed",
            title_rendered: titleR, body_rendered: bodyR, deep_link_rendered: deepLink,
            error_message: `${statusCode || ""} ${err?.body || err?.message || "send failed"}`.trim(),
          });
        }
      }
    }

    if (deliveryRows.length) await admin.from("notification_deliveries").insert(deliveryRows);

    await admin
      .from("notification_campaigns")
      .update({ status: "sent", total_sent: sent, total_delivered: delivered })
      .eq("id", campaign.id);

    return json({
      ok: true,
      campaignId: campaign.id,
      targeted: userIds.length,
      sent,
      delivered,
      note: sent === 0 ? "No active push subscriptions for the target users — enable notifications first." : undefined,
    });
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500);
  }
});

// Automated nudge engine — sweeps active notification_rules and pushes gentle
// reminders to users with incomplete actions (KY form, payment, photo, inactivity).
//
// Auth: either an admin JWT (manual run) OR header `x-cron-key` == env CRON_KEY (cron).
// Body (all optional): { testMode?: boolean, ignoreWindow?: boolean, ruleName?: string }
//   - testMode overrides each rule's test_only (true → admins only)
//   - ignoreWindow skips the 9am–9pm send-window check (for manual testing)
//   - ruleName runs just one rule by name
//
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, SUPABASE_URL,
//          SUPABASE_SERVICE_ROLE_KEY, CRON_KEY (for scheduled invocation).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const renderTokens = (t: string, ctx: Record<string, string>) =>
  !t ? t : t.replace(/\[([A-Z0-9_]+)\]/g, (m, k) => (k in ctx ? ctx[k] : m));

// Current HH:MM in a given IANA tz (default Asia/Kolkata) as "HH:MM".
function nowHHMM(tz: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h}:${m}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@theforge.app";
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return json({ error: "VAPID keys not configured." }, 500);
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // ── Auth: cron key OR admin JWT ──
    const cronKey = Deno.env.get("CRON_KEY");
    const providedCron = req.headers.get("x-cron-key");
    let authed = false;
    if (cronKey && providedCron && providedCron === cronKey) {
      authed = true;
    } else {
      const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      const { data: ud } = await admin.auth.getUser(token);
      if (ud?.user) {
        const { data: isAdmin } = await admin.rpc("has_role", { _user_id: ud.user.id, _role: "admin" });
        authed = !!isAdmin;
      }
    }
    if (!authed) return json({ error: "Unauthorized." }, 401);

    const body = await req.json().catch(() => ({}));
    const { testMode, ignoreWindow, ruleName } = body as { testMode?: boolean; ignoreWindow?: boolean; ruleName?: string };

    // ── Load active rules + their template/audience ──
    let q = admin
      .from("notification_rules")
      .select("*, template:notification_templates(*), audience:notification_audiences(*)")
      .eq("is_active", true);
    if (ruleName) q = q.eq("name", ruleName);
    const { data: rules, error: rErr } = await q;
    if (rErr) return json({ error: "Load rules failed: " + rErr.message }, 500);

    const summary: any[] = [];

    for (const rule of rules || []) {
      const tpl = rule.template, aud = rule.audience;
      if (!tpl || !aud?.filter_sql) { summary.push({ rule: rule.name, skipped: "missing template/audience" }); continue; }

      const effTest = testMode ?? rule.test_only;
      const extra = effTest ? "is_admin = true" : "is_admin = false";

      // Send window (skip whole rule if outside, unless overridden)
      if (!ignoreWindow) {
        const now = nowHHMM(rule.timezone || "Asia/Kolkata");
        const start = (rule.send_window_start || "09:00").slice(0, 5);
        const end = (rule.send_window_end || "21:00").slice(0, 5);
        if (now < start || now > end) { summary.push({ rule: rule.name, skipped: `outside window (${now} not in ${start}-${end})` }); continue; }
      }

      // Resolve eligible users (audience ∧ extra ∧ under cap ∧ past cooldown)
      const { data: eligible, error: eErr } = await admin.rpc("nudge_eligible_users", {
        _filter: aud.filter_sql, _extra: extra, _template_id: tpl.id, _cooldown_hours: 20, _max_sends: rule.max_sends_per_user ?? 3,
      });
      if (eErr) { summary.push({ rule: rule.name, error: "audience resolve: " + eErr.message }); continue; }
      const userIds: string[] = (eligible || []).map((r: any) => r.user_id).filter(Boolean);
      if (!userIds.length) { summary.push({ rule: rule.name, testMode: effTest, eligible: 0 }); continue; }

      // Campaign row for this sweep of this rule
      const { data: campaign, error: cErr } = await admin.from("notification_campaigns").insert({
        rule_id: rule.id, template_id: tpl.id, audience_id: aud.id, target_user_ids: userIds,
        status: "sending", total_targeted: userIds.length, sent_at: new Date().toISOString(),
      }).select().single();
      if (cErr) { summary.push({ rule: rule.name, error: "campaign: " + cErr.message }); continue; }

      const { data: profiles } = await admin.from("profiles").select("id, full_name").in("id", userIds);
      const nameById: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { nameById[p.id] = (p.full_name || "").split(" ")[0] || "there"; });

      const { data: subs } = await admin.from("push_subscriptions").select("*").in("user_id", userIds).eq("enabled", true);
      const subsByUser: Record<string, any[]> = {};
      (subs || []).forEach((s: any) => { (subsByUser[s.user_id] = subsByUser[s.user_id] || []).push(s); });

      let sent = 0, delivered = 0;
      const rows: any[] = [];
      for (const uid of userIds) {
        const ctx = { FIRST_NAME: nameById[uid] || "there" };
        const titleR = renderTokens(tpl.title || "the Forge", ctx);
        const bodyR = renderTokens(tpl.body || "", ctx);
        const link = tpl.deep_link || "/";
        const userSubs = subsByUser[uid] || [];
        if (!userSubs.length) {
          rows.push({ campaign_id: campaign.id, user_id: uid, channel: "push", status: "skipped", skipped_reason: "no_subscription", title_rendered: titleR, body_rendered: bodyR, deep_link_rendered: link });
          continue;
        }
        for (const s of userSubs) {
          const payload = JSON.stringify({ title: titleR, body: bodyR, url: link, deliveryId: campaign.id });
          try {
            await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
            sent++; delivered++;
            rows.push({ campaign_id: campaign.id, user_id: uid, channel: "push", status: "delivered", title_rendered: titleR, body_rendered: bodyR, deep_link_rendered: link, sent_at: new Date().toISOString(), delivered_at: new Date().toISOString() });
          } catch (err: any) {
            const code = err?.statusCode;
            if (code === 404 || code === 410) await admin.from("push_subscriptions").update({ enabled: false }).eq("id", s.id);
            rows.push({ campaign_id: campaign.id, user_id: uid, channel: "push", status: "failed", title_rendered: titleR, body_rendered: bodyR, deep_link_rendered: link, error_message: `${code || ""} ${err?.body || err?.message || "send failed"}`.trim() });
          }
        }
      }
      if (rows.length) await admin.from("notification_deliveries").insert(rows);
      await admin.from("notification_campaigns").update({ status: "sent", total_sent: sent, total_delivered: delivered }).eq("id", campaign.id);
      summary.push({ rule: rule.name, testMode: effTest, eligible: userIds.length, sent, delivered });
    }

    return json({ ok: true, ranAt: new Date().toISOString(), rules: summary });
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500);
  }
});

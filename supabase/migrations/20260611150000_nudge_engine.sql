-- ─────────────────────────────────────────────────────────────────────────────
-- Automated nudge engine: state-based reminders for incomplete actions
-- (KY form, payment balance, profile photo, inactivity). Test-mode by default.
-- Run this in the Lovable SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. FIX BROKEN AUDIENCE FILTERS ─────────────────────────────────────────────
--    The seeded audiences referenced columns that don't exist on profiles
--    (deleted_at, last_login_at, profile_photo_url, deposit_paid_at). Remap to
--    real columns so every audience resolves instead of throwing.
UPDATE public.notification_audiences SET filter_sql = replace(filter_sql, 'deleted_at IS NULL AND ', '');
UPDATE public.notification_audiences SET filter_sql = replace(filter_sql, 'deleted_at IS NULL', 'true');
UPDATE public.notification_audiences SET filter_sql = replace(filter_sql, 'profile_photo_url', 'avatar_url');
UPDATE public.notification_audiences SET filter_sql = replace(filter_sql, 'last_login_at', 'last_active_at');
UPDATE public.notification_audiences SET filter_sql = replace(filter_sql, 'deposit_paid_at', 'created_at');

-- 2. RE-ENGAGEMENT TEMPLATE for the inactivity nudge ─────────────────────────
INSERT INTO public.notification_templates
  (key, title, body, deep_link, icon, category, cohort_scope, tokens_used, require_ky_completion, rate_limit_per_user_minutes)
VALUES
  ('re_engage_7d', 'We miss you, [FIRST_NAME] 👋',
   'Your cohort is moving — jump back in and pick up where you left off.',
   '/', '👋', 'habit', 'any', ARRAY['[FIRST_NAME]'], false, 1440)
ON CONFLICT (key) DO NOTHING;

-- 3. SCHEDULED TRIGGER for the daily sweep ───────────────────────────────────
INSERT INTO public.notification_triggers (key, label, event_type, schedule_cron, description, is_active)
VALUES ('nudge_daily', 'Daily incomplete-action sweep', 'schedule', '0 10 * * *',
        'Sweeps users for incomplete actions (KY, payment, photo, inactivity) and sends gentle reminders', true)
ON CONFLICT (key) DO NOTHING;

-- 4. TEST-MODE FLAG on rules (true = only sends to admins) ────────────────────
ALTER TABLE public.notification_rules ADD COLUMN IF NOT EXISTS test_only boolean NOT NULL DEFAULT true;

-- 5. ELIGIBILITY RESOLVER ────────────────────────────────────────────────────
--    Returns the users who (a) match the audience filter, (b) match _extra
--    (is_admin gate for test/live), (c) are under the max-sends cap for this
--    template, and (d) are outside the cooldown window. SECURITY DEFINER so the
--    service-role edge function can read profiles + delivery history.
CREATE OR REPLACE FUNCTION public.nudge_eligible_users(
  _filter text, _extra text, _template_id uuid, _cooldown_hours int, _max_sends int
) RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  RETURN QUERY EXECUTE format($q$
    SELECT p.id
      FROM public.profiles p
     WHERE (%s) AND (%s)
       AND (SELECT count(*) FROM public.notification_deliveries d
              JOIN public.notification_campaigns c ON c.id = d.campaign_id
             WHERE d.user_id = p.id AND c.template_id = $1
               AND d.status IN ('sent','delivered')) < $2
       AND NOT EXISTS (SELECT 1 FROM public.notification_deliveries d
              JOIN public.notification_campaigns c ON c.id = d.campaign_id
             WHERE d.user_id = p.id AND c.template_id = $1
               AND d.created_at > now() - make_interval(hours => $3))
  $q$, _filter, _extra)
  USING _template_id, _max_sends, _cooldown_hours;
END;
$fn$;

REVOKE ALL ON FUNCTION public.nudge_eligible_users(text,text,uuid,int,int) FROM public;
-- (only the service role / edge function invokes this)

-- 6. THE FOUR NUDGE RULES (gentle: max 3, once/day, test_only) ────────────────
INSERT INTO public.notification_rules (name, template_id, audience_id, trigger_id, max_sends_per_user, send_window_start, send_window_end, timezone, is_active, test_only)
SELECT 'Nudge: KY form incomplete',
       (SELECT id FROM public.notification_templates WHERE key='onb_kyf_nudge_d3'),
       (SELECT id FROM public.notification_audiences WHERE key='ky_pending'),
       (SELECT id FROM public.notification_triggers WHERE key='nudge_daily'),
       3, '09:00', '21:00', 'Asia/Kolkata', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.notification_rules WHERE name='Nudge: KY form incomplete');

INSERT INTO public.notification_rules (name, template_id, audience_id, trigger_id, max_sends_per_user, send_window_start, send_window_end, timezone, is_active, test_only)
SELECT 'Nudge: Payment balance pending',
       (SELECT id FROM public.notification_templates WHERE key='pay_d7_unlock'),
       (SELECT id FROM public.notification_audiences WHERE key='balance_pending'),
       (SELECT id FROM public.notification_triggers WHERE key='nudge_daily'),
       3, '09:00', '21:00', 'Asia/Kolkata', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.notification_rules WHERE name='Nudge: Payment balance pending');

INSERT INTO public.notification_rules (name, template_id, audience_id, trigger_id, max_sends_per_user, send_window_start, send_window_end, timezone, is_active, test_only)
SELECT 'Nudge: Profile photo missing',
       (SELECT id FROM public.notification_templates WHERE key='onb_photo_nudge'),
       (SELECT id FROM public.notification_audiences WHERE key='no_profile_photo'),
       (SELECT id FROM public.notification_triggers WHERE key='nudge_daily'),
       3, '09:00', '21:00', 'Asia/Kolkata', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.notification_rules WHERE name='Nudge: Profile photo missing');

INSERT INTO public.notification_rules (name, template_id, audience_id, trigger_id, max_sends_per_user, send_window_start, send_window_end, timezone, is_active, test_only)
SELECT 'Nudge: Inactive 7 days',
       (SELECT id FROM public.notification_templates WHERE key='re_engage_7d'),
       (SELECT id FROM public.notification_audiences WHERE key='dark_7d'),
       (SELECT id FROM public.notification_triggers WHERE key='nudge_daily'),
       3, '09:00', '21:00', 'Asia/Kolkata', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.notification_rules WHERE name='Nudge: Inactive 7 days');

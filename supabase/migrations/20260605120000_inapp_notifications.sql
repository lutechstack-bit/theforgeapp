-- In-app push notification system — Prompt 1 foundation (schema + seed).
-- Tables: templates, audiences, triggers, rules, campaigns, deliveries.
-- Adjusted seed audience SQL to the profiles columns that actually exist
-- (is_admin, last_active_at, avatar_url, created_at, ky_form_completed,
-- payment_status, edition_id). Idempotent where practical.

-- ═══════════════════════ TABLES ═══════════════════════
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  deep_link text,
  icon text,
  category text,
  cohort_scope text DEFAULT 'any',
  tokens_used text[] DEFAULT '{}',
  require_ky_completion boolean DEFAULT true,
  require_login boolean DEFAULT true,
  rate_limit_per_user_minutes int DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.notification_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  filter_sql text NOT NULL,
  estimated_size_cache int,
  estimated_size_updated_at timestamptz,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  event_type text NOT NULL,
  event_source text,
  schedule_cron text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_id uuid REFERENCES public.notification_templates(id) ON DELETE RESTRICT,
  audience_id uuid REFERENCES public.notification_audiences(id) ON DELETE RESTRICT,
  trigger_id uuid REFERENCES public.notification_triggers(id) ON DELETE RESTRICT,
  delay_minutes int DEFAULT 0,
  send_window_start time DEFAULT '09:00',
  send_window_end time DEFAULT '21:00',
  timezone text DEFAULT 'Asia/Kolkata',
  max_sends_per_user int DEFAULT 1,
  cancel_if_event_keys text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.notification_rules(id),
  template_id uuid REFERENCES public.notification_templates(id) NOT NULL,
  audience_id uuid REFERENCES public.notification_audiences(id),
  target_user_ids uuid[] DEFAULT '{}',
  title_override text,
  body_override text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  status text DEFAULT 'scheduled',
  total_targeted int DEFAULT 0,
  total_sent int DEFAULT 0,
  total_delivered int DEFAULT 0,
  total_opened int DEFAULT 0,
  total_clicked int DEFAULT 0,
  total_converted int DEFAULT 0,
  error_message text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.notification_campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  channel text NOT NULL DEFAULT 'push',
  status text DEFAULT 'queued',
  skipped_reason text,
  title_rendered text,
  body_rendered text,
  deep_link_rendered text,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  converted_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════ INDEXES ═══════════════════════
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_user ON public.notification_deliveries (user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_campaign ON public.notification_deliveries (campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_status ON public.notification_deliveries (status, created_at);
CREATE INDEX IF NOT EXISTS idx_notif_campaigns_scheduled ON public.notification_campaigns (status, scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_notif_templates_active ON public.notification_templates (key) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notif_templates_category ON public.notification_templates (category);
CREATE INDEX IF NOT EXISTS idx_notif_rules_trigger ON public.notification_rules (trigger_id, is_active);

-- ═══════════════════════ RLS ═══════════════════════
ALTER TABLE public.notification_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_audiences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_triggers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_rules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "admin all notif_templates"  ON public.notification_templates  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  CREATE POLICY "admin all notif_audiences"  ON public.notification_audiences  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  CREATE POLICY "admin all notif_triggers"   ON public.notification_triggers   FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  CREATE POLICY "admin all notif_rules"      ON public.notification_rules      FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  CREATE POLICY "admin all notif_campaigns"  ON public.notification_campaigns  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  CREATE POLICY "admin all notif_deliveries" ON public.notification_deliveries FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  CREATE POLICY "user read own notif_deliveries" ON public.notification_deliveries FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ═══════════════════════ SEED: AUDIENCES ═══════════════════════
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('all_students','All students','is_admin = false',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('never_logged_in','Never logged in','is_admin = false AND last_active_at IS NULL',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('ky_pending','KY form not submitted','is_admin = false AND ky_form_completed = false',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('no_profile_photo','No profile photo uploaded','is_admin = false AND avatar_url IS NULL',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('active_7d','Active in last 7 days','is_admin = false AND last_active_at > now() - interval ''7 days''',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('dark_7d','Dark for 7+ days','is_admin = false AND last_active_at IS NOT NULL AND last_active_at < now() - interval ''7 days''',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('in_active_cohort','In an active (live) cohort','is_admin = false AND edition_id IN (SELECT id FROM editions WHERE forge_start_date <= now() AND forge_end_date >= now())',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('balance_pending','Deposit paid, balance pending','is_admin = false AND payment_status = ''CONFIRMED_15K''',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('balance_pending_7d','Balance pending, joined 7+ days ago','is_admin = false AND payment_status = ''CONFIRMED_15K'' AND created_at < now() - interval ''7 days''',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('balance_pending_engaged','Balance pending AND active in app','is_admin = false AND payment_status = ''CONFIRMED_15K'' AND last_active_at > now() - interval ''7 days''',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('balance_pending_dark','Balance pending AND inactive','is_admin = false AND payment_status = ''CONFIRMED_15K'' AND (last_active_at IS NULL OR last_active_at < now() - interval ''7 days'')',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('community_never_visited','Never opened Community tab','is_admin = false AND ky_form_completed = true AND id NOT IN (SELECT DISTINCT user_id FROM user_activity_logs WHERE event_type = ''page_view'' AND page_name = ''Community'')',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('community_lurker','Opens Community but never posts','is_admin = false AND id IN (SELECT DISTINCT user_id FROM user_activity_logs WHERE event_type = ''page_view'' AND page_name = ''Community'') AND id NOT IN (SELECT DISTINCT user_id FROM community_messages)',true) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_audiences (key,label,filter_sql,is_system) VALUES ('community_active','Posted in community in last 14 days','is_admin = false AND id IN (SELECT DISTINCT user_id FROM community_messages WHERE created_at > now() - interval ''14 days'')',true) ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════ SEED: TRIGGERS ═══════════════════════
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_signup','Signup','webhook','supabase_auth',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_first_login','First Login','webhook','supabase_auth',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_ky_submit','Ky Submit','webhook','app',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_photo_upload','Photo Upload','webhook','app',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_deposit_paid','Deposit Paid','webhook','razorpay',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_balance_paid','Balance Paid','webhook','razorpay',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_payment_link_clicked','Payment Link Clicked','webhook','app',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_payment_abandoned','Payment Abandoned','webhook','razorpay','Checkout abandoned') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_balance_d7','Balance D7','cron',NULL,'0 10 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_balance_d14','Balance D14','cron',NULL,'0 10 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_balance_d21','Balance D21','cron',NULL,'0 10 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_balance_d28','Balance D28','cron',NULL,'0 10 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_community_post','Community Post','realtime_db','community_messages',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_mention','Mention','webhook','app',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_reply','Reply','webhook','app',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_reaction','Reaction','webhook','app',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_collab_request','Collab Request','webhook','app',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_weekly_digest','Weekly Digest','cron',NULL,'0 19 * * 0') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_community_intro_d2','Community Intro D2','cron',NULL,'0 11 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_video_start','Video Start','webhook','app',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('on_video_complete','Video Complete','webhook','app',NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_video_resume','Video Resume','cron',NULL,'0 18 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('daily_9am_focus','Daily 9Am Focus','cron',NULL,'30 3 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('daily_10pm_streak','Daily 10Pm Streak','cron',NULL,'30 16 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_session_1h_before','Sessi1H Before','cron',NULL,'*/15 * * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_session_recording','Sessirecording','cron',NULL,'0 11 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_post_residency_d1','Post Residency D1','cron',NULL,'0 10 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_post_residency_d7','Post Residency D7','cron',NULL,'0 10 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_post_residency_d14','Post Residency D14','cron',NULL,'0 10 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_dark_3d','Dark 3D','cron',NULL,'0 11 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_dark_7d','Dark 7D','cron',NULL,'0 11 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('cron_dark_14d','Dark 14D','cron',NULL,'0 11 * * *') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_triggers (key,label,event_type,event_source,schedule_cron) VALUES ('manual','Manual','manual','admin_compose',NULL) ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════ SEED: TEMPLATES ═══════════════════════
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('onb_welcome','onboarding',false,'Welcome to The Forge ✨','Your spot is locked in. Tap to complete your Know-Yourself form (5 min) so we can match you with the right mentors.','/kyf','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('onb_kyf_nudge_d3','onboarding',false,'Your batch is moving ahead','Most of your batchmates have finished their KY form. Take 5 minutes to catch up.','/kyf','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('onb_kyf_nudge_d7','onboarding',false,'[FIRST_NAME], 5 minutes to unlock your batch','Your KY form is the last step before we can match you with mentors and batchmates.','/kyf',ARRAY['FIRST_NAME']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('onb_photo_nudge','onboarding',true,'Show up in the directory 📸','Add a profile photo so your batchmates and mentors can put a face to your name. Takes 30 seconds.','/profile','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_d7_unlock','payment',true,'Lock your seat 🔒','Your ₹50,000 balance unlocks premium content + mentor 1:1s. Pay in 2 taps via Razorpay.','/profile?action=pay-balance','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_d14_social','payment',true,'[N] of your batchmates have paid in full','Premium content is unlocking across your cohort. Complete your balance to join them.','/profile?action=pay-balance',ARRAY['N']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_d21_content','payment',true,'4 masterclasses are locked','Direction, Cinematography, Editing, Screenwriting. Your balance unlocks all of them.','/learn?filter=premium','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_d28_human','payment',true,'Quick chat about your balance?','If something''s blocking your balance payment, we''d rather help than wait. Tap to book a 10-min call.','/profile?action=schedule-payment-call','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_engaged_active','payment',true,'You''re 3 sessions in — finish the unlock','You''ve been active in the app. Your balance payment unlocks mentor 1:1s and premium content.','/profile?action=pay-balance','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_locked_content_peek','payment',true,'[MENTOR_NAME] just dropped a masterclass','Locked behind your balance payment. 47 minutes that change how you direct. Tap to unlock.','/learn?filter=premium',ARRAY['MENTOR_NAME']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_abandoned_checkout','payment',true,'Your payment didn''t go through','We saved your spot. Try again — usually a 30-second retry fixes it.','/profile?action=pay-balance','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_deadline_warning','payment',true,'5 days to complete payment','Your seat at [COHORT_NAME] is reserved through [DEADLINE]. Don''t let it lapse.','/profile?action=pay-balance',ARRAY['COHORT_NAME','DEADLINE']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_received','payment',true,'Payment received 🎉','You''re now full Forge alumni. Premium content + mentor 1:1 booking are unlocked.','/learn','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('pay_mentor_unlock','payment',true,'Book your first mentor 1:1','Now that your balance is paid, you can book a 30-min 1:1 with any mentor. Pick your slot.','/mentors','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_intro_d2','community',true,'Your batch is in here 👋','[N] students from [COHORT_NAME] are chatting in community. Tap to say hi and introduce yourself.','/community',ARRAY['COHORT_NAME','N']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_post_in_cohort','community',true,'[FIRST_NAME] just posted in [COHORT_NAME]','Tap to see what''s happening.','/community',ARRAY['COHORT_NAME','FIRST_NAME']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_mention','community',true,'[FIRST_NAME] mentioned you','[MESSAGE_PREVIEW]','/community/message/[MESSAGE_ID]',ARRAY['FIRST_NAME','MESSAGE_ID','MESSAGE_PREVIEW']::text[],5) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_reply','community',true,'[FIRST_NAME] replied to your message','[MESSAGE_PREVIEW]','/community/message/[MESSAGE_ID]',ARRAY['FIRST_NAME','MESSAGE_ID','MESSAGE_PREVIEW']::text[],10) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_reactions_milestone','community',true,'Your post is taking off 🔥','[N] batchmates reacted to what you shared. Tap to see.','/community/message/[MESSAGE_ID]',ARRAY['MESSAGE_ID','N']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_first_post_celebrate','community',true,'First post — nice 👏','Welcome to the community. Your batchmates can now find you in the creatives directory.','/community','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_lurker_nudge','community',true,'You''ve been reading — share something?','Your batchmates would love to know what you''re working on. Drop a quick intro or share a clip.','/community','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_collab_request','community',true,'[FIRST_NAME] wants to collaborate','Tap to see their pitch and reply.','/community/inbox',ARRAY['FIRST_NAME']::text[],5) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_collab_accepted','community',true,'[FIRST_NAME] accepted your collab','Tap to start the conversation.','/community/inbox',ARRAY['FIRST_NAME']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_weekly_digest','community',true,'Week''s best from [COHORT_NAME] 🎬','Top 3 posts and convos from your batch this week. Tap to catch up.','/community?filter=weekly-best',ARRAY['COHORT_NAME']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('comm_directory_match','community',true,'[N] new batchmates in your city','[CITY] creatives are on the platform. Tap to browse the directory.','/community/directory?filter=city',ARRAY['CITY','N']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('learn_video_resume','learn',true,'Resume where you left off ▶️','You stopped at [TIMESTAMP] in [VIDEO_TITLE]. [REMAINING_MIN] minutes left.','/course/[COURSE_ID]',ARRAY['COURSE_ID','REMAINING_MIN','TIMESTAMP','VIDEO_TITLE']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('learn_new_drop','learn',true,'New: [VIDEO_TITLE]','[MENTOR_NAME] just dropped a [DURATION]-min masterclass. Watch in the Learn tab.','/course/[COURSE_ID]',ARRAY['COURSE_ID','DURATION','MENTOR_NAME','VIDEO_TITLE']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('habit_todays_focus','habit',true,'Today''s Focus is ready ⚡','[TODAYS_FOCUS_TITLE] — your task for today. Tap to open.','/roadmap/tasks',ARRAY['TODAYS_FOCUS_TITLE']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('habit_streak_save','habit',true,'Don''t break the streak 🔥','You''re on a [STREAK_COUNT]-day streak. Open the app today to keep it going.','/',ARRAY['STREAK_COUNT']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('session_starting_1h','session',true,'Live in 1 hour 🎥','[SESSION_TITLE] with [FACILITATOR]. Join link is live in the app.','/roadmap/sessions/[SESSION_ID]',ARRAY['FACILITATOR','SESSION_ID','SESSION_TITLE']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('session_recording_drop','session',true,'Recording is up 🎬','[SESSION_TITLE] is now on demand in the app.','/roadmap/sessions/[SESSION_ID]',ARRAY['SESSION_ID','SESSION_TITLE']::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('post_d1_welcome_home','post_residency',true,'Welcome home 🏠','Your alumni access is now live. Tap to see what''s unlocked.','/','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('post_d7_showcase','post_residency',true,'Share your work 🎬','Submit your residency work to the alumni showcase. Featured submissions get homepage placement.','/profile/works','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.notification_templates (key,category,require_ky_completion,title,body,deep_link,tokens_used,rate_limit_per_user_minutes) VALUES ('post_d14_referral','post_residency',true,'Know someone for the next cohort?','Your referral earns them a spot and you ₹2,500 credit. Tap for your link.','/profile?action=referral','{}'::text[],60) ON CONFLICT (key) DO NOTHING;
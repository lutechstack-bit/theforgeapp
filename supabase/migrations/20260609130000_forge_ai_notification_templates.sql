-- Forge AI Residency notification templates (cohort_scope = 'FAI')
-- Content derived from "the Forge AI Welcome Guide" — Build. Automate. Launch.
-- Run this in the Lovable SQL editor. Idempotent (ON CONFLICT (key) DO NOTHING).

INSERT INTO public.notification_templates
  (key, title, body, deep_link, icon, category, cohort_scope, tokens_used, require_ky_completion, rate_limit_per_user_minutes)
VALUES
  -- Onboarding / pre-arrival
  ('fai_welcome',
   'Welcome to Forge AI, [FIRST_NAME] 🚀',
   'Build. Automate. Launch. Your AI Residency starts here — let''s get you set up.',
   '/', '🚀', 'onboarding', 'FAI', ARRAY['[FIRST_NAME]'], false, 1440),

  ('fai_online_sessions_open',
   'Your AI pre-sessions are live',
   'Session 1: The AI Mindset is ready. Watch before you arrive, [FIRST_NAME].',
   '/learn', '🧠', 'onboarding', 'FAI', ARRAY['[FIRST_NAME]'], false, 1440),

  ('fai_prompting_session',
   'New: Prompting & Context Engineering',
   'Learn to write prompts that actually work for real projects. Tap to start.',
   '/learn', '✨', 'learn', 'FAI', ARRAY[]::text[], true, 720),

  ('fai_pre_arrival',
   'Pre-Arrival Alignment, [FIRST_NAME]',
   'One last session before the residency — get aligned and ready to build.',
   '/learn', '📍', 'onboarding', 'FAI', ARRAY['[FIRST_NAME]'], false, 1440),

  -- Daily rhythm (in-residency)
  ('fai_todays_focus',
   'Today at Forge AI: [TODAYS_FOCUS_TITLE]',
   'Here''s your focus for the day, [FIRST_NAME]. Let''s build.',
   '/roadmap', '🎯', 'habit', 'FAI', ARRAY['[FIRST_NAME]','[TODAYS_FOCUS_TITLE]'], true, 720),

  ('fai_build_night',
   'Build Night starts soon 🌙',
   'Tonight''s build session is where it clicks. See you there, [FIRST_NAME].',
   '/roadmap', '🌙', 'habit', 'FAI', ARRAY['[FIRST_NAME]'], true, 360),

  ('fai_automations_unlocked',
   'Automations & Agents unlocked',
   'Build systems that think and act — n8n, Claude Code, and AI agents. Tap to start.',
   '/learn', '⚙️', 'learn', 'FAI', ARRAY[]::text[], true, 720),

  ('fai_product_building',
   'Product Building begins',
   'Turn your idea into a working product with Lovable. Your first build awaits.',
   '/learn', '🛠️', 'learn', 'FAI', ARRAY[]::text[], true, 720),

  -- Community + milestones
  ('fai_demo_day',
   'Demo Day is here 🎤',
   'Show what you built, [FIRST_NAME]. Faculty and your cohort are watching.',
   '/community', '🎤', 'community', 'FAI', ARRAY['[FIRST_NAME]'], true, 1440),

  ('fai_graduation',
   'You did it, [FIRST_NAME] 🎓',
   'From Dreamer to Builder. Welcome to the Forge AI alumni — keep shipping.',
   '/', '🎓', 'post-residency', 'FAI', ARRAY['[FIRST_NAME]'], false, 1440)
ON CONFLICT (key) DO NOTHING;

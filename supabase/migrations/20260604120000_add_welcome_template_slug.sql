-- Adds an admin-controllable "welcome email template" selector to the onboarding
-- automation. forge-onboard-student reads onboarding_automation_config.welcome_template_slug
-- (falling back to 'student-welcome') to decide which email_templates row to send.
-- Idempotent: safe to re-run.

ALTER TABLE public.onboarding_automation_config
  ADD COLUMN IF NOT EXISTS welcome_template_slug text NOT NULL DEFAULT 'student-welcome';

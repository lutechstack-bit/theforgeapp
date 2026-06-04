-- Admin toggle to turn the app's Resend welcome email on/off.
-- When false, forge-onboard-student still creates the account but does NOT send
-- the welcome email (used when n8n sends the confirmation email via Gmail instead).
-- Idempotent: safe to re-run.

ALTER TABLE public.onboarding_automation_config
  ADD COLUMN IF NOT EXISTS send_welcome_email boolean NOT NULL DEFAULT true;

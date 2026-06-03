-- ============================================================
-- 1. Insert the student-welcome email template
--    (forge-onboard-student looks for slug = 'student-welcome')
-- ============================================================

INSERT INTO public.email_templates (
  name,
  slug,
  subject,
  html_content,
  default_sender_id,
  is_active
)
SELECT
  'Student Welcome — Onboarding',
  'student-welcome',
  'Welcome to The Forge, {{user.first_name}}! 🎬',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to The Forge</title>
  <style>
    body { margin: 0; padding: 0; background: #0b0a08; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Arial, sans-serif; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .logo { font-size: 22px; font-weight: 800; color: #f5efe2; letter-spacing: -0.5px; }
    .logo span { color: #f59e0b; }
    .hero { background: linear-gradient(135deg, #1a1814 0%, #110f0c 100%); border: 1px solid #2a2520; border-radius: 16px; padding: 36px 32px; margin: 28px 0; }
    .hero h1 { color: #f5efe2; font-size: 28px; font-weight: 700; margin: 0 0 8px; line-height: 1.2; }
    .hero h1 span { color: #f59e0b; }
    .hero p { color: #a8a09a; font-size: 15px; line-height: 1.6; margin: 0; }
    .btn { display: inline-block; background: #f59e0b; color: #0b0a08; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 50px; text-decoration: none; margin: 28px 0; }
    .divider { border: none; border-top: 1px solid #2a2520; margin: 28px 0; }
    .steps { margin: 0; padding: 0; list-style: none; }
    .steps li { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 18px; }
    .step-num { background: #f59e0b; color: #0b0a08; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0; }
    .step-text { color: #c8c0b8; font-size: 14px; line-height: 1.5; padding-top: 4px; }
    .step-text strong { color: #f5efe2; }
    .creds { background: #161410; border: 1px solid #2a2520; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .creds p { margin: 0 0 8px; font-size: 13px; color: #a8a09a; }
    .creds .val { color: #f5efe2; font-size: 15px; font-weight: 600; }
    .footer { color: #6b635d; font-size: 12px; text-align: center; margin-top: 32px; line-height: 1.6; }
    .footer a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="logo">the <span>Forge</span></div>

  <div class="hero">
    <h1>Welcome, <span>{{user.first_name}}</span>.</h1>
    <p>Your spot in <strong>{{edition.name}}</strong> is confirmed. Your journey from dreamer to doer starts now.</p>
  </div>

  <p style="color:#c8c0b8;font-size:15px;line-height:1.6;margin:0 0 8px;">Here''s how to get started:</p>

  <ul class="steps">
    <li>
      <div class="step-num">1</div>
      <div class="step-text"><strong>Log in to the app</strong><br/>Use the button below. Your login is your email address.</div>
    </li>
    <li>
      <div class="step-num">2</div>
      <div class="step-text"><strong>Set your password</strong><br/>First login will prompt you to set a password. Keep it somewhere safe.</div>
    </li>
    <li>
      <div class="step-num">3</div>
      <div class="step-text"><strong>Complete your KY Form</strong><br/>This takes 10 minutes and helps us build your cohort experience around you.</div>
    </li>
    <li>
      <div class="step-num">4</div>
      <div class="step-text"><strong>Check your Roadmap</strong><br/>Your day-by-day preparation guide is live — start from Day 1.</div>
    </li>
  </ul>

  <div class="creds">
    <p>Your login credentials</p>
    <p class="val">📧 {{user.email}}</p>
  </div>

  <a href="https://app.forgebylevelup.com" class="btn">Open The Forge App →</a>

  <hr class="divider" />

  <p style="color:#a8a09a;font-size:14px;line-height:1.6;margin:0;">
    Questions? Reply to this email or WhatsApp us. We''re here every step of the way.
  </p>

  <div class="footer">
    <p>The Forge by LevelUp Learning · <a href="https://leveluplearning.in">leveluplearning.in</a></p>
    <p>You''re receiving this because you enrolled in {{edition.name}}.</p>
  </div>
</div>
</body>
</html>',
  (SELECT id FROM public.email_sender_identities WHERE is_default = true LIMIT 1),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates WHERE slug = 'student-welcome'
);


-- ============================================================
-- 2. Payment status trigger → call forge-onboard-student
--    Uses pg_net to POST to the edge function when a profile's
--    payment_status changes to CONFIRMED_15K for the first time.
-- ============================================================

-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function fired by trigger
CREATE OR REPLACE FUNCTION public.trigger_welcome_email_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret text;
  v_url    text;
BEGIN
  -- Only fire when payment_status becomes CONFIRMED_15K
  IF (OLD.payment_status IS NOT DISTINCT FROM NEW.payment_status) THEN
    RETURN NEW;
  END IF;
  IF NEW.payment_status <> 'CONFIRMED_15K' THEN
    RETURN NEW;
  END IF;

  -- Get secrets from vault (set via Supabase dashboard → Secrets)
  BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'FORGE_AUTOMATION_SECRET'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_secret := NULL;
  END;

  IF v_secret IS NULL THEN
    -- Secret not configured — skip silently
    RETURN NEW;
  END IF;

  v_url := 'https://tprvyhzpecopryylxznm.supabase.co/functions/v1/forge-onboard-student';

  -- Fire and forget — does not block the UPDATE
  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'x-forge-secret',  v_secret
    ),
    body    := jsonb_build_object(
      'student_id',      NEW.id::text,
      'email',           NEW.email,
      'full_name',       COALESCE(NEW.full_name, ''),
      'phone',           NEW.phone,
      'city',            NEW.city,
      'payment_amount',  15000,
      'product',         CASE NEW.forge_mode
                           WHEN 'FORGE_CREATORS' THEN 'FC'
                           WHEN 'FORGE_WRITING'  THEN 'FW'
                           ELSE 'FFM'
                         END,
      'trigger_source',  'payment_status_change',
      'edition_id',      NEW.edition_id::text
    )
  );

  RETURN NEW;
END;
$$;

-- Drop old trigger if exists and recreate
DROP TRIGGER IF EXISTS on_payment_confirmed_15k ON public.profiles;

CREATE TRIGGER on_payment_confirmed_15k
  AFTER UPDATE OF payment_status ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_welcome_email_on_payment();

-- Email infrastructure — Phase 1 (Forge / Resend)
-- 5 tables + indexes + RLS + seed for the default sender identity.
-- RLS reuses the existing public.has_role(uuid, app_role) function
-- (created in migration 20251230081539_*.sql line 150).

-- ═══════════════════════════════════════════════════════════════════
-- 1. email_sender_identities — from-addresses we send from
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.email_sender_identities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE NOT NULL,
  display_name    text NOT NULL,
  domain          text NOT NULL,
  reply_to_email  text,
  is_default      boolean DEFAULT false,
  is_active       boolean DEFAULT true,
  cohort_types    text[],                          -- NULL = usable for every cohort
  created_at      timestamptz DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id)
);

-- Only one row can have is_default = true at a time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_sender
  ON public.email_sender_identities (is_default)
  WHERE is_default = true;

-- ═══════════════════════════════════════════════════════════════════
-- 2. email_templates — stored templates with merge tags
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.email_templates (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  slug                text UNIQUE NOT NULL,
  subject             text NOT NULL,
  preview_text        text,
  html_content        text NOT NULL,
  variables           jsonb DEFAULT '[]'::jsonb,   -- list of merge tags referenced
  category            text,                        -- onboarding | reminder | announcement | alumni
  cohort_types        text[],                      -- NULL = all cohorts
  forge_mode          text,                        -- PRE_FORGE | DURING_FORGE | POST_FORGE | NULL
  default_sender_id   uuid REFERENCES public.email_sender_identities(id),
  current_version     int DEFAULT 1,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES auth.users(id)
);

-- ═══════════════════════════════════════════════════════════════════
-- 3. email_template_versions — full edit history per template
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.email_template_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     uuid REFERENCES public.email_templates(id) ON DELETE CASCADE,
  version         int NOT NULL,
  subject         text NOT NULL,
  preview_text    text,
  html_content    text NOT NULL,
  variables       jsonb,
  changed_by      uuid REFERENCES auth.users(id),
  changed_at      timestamptz DEFAULT now(),
  change_note     text,
  UNIQUE(template_id, version)
);

-- ═══════════════════════════════════════════════════════════════════
-- 4. email_audiences — saved recipient segments
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.email_audiences (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  description       text,
  filter_criteria   jsonb NOT NULL,
    -- shape: { edition_ids?: uuid[], cohort_types?: text[], forge_modes?: text[],
    --          ky_completed?: bool, payment_status?: text[] }
  created_at        timestamptz DEFAULT now(),
  created_by        uuid REFERENCES auth.users(id)
);

-- ═══════════════════════════════════════════════════════════════════
-- 5. email_sends — every outbound email logged (source of truth)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.email_sends (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id         uuid REFERENCES public.email_templates(id),
  template_version    int,
  sender_identity_id  uuid REFERENCES public.email_sender_identities(id),
  recipient_email     text NOT NULL,
  recipient_user_id   uuid REFERENCES auth.users(id),   -- NULL for non-user sends
  variables_used      jsonb,                            -- snapshot of merged values
  subject_rendered    text,
  resend_message_id   text,
  status              text NOT NULL DEFAULT 'queued',
    -- queued | sent | delivered | opened | clicked | bounced | complained | failed
  sent_at             timestamptz,
  delivered_at        timestamptz,
  opened_at           timestamptz,
  clicked_at          timestamptz,
  bounced_at          timestamptz,
  error_message       text,
  trigger_type        text,                              -- manual | automated | scheduled
  trigger_reference   text,                              -- e.g. trigger_id for automated
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_sends_recipient
  ON public.email_sends(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_template
  ON public.email_sends(template_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status
  ON public.email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_trigger
  ON public.email_sends(trigger_type, trigger_reference);
CREATE INDEX IF NOT EXISTS idx_email_sends_created
  ON public.email_sends(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- Row-Level Security
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.email_sender_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_audiences         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sends             ENABLE ROW LEVEL SECURITY;

-- Admins: full access on all tables ---------------------------------
CREATE POLICY "Admins manage email_sender_identities"
  ON public.email_sender_identities
  FOR ALL
  TO authenticated
  USING  (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage email_templates"
  ON public.email_templates
  FOR ALL
  TO authenticated
  USING  (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage email_template_versions"
  ON public.email_template_versions
  FOR ALL
  TO authenticated
  USING  (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage email_audiences"
  ON public.email_audiences
  FOR ALL
  TO authenticated
  USING  (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage email_sends"
  ON public.email_sends
  FOR ALL
  TO authenticated
  USING  (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users: read-only access to their own email_sends rows -------------
CREATE POLICY "Users read own email_sends"
  ON public.email_sends
  FOR SELECT
  TO authenticated
  USING (recipient_user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════
-- updated_at auto-bump on email_templates
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.touch_email_template_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER trg_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_email_template_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- Seed the default sender identity (forge@leveluplearning.in)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.email_sender_identities (email, display_name, domain, is_default, is_active)
VALUES ('forge@leveluplearning.in', 'The Forge Team', 'leveluplearning.in', true, true)
ON CONFLICT (email) DO NOTHING;

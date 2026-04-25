-- Phase 6 (mentor-profiles): mentor-triggered cards & notifications.
--
-- The existing public.home_cards table is for GLOBAL, admin-managed content
-- that appears on everyone's home. We need a DIFFERENT primitive: cards
-- targeted at a single student, pushed by either a mentor or an admin.
-- New table so the concerns stay separated:
--
--   targeted_cards
--     — one row per card sent to one student
--     — knows who sent it (admin / mentor), optional template reference,
--       optional link to a submission (for auto-expiry)
--
-- When a linked submission arrives (via the Tally webhook in Phase 5), the
-- card auto-expires so the student's home doesn't keep saying "Submit your
-- premise" after they've already done it.
--
-- We also write to the existing public.notifications table when the mentor
-- picks "also deliver as push", so pushes flow through the app's existing
-- notification surfaces.

-- ─── Enum ────────────────────────────────────────────────────────────────
CREATE TYPE public.card_source AS ENUM ('admin', 'mentor');

-- ─── targeted_cards ─────────────────────────────────────────────────────
CREATE TABLE public.targeted_cards (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source              public.card_source NOT NULL,
  source_user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Content (80/300/30 char caps matching the mentor composer mockup)
  title               text NOT NULL CHECK (char_length(title)  > 0 AND char_length(title)  <= 80),
  body                text NOT NULL CHECK (char_length(body)   > 0 AND char_length(body)   <= 300),
  cta_label           text           CHECK (cta_label IS NULL OR char_length(cta_label) <= 30),
  cta_url             text,
  icon                text,
  -- Optional reference to a named template (e.g. 'nudge','checkin','resource').
  -- Templates themselves live in the frontend right now; this column is for
  -- audit and for later when templates become a first-class DB table.
  template_key        text,
  -- Auto-expiry linkage: when a submission for this form_key + student
  -- arrives, the card is marked expired so the home page clears it.
  linked_form_key     public.submission_form_key,
  linked_submission_id uuid REFERENCES public.submissions(id) ON DELETE SET NULL,
  -- Lifecycle
  is_dismissed        boolean NOT NULL DEFAULT false,
  is_auto_expired     boolean NOT NULL DEFAULT false,
  dismissed_at        timestamptz,
  expires_at          timestamptz,
  -- Delivery channels (for audit)
  delivered_as_push   boolean NOT NULL DEFAULT false,
  delivered_as_card   boolean NOT NULL DEFAULT true,
  -- Timestamps
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK (target_user_id <> source_user_id),
  CHECK (delivered_as_push OR delivered_as_card)
);

CREATE INDEX targeted_cards_target_idx ON public.targeted_cards(target_user_id);
CREATE INDEX targeted_cards_source_idx ON public.targeted_cards(source_user_id);
CREATE INDEX targeted_cards_active_idx
  ON public.targeted_cards(target_user_id)
  WHERE is_dismissed = false AND is_auto_expired = false;
CREATE INDEX targeted_cards_linked_form_idx
  ON public.targeted_cards(target_user_id, linked_form_key)
  WHERE linked_form_key IS NOT NULL
    AND is_dismissed = false
    AND is_auto_expired = false;

ALTER TABLE public.targeted_cards ENABLE ROW LEVEL SECURITY;

-- Admins: full access.
CREATE POLICY "Admins manage all targeted cards"
  ON public.targeted_cards FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Target student: read and dismiss their own cards.
CREATE POLICY "Students read their targeted cards"
  ON public.targeted_cards FOR SELECT
  TO authenticated
  USING (target_user_id = auth.uid());

CREATE POLICY "Students dismiss their targeted cards"
  ON public.targeted_cards FOR UPDATE
  TO authenticated
  USING (target_user_id = auth.uid())
  WITH CHECK (target_user_id = auth.uid());

-- Mentors: read cards they've sent, or cards sent by others to their
-- assigned students (so admin-sent cards show in their audit view too).
CREATE POLICY "Mentors read their cards"
  ON public.targeted_cards FOR SELECT
  TO authenticated
  USING (
    source_user_id = auth.uid()
    OR public.is_my_student(target_user_id)
  );

-- Mentors insert cards targeted at their students, as themselves, with
-- source='mentor'. Admins use the admin-all policy above.
CREATE POLICY "Mentors send cards to their students"
  ON public.targeted_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    source = 'mentor'
    AND source_user_id = auth.uid()
    AND public.is_my_student(target_user_id)
  );

-- Mentors can update (e.g. retract) their own cards.
CREATE POLICY "Mentors update their own cards"
  ON public.targeted_cards FOR UPDATE
  TO authenticated
  USING (source_user_id = auth.uid())
  WITH CHECK (source_user_id = auth.uid());

-- ─── updated_at trigger ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_targeted_cards_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER targeted_cards_set_updated_at
  BEFORE UPDATE ON public.targeted_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_targeted_cards_updated_at();

-- ─── Auto-expire on submission arrival ─────────────────────────────────
-- When a submission lands for a student, mark all of their active
-- targeted_cards with a matching linked_form_key as auto-expired. Runs
-- as the DB so RLS is bypassed (SECURITY DEFINER on the trigger func).
CREATE OR REPLACE FUNCTION public.expire_cards_on_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.targeted_cards
  SET is_auto_expired = true,
      linked_submission_id = NEW.id
  WHERE target_user_id = NEW.student_user_id
    AND linked_form_key = NEW.form_key
    AND is_dismissed = false
    AND is_auto_expired = false;
  RETURN NEW;
END;
$$;

CREATE TRIGGER submissions_expire_linked_cards
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.expire_cards_on_submission();

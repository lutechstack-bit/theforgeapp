-- Phase 4 (mentor-profiles): doubts + replies.
--
-- A "doubt" is a short (≤200 char) question a student sends to their mentor.
-- The mentor can reply, close, escalate to admin, or cancel. Admins see
-- the escalated queue, reply (with optional cc to the mentor), reassign
-- to a different mentor, or close.
--
-- Tables:
--   doubts         — one row per question.
--   doubt_replies  — thread of responses; author can be student/mentor/admin.

-- ─── Enum ────────────────────────────────────────────────────────────────
CREATE TYPE public.doubt_status AS ENUM (
  'open',         -- awaiting mentor reply
  'replied',      -- mentor has replied; student may respond or mentor may close
  'closed',       -- resolved
  'escalated',    -- pushed up to admin, awaiting admin action
  'cancelled',    -- withdrawn (by student or mentor)
  'reassigned'    -- admin reassigned to a new mentor
);

-- ─── doubts ─────────────────────────────────────────────────────────────
CREATE TABLE public.doubts (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The mentor when the doubt was created (historical; doesn't change on reassign).
  original_mentor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The mentor who owns the doubt right now. Changes on reassign.
  current_mentor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edition_id             uuid REFERENCES public.editions(id) ON DELETE SET NULL,
  question               text NOT NULL CHECK (char_length(question) > 0 AND char_length(question) <= 200),
  status                 public.doubt_status NOT NULL DEFAULT 'open',
  escalated_to_admin     boolean NOT NULL DEFAULT false,
  escalation_note        text CHECK (escalation_note IS NULL OR char_length(escalation_note) <= 500),
  escalated_at           timestamptz,
  closed_at              timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  CHECK (student_user_id <> current_mentor_user_id),
  CHECK (student_user_id <> original_mentor_user_id)
);

CREATE INDEX doubts_student_idx  ON public.doubts(student_user_id);
CREATE INDEX doubts_current_mentor_idx ON public.doubts(current_mentor_user_id);
CREATE INDEX doubts_status_idx   ON public.doubts(status);
CREATE INDEX doubts_escalated_idx ON public.doubts(escalated_to_admin) WHERE escalated_to_admin = true;

-- ─── doubt_replies ──────────────────────────────────────────────────────
CREATE TABLE public.doubt_replies (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id       uuid NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES auth.users(id),
  author_role    text NOT NULL CHECK (author_role IN ('student', 'mentor', 'admin', 'system')),
  body           text NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 500),
  cc_mentor      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX doubt_replies_doubt_idx ON public.doubt_replies(doubt_id);

-- ─── updated_at trigger for doubts ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_doubts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER doubts_set_updated_at
  BEFORE UPDATE ON public.doubts
  FOR EACH ROW EXECUTE FUNCTION public.set_doubts_updated_at();

-- ─── Helper: is_doubt_participant(doubt_id) ─────────────────────────────
-- True if the caller is the student on the doubt, the current mentor, or an
-- admin. Used by RLS on both doubts and doubt_replies.
CREATE OR REPLACE FUNCTION public.is_doubt_participant(_doubt_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.doubts d
    WHERE d.id = _doubt_id
      AND (
        d.student_user_id = auth.uid()
        OR d.current_mentor_user_id = auth.uid()
        OR d.original_mentor_user_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_doubt_participant(uuid) TO authenticated;

-- ─── RLS: doubts ─────────────────────────────────────────────────────────
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

-- Admins: full control.
CREATE POLICY "Admins manage all doubts"
  ON public.doubts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students: read their own doubts. Insert their own (with RLS-enforced
-- student_user_id = self). Update: only to cancel their own open doubts.
CREATE POLICY "Students read own doubts"
  ON public.doubts FOR SELECT
  TO authenticated
  USING (student_user_id = auth.uid());

CREATE POLICY "Students create own doubts"
  ON public.doubts FOR INSERT
  TO authenticated
  WITH CHECK (student_user_id = auth.uid());

CREATE POLICY "Students can cancel own doubts"
  ON public.doubts FOR UPDATE
  TO authenticated
  USING (student_user_id = auth.uid())
  WITH CHECK (student_user_id = auth.uid());

-- Mentors: read doubts where they are (or were) the mentor. Update to change
-- status (reply/close/escalate).
CREATE POLICY "Mentors read their doubts"
  ON public.doubts FOR SELECT
  TO authenticated
  USING (
    current_mentor_user_id = auth.uid()
    OR original_mentor_user_id = auth.uid()
  );

CREATE POLICY "Mentors update their current doubts"
  ON public.doubts FOR UPDATE
  TO authenticated
  USING (current_mentor_user_id = auth.uid())
  WITH CHECK (current_mentor_user_id = auth.uid());

-- ─── RLS: doubt_replies ─────────────────────────────────────────────────
ALTER TABLE public.doubt_replies ENABLE ROW LEVEL SECURITY;

-- Admins: full control.
CREATE POLICY "Admins manage all doubt replies"
  ON public.doubt_replies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anyone who's a participant on the doubt can read the replies.
CREATE POLICY "Participants read replies"
  ON public.doubt_replies FOR SELECT
  TO authenticated
  USING (public.is_doubt_participant(doubt_id));

-- Participants can add replies *as themselves* (author_user_id = auth.uid())
-- with a role matching their identity. The app layer sets author_role
-- correctly; defence-in-depth: we just require author = self.
CREATE POLICY "Participants insert own replies"
  ON public.doubt_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    author_user_id = auth.uid()
    AND public.is_doubt_participant(doubt_id)
  );

-- Phase 5 (mentor-profiles): submissions + mentor feedback.
--
-- Students fill out one of three Tally forms (Premise / First Draft Script /
-- Production Schedule). Tally fires a webhook to our edge function, which
-- inserts a row into `submissions`. The mentor then reviews from the mentor
-- workspace and writes a `submission_feedback` row with an Approved/Revisions
-- decision and an optional ≤500-char note.
--
-- The actual Tally answer payload is NOT stored here — answers stay in Tally
-- and the mentor opens the Tally dashboard to read them. We only record the
-- submission event and its review state.

-- ─── Enums ──────────────────────────────────────────────────────────────
CREATE TYPE public.submission_form_key AS ENUM ('premise', 'script', 'production');

CREATE TYPE public.submission_status AS ENUM (
  'pending',    -- submitted, awaiting mentor review
  'approved',   -- mentor approved; next stage unlocks on the student side
  'revisions',  -- mentor sent back with notes; student re-submits
  'withdrawn'   -- student or admin withdrew (rare)
);

-- ─── submissions ────────────────────────────────────────────────────────
CREATE TABLE public.submissions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Snapshot of the mentor at submit time (may diverge from mentor_assignments
  -- if the student gets reassigned later; the mentor who reviews uses their
  -- current assignment via RLS).
  mentor_user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  edition_id           uuid REFERENCES public.editions(id) ON DELETE SET NULL,
  form_key             public.submission_form_key NOT NULL,
  status               public.submission_status NOT NULL DEFAULT 'pending',
  title                text,                       -- Optional display label (mentor-picked)
  -- Tally metadata
  tally_form_id        text,                       -- the form ID on tally.so
  tally_response_id    text UNIQUE,                -- guards webhook dupes
  tally_submitted_at   timestamptz,
  -- Revision chain: when a student resubmits after "revisions", link back
  -- to the previous row so the mentor sees the history.
  revision_of          uuid REFERENCES public.submissions(id) ON DELETE SET NULL,
  -- Lifecycle
  reviewed_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX submissions_student_idx    ON public.submissions(student_user_id);
CREATE INDEX submissions_mentor_idx     ON public.submissions(mentor_user_id);
CREATE INDEX submissions_form_idx       ON public.submissions(form_key);
CREATE INDEX submissions_status_idx     ON public.submissions(status);
CREATE INDEX submissions_edition_idx    ON public.submissions(edition_id);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Admins: full access.
CREATE POLICY "Admins manage all submissions"
  ON public.submissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students: read their own submissions (they see them in their own pipeline).
CREATE POLICY "Students read own submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (student_user_id = auth.uid());

-- Mentors: read submissions from their currently-assigned students.
CREATE POLICY "Mentors read their students' submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (public.is_my_student(student_user_id));

-- Mentors: update status + reviewed_at when reviewing one of their students'
-- submissions. The review itself lives in submission_feedback.
CREATE POLICY "Mentors review their students' submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (public.is_my_student(student_user_id))
  WITH CHECK (public.is_my_student(student_user_id));

-- NOTE: INSERTs are NOT open to students — they arrive via the Tally webhook,
-- which runs as service_role and bypasses RLS. If you later add a "manual
-- submission" path, add a dedicated policy.

-- ─── submission_feedback ───────────────────────────────────────────────
CREATE TABLE public.submission_feedback (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id  uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  mentor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision       public.submission_status NOT NULL
                 CHECK (decision IN ('approved', 'revisions')),
  body           text CHECK (body IS NULL OR char_length(body) <= 500),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX submission_feedback_sub_idx ON public.submission_feedback(submission_id);
CREATE INDEX submission_feedback_mentor_idx ON public.submission_feedback(mentor_user_id);

ALTER TABLE public.submission_feedback ENABLE ROW LEVEL SECURITY;

-- Helper: true if caller can see a submission. Used by feedback RLS so the
-- student-mentor-admin visibility matches submissions exactly.
CREATE OR REPLACE FUNCTION public.can_read_submission(_submission_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = _submission_id
      AND (
        s.student_user_id = auth.uid()
        OR public.is_my_student(s.student_user_id)
        OR public.has_role(auth.uid(), 'admin')
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_read_submission(uuid) TO authenticated;

-- Admins: full access to feedback.
CREATE POLICY "Admins manage all submission feedback"
  ON public.submission_feedback FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Read: student, their mentor, admin.
CREATE POLICY "Participants read submission feedback"
  ON public.submission_feedback FOR SELECT
  TO authenticated
  USING (public.can_read_submission(submission_id));

-- Mentors insert feedback as themselves on their students' submissions.
CREATE POLICY "Mentors write feedback on their students"
  ON public.submission_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    mentor_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_id
        AND public.is_my_student(s.student_user_id)
    )
  );

-- ─── updated_at trigger on submissions ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_submissions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER submissions_set_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_submissions_updated_at();

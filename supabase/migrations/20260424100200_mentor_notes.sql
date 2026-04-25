-- Phase 3 (mentor-profiles): private mentor notes per student.
--
-- Mentors jot down observations about each assigned student. Only mentors
-- assigned to that student (via mentor_assignments) and admins can read/write.
-- Students cannot see these notes — this is the mentor's private notebook.

CREATE TABLE public.mentor_notes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body             text NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 2000),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX mentor_notes_student_idx ON public.mentor_notes(student_user_id);
CREATE INDEX mentor_notes_mentor_idx  ON public.mentor_notes(mentor_user_id);

ALTER TABLE public.mentor_notes ENABLE ROW LEVEL SECURITY;

-- Admins: full access.
CREATE POLICY "Admins manage all mentor notes"
  ON public.mentor_notes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Mentors: read notes they wrote *and* notes any mentor wrote about their
-- assigned students (so co-mentoring handoffs preserve context).
CREATE POLICY "Mentors read notes on their students"
  ON public.mentor_notes FOR SELECT
  TO authenticated
  USING (
    mentor_user_id = auth.uid()
    OR public.is_my_student(student_user_id)
  );

-- Mentors can only create notes about their assigned students, as themselves.
CREATE POLICY "Mentors insert notes on their students"
  ON public.mentor_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    mentor_user_id = auth.uid()
    AND public.is_my_student(student_user_id)
  );

-- Mentors edit / delete only their own notes.
CREATE POLICY "Mentors update their own notes"
  ON public.mentor_notes FOR UPDATE
  TO authenticated
  USING (mentor_user_id = auth.uid())
  WITH CHECK (mentor_user_id = auth.uid());

CREATE POLICY "Mentors delete their own notes"
  ON public.mentor_notes FOR DELETE
  TO authenticated
  USING (mentor_user_id = auth.uid());

-- updated_at trigger — reuses the function from migration 20260424100100
-- if it happens to be reusable here; otherwise inline a fresh one.
CREATE OR REPLACE FUNCTION public.set_mentor_notes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER mentor_notes_set_updated_at
  BEFORE UPDATE ON public.mentor_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_mentor_notes_updated_at();

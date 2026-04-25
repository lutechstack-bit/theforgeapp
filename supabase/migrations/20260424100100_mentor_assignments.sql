-- Phase 1 (mentor-profiles): mentor profiles + student assignments + helpers.
--
-- Two tables:
--   * mentor_profiles — per-mentor config (capacity, bio, accepting-students flag).
--   * mentor_assignments — links a mentor to a student within an edition.
--
-- Also a SECURITY DEFINER helper `public.is_my_student(uuid)` that subsequent
-- features (submissions, doubts, private notes) can reuse in RLS.

-- ───────────────────────────────────────────────────────────────────────────
-- mentor_profiles
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.mentor_profiles (
  user_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  capacity             int  NOT NULL DEFAULT 5 CHECK (capacity BETWEEN 1 AND 20),
  bio                  text,
  expertise            text[] NOT NULL DEFAULT ARRAY[]::text[],
  is_accepting_students boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

-- Admins manage every mentor profile.
CREATE POLICY "Admins manage all mentor profiles"
  ON public.mentor_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Mentors read and update their own profile.
CREATE POLICY "Mentors read own profile"
  ON public.mentor_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Mentors update own profile"
  ON public.mentor_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Any authenticated user can read mentor profiles (for showing who their
-- mentor is on the student side). Lock this down later if that's too open.
CREATE POLICY "Authenticated users read mentor profiles"
  ON public.mentor_profiles FOR SELECT
  TO authenticated
  USING (true);

-- ───────────────────────────────────────────────────────────────────────────
-- mentor_assignments
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.mentor_assignments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edition_id        uuid REFERENCES public.editions(id) ON DELETE CASCADE,
  assigned_at       timestamptz NOT NULL DEFAULT now(),
  assigned_by       uuid REFERENCES auth.users(id),
  -- A student can have only one mentor per edition.
  UNIQUE (student_user_id, edition_id),
  -- A mentor can't be assigned to themselves as a student.
  CHECK (mentor_user_id <> student_user_id)
);

CREATE INDEX mentor_assignments_mentor_idx  ON public.mentor_assignments(mentor_user_id);
CREATE INDEX mentor_assignments_student_idx ON public.mentor_assignments(student_user_id);
CREATE INDEX mentor_assignments_edition_idx ON public.mentor_assignments(edition_id);

ALTER TABLE public.mentor_assignments ENABLE ROW LEVEL SECURITY;

-- Admins: full control.
CREATE POLICY "Admins manage all assignments"
  ON public.mentor_assignments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Mentors: see assignments where they are the mentor.
CREATE POLICY "Mentors read their assignments"
  ON public.mentor_assignments FOR SELECT
  TO authenticated
  USING (mentor_user_id = auth.uid());

-- Students: see their own assignment (so they can learn who their mentor is).
CREATE POLICY "Students read their own assignment"
  ON public.mentor_assignments FOR SELECT
  TO authenticated
  USING (student_user_id = auth.uid());

-- ───────────────────────────────────────────────────────────────────────────
-- Helper: is_my_student(student_id)
--
-- Used by future mentor-scoped tables (submissions, doubts, private notes)
-- to let a mentor access only their assigned students' records.
-- SECURITY DEFINER so the caller doesn't need direct SELECT on mentor_assignments.
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_my_student(_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentor_assignments
    WHERE mentor_user_id = auth.uid()
      AND student_user_id = _student_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_my_student(uuid) TO authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- updated_at trigger for mentor_profiles
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_mentor_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER mentor_profiles_set_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_mentor_profiles_updated_at();

-- ───────────────────────────────────────────────────────────────────────────
-- Feature flag: mentors_enabled — off by default while we roll this out.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO public.app_feature_flags (feature_key, is_enabled)
VALUES ('mentors_enabled', false)
ON CONFLICT (feature_key) DO NOTHING;

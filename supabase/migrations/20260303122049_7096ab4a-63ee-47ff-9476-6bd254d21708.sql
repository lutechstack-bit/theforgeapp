
-- 1. Collaborator Profiles
CREATE TABLE public.collaborator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  intro text,
  occupations text[] DEFAULT '{}',
  open_to_remote boolean DEFAULT false,
  is_published boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collaborator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view published collaborator profiles"
  ON public.collaborator_profiles FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Users can view own collaborator profile"
  ON public.collaborator_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collaborator profile"
  ON public.collaborator_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collaborator profile"
  ON public.collaborator_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collaborator profile"
  ON public.collaborator_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all collaborator profiles"
  ON public.collaborator_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_collaborator_profiles_updated_at
  BEFORE UPDATE ON public.collaborator_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Collaborator Works
CREATE TABLE public.collaborator_works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  work_type text,
  year text,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collaborator_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view works of published collaborators"
  ON public.collaborator_works FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.collaborator_profiles cp
    WHERE cp.user_id = collaborator_works.user_id AND cp.is_published = true
  ));

CREATE POLICY "Users can view own collaborator works"
  ON public.collaborator_works FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collaborator works"
  ON public.collaborator_works FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collaborator works"
  ON public.collaborator_works FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collaborator works"
  ON public.collaborator_works FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all collaborator works"
  ON public.collaborator_works FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Collaboration Requests
CREATE TABLE public.collaboration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'unread',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send collaboration requests"
  ON public.collaboration_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view own sent and received requests"
  ON public.collaboration_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can update received requests"
  ON public.collaboration_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = to_user_id);

CREATE POLICY "Admins can manage all collaboration requests"
  ON public.collaboration_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for collaboration requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_requests;

-- 4. Collaborator Occupations (lookup)
CREATE TABLE public.collaborator_occupations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collaborator_occupations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active occupations"
  ON public.collaborator_occupations FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage occupations"
  ON public.collaborator_occupations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default occupations
INSERT INTO public.collaborator_occupations (name, order_index) VALUES
  ('Photographer', 0),
  ('Cinematographer', 1),
  ('Editor', 2),
  ('Director', 3),
  ('Colorist', 4),
  ('Writer', 5),
  ('Illustrator', 6),
  ('Animator', 7),
  ('Sound Designer', 8),
  ('Producer', 9);

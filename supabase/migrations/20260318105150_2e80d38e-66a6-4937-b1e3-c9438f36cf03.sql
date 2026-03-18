
-- Add new columns to collaborator_profiles
ALTER TABLE public.collaborator_profiles 
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS about text,
  ADD COLUMN IF NOT EXISTS available_for_hire boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS portfolio_type text;

-- Create gigs table
CREATE TABLE public.gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  category text,
  gig_type text DEFAULT 'freelance',
  description text,
  roles_needed text[] DEFAULT '{}',
  pay_type text DEFAULT 'paid',
  budget text,
  duration text,
  location text,
  visibility text DEFAULT 'all',
  contact_info text,
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view published gigs" ON public.gigs
  FOR SELECT TO authenticated USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Users can insert own gigs" ON public.gigs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gigs" ON public.gigs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gigs" ON public.gigs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all gigs" ON public.gigs
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create saved_profiles table
CREATE TABLE public.saved_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  saved_user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, saved_user_id)
);

ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saves" ON public.saved_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on gigs
CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON public.gigs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Allow authenticated users to view profiles of published collaborators
CREATE POLICY "View profiles of published collaborators" ON public.profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.collaborator_profiles cp 
    WHERE cp.user_id = profiles.id AND cp.is_published = true
  ));

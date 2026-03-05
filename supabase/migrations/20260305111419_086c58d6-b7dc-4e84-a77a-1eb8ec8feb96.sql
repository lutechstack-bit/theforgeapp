
CREATE TABLE public.app_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text UNIQUE NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read flags
CREATE POLICY "Anyone can read feature flags"
  ON public.app_feature_flags FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update feature flags"
  ON public.app_feature_flags FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert
CREATE POLICY "Admins can insert feature flags"
  ON public.app_feature_flags FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed the events flag
INSERT INTO public.app_feature_flags (feature_key, is_enabled) VALUES ('events_enabled', true);

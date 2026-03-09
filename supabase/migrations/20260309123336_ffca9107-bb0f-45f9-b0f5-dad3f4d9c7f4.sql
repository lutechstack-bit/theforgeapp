
CREATE TABLE public.alumni_showcase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author_name text NOT NULL,
  cohort_type text NOT NULL DEFAULT 'FORGE',
  media_type text NOT NULL DEFAULT 'video',
  media_url text,
  thumbnail_url text,
  redirect_url text,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alumni_showcase ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active alumni showcase"
  ON public.alumni_showcase
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage alumni showcase"
  ON public.alumni_showcase
  FOR ALL
  TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

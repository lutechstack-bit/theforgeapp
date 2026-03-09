
CREATE TABLE public.explore_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  label text,
  image_url text,
  redirect_url text,
  gradient text,
  program_tab text NOT NULL DEFAULT 'online',
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.explore_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active explore programs"
  ON public.explore_programs
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage explore programs"
  ON public.explore_programs
  FOR ALL
  TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

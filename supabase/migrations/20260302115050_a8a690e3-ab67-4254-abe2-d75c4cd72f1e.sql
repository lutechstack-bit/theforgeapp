
-- Drop old perks table and recreate with new schema
DROP TABLE IF EXISTS public.perks CASCADE;

-- Table 1: perks
CREATE TABLE public.perks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  headline text NOT NULL,
  logo_url text,
  banner_url text,
  banner_color text DEFAULT '#1a1a2e',
  about text,
  offer_details text,
  how_to_avail text,
  notes text,
  claim_url text,
  category text DEFAULT 'Equipment',
  cohort_types text[] DEFAULT ARRAY['FORGE','FORGE_WRITING','FORGE_CREATORS'],
  is_active boolean DEFAULT true,
  is_coming_soon boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.perks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage perks" ON public.perks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active perks" ON public.perks FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Table 2: perk_form_fields
CREATE TABLE public.perk_form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perk_id uuid NOT NULL REFERENCES public.perks(id) ON DELETE CASCADE,
  label text NOT NULL,
  field_type text DEFAULT 'text',
  placeholder text,
  is_required boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.perk_form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage perk form fields" ON public.perk_form_fields FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view perk form fields" ON public.perk_form_fields FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Table 3: perk_claims
CREATE TABLE public.perk_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perk_id uuid NOT NULL REFERENCES public.perks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  form_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.perk_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own claims" ON public.perk_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own claims" ON public.perk_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims" ON public.perk_claims FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all claims" ON public.perk_claims FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

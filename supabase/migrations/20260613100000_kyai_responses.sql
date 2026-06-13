-- Know Your Builder (KYB) responses for the Forge AI (FAI) cohort.
-- Mirrors kyw_responses + AI-builder specific columns. Run in Lovable SQL editor.

CREATE TABLE IF NOT EXISTS public.kyai_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- General details
  certificate_name text,
  current_occupation text,
  instagram_id text,
  date_of_birth date,

  -- Location
  city text,
  country text,

  -- AI experience
  ai_experience_level text,
  ai_usage_frequency text,
  ai_tools_used text[],
  ai_use_for text[],

  -- AI skills (proficiency grid) + coding
  proficiency_prompting text,
  proficiency_ai_media text,
  proficiency_automation text,
  proficiency_coding text,
  proficiency_ai_agents text,
  coding_experience text,

  -- Builds & goals
  past_ai_builds text,
  what_to_build text,
  has_laptop text,
  program_outcome text,
  biggest_roadblock text,
  learning_goals text,

  -- Personality & vibe
  mbti_type text,
  chronotype text,
  forge_intent text,
  forge_intent_other text,

  -- Hospitality
  meal_preference text,
  food_allergies text,
  medication_support text,
  tshirt_size text,
  emergency_contact_name text,
  emergency_contact_number text,

  -- T&C
  terms_accepted boolean DEFAULT false,
  terms_accepted_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kyai_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kyai_own_select ON public.kyai_responses;
CREATE POLICY kyai_own_select ON public.kyai_responses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS kyai_own_insert ON public.kyai_responses;
CREATE POLICY kyai_own_insert ON public.kyai_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS kyai_own_update ON public.kyai_responses;
CREATE POLICY kyai_own_update ON public.kyai_responses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS kyai_admin_select ON public.kyai_responses;
CREATE POLICY kyai_admin_select ON public.kyai_responses FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

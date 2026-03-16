
-- 1. Drop recursive same-edition policies that cause infinite recursion
DROP POLICY IF EXISTS "Same edition users can view batchmate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Same edition users can view batchmate kyf responses" ON public.kyf_responses;
DROP POLICY IF EXISTS "Same edition users can view batchmate kyc responses" ON public.kyc_responses;
DROP POLICY IF EXISTS "Same edition users can view batchmate kyw responses" ON public.kyw_responses;

-- 2. Create a security definer function to get the caller's edition_id safely
CREATE OR REPLACE FUNCTION public.get_my_edition_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT edition_id FROM public.profiles WHERE id = auth.uid()
$$;

-- 3. Create secure RPC: get_batchmates_for_my_edition
CREATE OR REPLACE FUNCTION public.get_batchmates_for_my_edition()
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text,
  city text,
  specialty text,
  instagram_handle text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.city, p.specialty, p.instagram_handle
  FROM public.profiles p
  WHERE p.edition_id IS NOT NULL
    AND p.edition_id = public.get_my_edition_id()
    AND p.id != auth.uid()
  ORDER BY p.full_name
$$;

-- 4. Create secure RPC: get_batchmate_details
CREATE OR REPLACE FUNCTION public.get_batchmate_details(member_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_edition uuid;
  member_edition uuid;
  member_cohort_type text;
  result jsonb;
  ky_data jsonb;
BEGIN
  -- Get caller's edition
  my_edition := public.get_my_edition_id();
  IF my_edition IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get member's edition and verify same edition
  SELECT p.edition_id INTO member_edition
  FROM public.profiles p WHERE p.id = member_id;

  IF member_edition IS NULL OR member_edition != my_edition THEN
    RETURN NULL;
  END IF;

  -- Get cohort type
  SELECT e.cohort_type::text INTO member_cohort_type
  FROM public.editions e WHERE e.id = member_edition;

  -- Build base result from profile (safe fields only)
  SELECT jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'city', p.city,
    'specialty', p.specialty,
    'instagram_handle', p.instagram_handle,
    'cohort_type', member_cohort_type
  ) INTO result
  FROM public.profiles p WHERE p.id = member_id;

  -- Fetch cohort-specific KY data (safe fields only)
  IF member_cohort_type = 'FORGE' THEN
    SELECT jsonb_build_object(
      'current_occupation', r.current_occupation,
      'mbti_type', r.mbti_type,
      'chronotype', r.chronotype,
      'top_3_movies', r.top_3_movies,
      'proficiency_screenwriting', r.proficiency_screenwriting,
      'proficiency_direction', r.proficiency_direction,
      'proficiency_cinematography', r.proficiency_cinematography,
      'proficiency_editing', r.proficiency_editing,
      'languages_known', r.languages_known
    ) INTO ky_data
    FROM public.kyf_responses r WHERE r.user_id = member_id;
  ELSIF member_cohort_type = 'FORGE_CREATORS' THEN
    SELECT jsonb_build_object(
      'current_status', r.current_status,
      'mbti_type', r.mbti_type,
      'chronotype', r.chronotype,
      'primary_platform', r.primary_platform,
      'top_3_creators', r.top_3_creators,
      'proficiency_content_creation', r.proficiency_content_creation,
      'proficiency_storytelling', r.proficiency_storytelling,
      'proficiency_video_production', r.proficiency_video_production
    ) INTO ky_data
    FROM public.kyc_responses r WHERE r.user_id = member_id;
  ELSIF member_cohort_type = 'FORGE_WRITING' THEN
    SELECT jsonb_build_object(
      'current_occupation', r.current_occupation,
      'mbti_type', r.mbti_type,
      'chronotype', r.chronotype,
      'primary_language', r.primary_language,
      'writing_types', r.writing_types,
      'top_3_writers_books', r.top_3_writers_books,
      'proficiency_writing', r.proficiency_writing,
      'proficiency_story_voice', r.proficiency_story_voice
    ) INTO ky_data
    FROM public.kyw_responses r WHERE r.user_id = member_id;
  END IF;

  result := result || COALESCE(jsonb_build_object('ky_data', ky_data), '{}'::jsonb);
  RETURN result;
END;
$$;

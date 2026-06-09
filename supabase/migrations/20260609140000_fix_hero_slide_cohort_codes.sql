-- Fix: homepage_hero_slides used legacy cohort_type names (FORGE / FORGE_WRITING /
-- FORGE_CREATORS) while the rest of the app uses FFM / FW / FC / FAI. This made the
-- hero carousel never match the user's cohort (admin "Filmmaking" filter showed
-- "No slides found", and the cohort simulator couldn't swap images).
-- Run this in the Lovable SQL editor.

UPDATE public.homepage_hero_slides SET cohort_type = 'FFM' WHERE cohort_type = 'FORGE';
UPDATE public.homepage_hero_slides SET cohort_type = 'FW'  WHERE cohort_type = 'FORGE_WRITING';
UPDATE public.homepage_hero_slides SET cohort_type = 'FC'  WHERE cohort_type = 'FORGE_CREATORS';
UPDATE public.homepage_hero_slides SET cohort_type = 'FAI' WHERE cohort_type = 'FORGE_AI';

-- Stop new rows defaulting to the legacy 'FORGE' value.
ALTER TABLE public.homepage_hero_slides ALTER COLUMN cohort_type SET DEFAULT 'FFM';

-- Sanity check (optional): should return only FFM / FW / FC / FAI
-- SELECT cohort_type, count(*) FROM public.homepage_hero_slides GROUP BY cohort_type;

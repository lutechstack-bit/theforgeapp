-- Self-service edition selection: a student's COHORT is now stored on their
-- profile (set at onboarding from the TeleCRM product), independent of edition.
-- The student then picks their EDITION (filtered to this cohort) on first login.
-- Idempotent: safe to re-run.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cohort_type public.cohort_type;

-- Backfill existing students' cohort from the edition they're already in,
-- so nothing is disturbed for people who already have an edition.
UPDATE public.profiles p
SET cohort_type = e.cohort_type
FROM public.editions e
WHERE p.edition_id = e.id
  AND p.cohort_type IS NULL;

-- Deduplicate roadmap_days template rows.
--
-- Root cause: migration 20260317100346 had already marked some edition-specific
-- rows as is_template=true via UPDATE statements. Then 20260427074407 ran
-- INSERT...SELECT from the same source editions, creating a second copy of every
-- row. This migration keeps only ONE row per (cohort_type, day_number),
-- retaining the most recently created one.
--
-- Also deduplicates per-edition online sessions (day_number < 0) in case the
-- "Seed online sessions" button was clicked on an edition that already had rows.

-- Step 1: Deduplicate template rows — keep newest per (cohort_type, day_number)
DELETE FROM public.roadmap_days
WHERE is_template = true
  AND edition_id IS NULL
  AND id NOT IN (
    SELECT DISTINCT ON (cohort_type, day_number) id
    FROM public.roadmap_days
    WHERE is_template = true AND edition_id IS NULL
    ORDER BY cohort_type, day_number, created_at DESC
  );

-- Step 2: Deduplicate per-edition online sessions — keep newest per (edition_id, day_number)
DELETE FROM public.roadmap_days
WHERE is_template = false
  AND edition_id IS NOT NULL
  AND day_number < 0
  AND id NOT IN (
    SELECT DISTINCT ON (edition_id, day_number) id
    FROM public.roadmap_days
    WHERE is_template = false
      AND edition_id IS NOT NULL
      AND day_number < 0
    ORDER BY edition_id, day_number, created_at DESC
  );

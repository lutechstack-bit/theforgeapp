
-- Add cohort_type and is_template to roadmap_days
ALTER TABLE roadmap_days ADD COLUMN cohort_type cohort_type;
ALTER TABLE roadmap_days ADD COLUMN is_template boolean DEFAULT false;

-- Add online_end_date to editions
ALTER TABLE editions ADD COLUMN online_end_date timestamp with time zone;

-- Backfill cohort_type from editions
UPDATE roadmap_days rd
SET cohort_type = e.cohort_type
FROM editions e WHERE rd.edition_id = e.id;

-- Shared (null edition_id) defaults to FORGE
UPDATE roadmap_days SET cohort_type = 'FORGE' WHERE edition_id IS NULL AND cohort_type IS NULL;

-- Mark ONE master template per cohort (most complete sets)
UPDATE roadmap_days SET is_template = true WHERE edition_id = '1916b61f-f414-4e11-82b9-8c7c857b57dd';
UPDATE roadmap_days SET is_template = true WHERE edition_id = '9a202834-5928-42f3-93eb-0e7791fe0e25';
UPDATE roadmap_days SET is_template = true WHERE edition_id = '7f94f1b7-2fb6-4fb4-869e-6957a550c701';

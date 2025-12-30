-- Create cohort_type enum for the three different Forge programs
CREATE TYPE public.cohort_type AS ENUM ('FORGE', 'FORGE_WRITING', 'FORGE_CREATORS');

-- Add cohort_type to editions table
ALTER TABLE public.editions ADD COLUMN cohort_type cohort_type NOT NULL DEFAULT 'FORGE';

-- Add edition_id foreign key to roadmap_days if not exists (already exists based on schema)
-- roadmap_days already has edition_id column

-- Make roadmap_days.edition_id NOT NULL for new rows (existing can remain null)
-- We'll just ensure it's properly linked

-- Add index for faster roadmap queries by edition
CREATE INDEX IF NOT EXISTS idx_roadmap_days_edition ON public.roadmap_days(edition_id);

-- Add RLS policy update to ensure roadmap days are viewable by users of that edition
-- (existing policy already allows everyone to view)
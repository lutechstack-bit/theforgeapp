-- Add cohort_types array column to mentors table
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS cohort_types TEXT[] DEFAULT ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'];

-- Add cohort_types array column to alumni_testimonials table
ALTER TABLE public.alumni_testimonials 
ADD COLUMN IF NOT EXISTS cohort_types TEXT[] DEFAULT ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'];

-- Update existing mentor records to show in all cohorts (backward compatibility)
UPDATE public.mentors 
SET cohort_types = ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']
WHERE cohort_types IS NULL OR cohort_types = '{}';

-- Update existing testimonial records to show in all cohorts (backward compatibility)
UPDATE public.alumni_testimonials 
SET cohort_types = ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']
WHERE cohort_types IS NULL OR cohort_types = '{}';
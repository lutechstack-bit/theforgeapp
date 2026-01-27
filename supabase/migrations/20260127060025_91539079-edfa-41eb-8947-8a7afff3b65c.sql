-- Add linked_prep_category to journey_tasks for bidirectional sync with prep checklist
ALTER TABLE journey_tasks 
ADD COLUMN linked_prep_category TEXT DEFAULT NULL;

-- Update existing tasks with their category links
-- Packing task links to packing category
UPDATE journey_tasks 
SET linked_prep_category = 'packing' 
WHERE title ILIKE '%pack your bags%';

-- Script prep for FORGE cohort
UPDATE journey_tasks 
SET linked_prep_category = 'script_prep' 
WHERE title ILIKE '%script%prep%' 
AND 'FORGE' = ANY(cohort_types);

-- Writing prep for FORGE_WRITING cohort  
UPDATE journey_tasks 
SET linked_prep_category = 'writing_prep' 
WHERE title ILIKE '%writing%prep%' 
AND 'FORGE_WRITING' = ANY(cohort_types);

-- Content prep for FORGE_CREATORS cohort
UPDATE journey_tasks 
SET linked_prep_category = 'content_prep' 
WHERE title ILIKE '%content%prep%' 
AND 'FORGE_CREATORS' = ANY(cohort_types);
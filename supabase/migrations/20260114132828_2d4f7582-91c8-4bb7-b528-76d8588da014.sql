-- Add new columns for enhanced day detail content
ALTER TABLE public.roadmap_days
ADD COLUMN IF NOT EXISTS what_youll_learn text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gear_materials text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expected_outcomes text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pro_tips text[] DEFAULT '{}';
-- Add detailed fields to roadmap_days for richer node content
ALTER TABLE public.roadmap_days 
ADD COLUMN IF NOT EXISTS mentors text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS key_learnings text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS activity_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS duration_hours numeric(3,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS intensity_level text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS teaser_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reveal_days_before integer DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.roadmap_days.mentors IS 'Array of mentor/speaker names for this day';
COMMENT ON COLUMN public.roadmap_days.key_learnings IS 'Array of learning outcomes or skills';
COMMENT ON COLUMN public.roadmap_days.activity_type IS 'Type: workshop, session, networking, field-trip, etc.';
COMMENT ON COLUMN public.roadmap_days.duration_hours IS 'Estimated duration in hours';
COMMENT ON COLUMN public.roadmap_days.intensity_level IS 'Energy level: low, medium, high, intense';
COMMENT ON COLUMN public.roadmap_days.teaser_text IS 'Teaser text shown before full reveal (pre-forge)';
COMMENT ON COLUMN public.roadmap_days.reveal_days_before IS 'Days before forge start when full info reveals';
-- Add new columns to roadmap_days for theme, objective, and detailed schedule
ALTER TABLE public.roadmap_days ADD COLUMN IF NOT EXISTS theme_name text;
ALTER TABLE public.roadmap_days ADD COLUMN IF NOT EXISTS objective text;
ALTER TABLE public.roadmap_days ADD COLUMN IF NOT EXISTS schedule jsonb DEFAULT '[]'::jsonb;
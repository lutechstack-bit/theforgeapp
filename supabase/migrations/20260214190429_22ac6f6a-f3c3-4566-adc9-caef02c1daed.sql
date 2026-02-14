
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ky_section_progress jsonb DEFAULT '{}'::jsonb;

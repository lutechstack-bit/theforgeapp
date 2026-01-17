-- Migrate existing past_programs into events table with show_on_homepage = true
INSERT INTO public.events (
  title,
  description,
  event_date,
  image_url,
  is_virtual,
  recording_url,
  show_on_homepage,
  created_at
)
SELECT 
  name as title,
  description,
  (completion_date || 'T18:00:00')::timestamptz as event_date,
  image_url,
  true as is_virtual,
  recording_url,
  true as show_on_homepage,
  created_at
FROM public.past_programs
WHERE is_active = true;
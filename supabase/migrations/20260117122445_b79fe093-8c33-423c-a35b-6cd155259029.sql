-- Add show_on_homepage column to events table
ALTER TABLE public.events 
ADD COLUMN show_on_homepage boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.events.show_on_homepage IS 
'If true, this event will appear on the homepage carousel regardless of date';
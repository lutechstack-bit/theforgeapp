-- Create event_types table for admin-editable event categories
CREATE TABLE public.event_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Calendar',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_types
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_types
CREATE POLICY "Admins can manage event types"
ON public.event_types
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active event types"
ON public.event_types
FOR SELECT
USING (is_active = true);

-- Seed default event types
INSERT INTO public.event_types (name, icon, order_index) VALUES
  ('Let''s Learn', 'GraduationCap', 0),
  ('Let''s Talk', 'MessageCircle', 1),
  ('Decoding Sessions', 'Code', 2),
  ('Community Meetups', 'Users', 3);

-- Add new columns to events table
ALTER TABLE public.events
ADD COLUMN event_type_id UUID REFERENCES public.event_types(id),
ADD COLUMN recording_url TEXT,
ADD COLUMN notes TEXT;

-- Create past_programs table for completed Forge/Live/Write programs
CREATE TABLE public.past_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  program_type TEXT NOT NULL DEFAULT 'FORGE',
  completion_date DATE NOT NULL,
  image_url TEXT,
  description TEXT,
  recording_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on past_programs
ALTER TABLE public.past_programs ENABLE ROW LEVEL SECURITY;

-- RLS policies for past_programs
CREATE POLICY "Admins can manage past programs"
ON public.past_programs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active past programs"
ON public.past_programs
FOR SELECT
USING (is_active = true);
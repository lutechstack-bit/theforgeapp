-- Create learn_programs table for organizing content by series
CREATE TABLE public.learn_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  instructor_name TEXT,
  instructor_avatar TEXT,
  instructor_bio TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on learn_programs
ALTER TABLE public.learn_programs ENABLE ROW LEVEL SECURITY;

-- RLS policies for learn_programs
CREATE POLICY "Admins can manage learn programs"
ON public.learn_programs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active learn programs"
ON public.learn_programs
FOR SELECT
USING (is_active = true);

-- Seed default programs
INSERT INTO public.learn_programs (name, slug, description, order_index) VALUES
  ('Breakthrough Filmmaker Program', 'bfp', 'Intensive masterclasses and workshops from industry experts', 0),
  ('Creator Masterclass', 'masterclass', 'Learn from successful creators and industry leaders', 1),
  ('Workshop Series', 'workshops', 'Hands-on practical sessions for skill development', 2);

-- Add program_id to learn_content
ALTER TABLE public.learn_content
ADD COLUMN program_id UUID REFERENCES public.learn_programs(id);

-- Create learn_watch_progress table for tracking user progress
CREATE TABLE public.learn_watch_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  learn_content_id UUID NOT NULL REFERENCES public.learn_content(id) ON DELETE CASCADE,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  total_seconds INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, learn_content_id)
);

-- Enable RLS on learn_watch_progress
ALTER TABLE public.learn_watch_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for learn_watch_progress
CREATE POLICY "Users can view their own progress"
ON public.learn_watch_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.learn_watch_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.learn_watch_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
ON public.learn_watch_progress
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
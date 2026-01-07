-- Create roadmap_galleries table for Stay Locations and Forge Moments
CREATE TABLE public.roadmap_galleries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  gallery_type TEXT NOT NULL CHECK (gallery_type IN ('stay_location', 'forge_moment')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  location_name TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_films table for Top Films Showcase
CREATE TABLE public.student_films (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration_minutes INTEGER,
  description TEXT,
  award_tags JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prep_checklist_items table for Scripting & Prep Guidelines
CREATE TABLE public.prep_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('script_prep', 'packing', 'mindset', 'technical')),
  title TEXT NOT NULL,
  description TEXT,
  due_days_before INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_prep_progress table for tracking user checklist completion
CREATE TABLE public.user_prep_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checklist_item_id UUID NOT NULL REFERENCES public.prep_checklist_items(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, checklist_item_id)
);

-- Add new columns to roadmap_days
ALTER TABLE public.roadmap_days 
ADD COLUMN IF NOT EXISTS location_image_url TEXT,
ADD COLUMN IF NOT EXISTS milestone_type TEXT CHECK (milestone_type IN ('start', 'midpoint', 'finale') OR milestone_type IS NULL);

-- Create storage bucket for roadmap assets
INSERT INTO storage.buckets (id, name, public) VALUES ('roadmap-assets', 'roadmap-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE public.roadmap_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prep_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for roadmap_galleries
CREATE POLICY "Everyone can view roadmap galleries" ON public.roadmap_galleries
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage roadmap galleries" ON public.roadmap_galleries
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for student_films
CREATE POLICY "Everyone can view student films" ON public.student_films
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage student films" ON public.student_films
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for prep_checklist_items
CREATE POLICY "Everyone can view prep checklist items" ON public.prep_checklist_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage prep checklist items" ON public.prep_checklist_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_prep_progress
CREATE POLICY "Users can view their own progress" ON public.user_prep_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_prep_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON public.user_prep_progress
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.user_prep_progress
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for roadmap-assets bucket
CREATE POLICY "Anyone can view roadmap assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'roadmap-assets');

CREATE POLICY "Admins can upload roadmap assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'roadmap-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roadmap assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'roadmap-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roadmap assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'roadmap-assets' AND has_role(auth.uid(), 'admin'::app_role));
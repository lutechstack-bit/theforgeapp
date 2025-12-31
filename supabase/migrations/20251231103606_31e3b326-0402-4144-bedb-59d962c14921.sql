-- Enhance learn_content table with more fields for DRM-like protection and bonuses
ALTER TABLE public.learn_content 
ADD COLUMN IF NOT EXISTS instructor_name text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS full_description text,
ADD COLUMN IF NOT EXISTS section_type text NOT NULL DEFAULT 'community_sessions',
ADD COLUMN IF NOT EXISTS access_token text DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS bonuses jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add constraint for section_type
ALTER TABLE public.learn_content 
ADD CONSTRAINT learn_content_section_type_check 
CHECK (section_type IN ('community_sessions', 'bfp_sessions'));

-- Create learn_resources table for downloadable bonuses
CREATE TABLE IF NOT EXISTS public.learn_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learn_content_id uuid NOT NULL REFERENCES public.learn_content(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'pdf',
  file_size_mb numeric,
  is_premium boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on learn_resources
ALTER TABLE public.learn_resources ENABLE ROW LEVEL SECURITY;

-- RLS policies for learn_resources
CREATE POLICY "Admins can manage learn resources" 
ON public.learn_resources 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view learn resources" 
ON public.learn_resources 
FOR SELECT 
USING (true);

-- Create video_access_logs table for tracking and security
CREATE TABLE IF NOT EXISTS public.video_access_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  learn_content_id uuid NOT NULL REFERENCES public.learn_content(id) ON DELETE CASCADE,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  watch_duration_seconds integer DEFAULT 0
);

-- Enable RLS on video_access_logs
ALTER TABLE public.video_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_access_logs
CREATE POLICY "Admins can manage video access logs" 
ON public.video_access_logs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own access logs" 
ON public.video_access_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own access logs" 
ON public.video_access_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create storage bucket for learn resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('learn-resources', 'learn-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for learn-resources bucket
CREATE POLICY "Admins can upload learn resources"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'learn-resources' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update learn resources"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'learn-resources' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete learn resources"
ON storage.objects
FOR DELETE
USING (bucket_id = 'learn-resources' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view learn resources"
ON storage.objects
FOR SELECT
USING (bucket_id = 'learn-resources' AND auth.role() = 'authenticated');

-- Add trigger for updated_at on learn_content
CREATE TRIGGER update_learn_content_updated_at
BEFORE UPDATE ON public.learn_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
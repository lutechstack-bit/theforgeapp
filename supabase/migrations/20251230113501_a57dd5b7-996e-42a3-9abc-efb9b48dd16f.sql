-- Update notifications table to support auto_updates system
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS body text,
ADD COLUMN IF NOT EXISTS deep_link text,
ADD COLUMN IF NOT EXISTS expiry_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_update boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Create hero_banners table for admin fixed banners
CREATE TABLE IF NOT EXISTS public.hero_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text,
  cta_link text,
  pinned boolean NOT NULL DEFAULT false,
  priority integer NOT NULL DEFAULT 0,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  audience text NOT NULL DEFAULT 'ALL' CHECK (audience IN ('ALL', 'PREVIEW', 'FULL')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on hero_banners
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- RLS policies for hero_banners
CREATE POLICY "Admins can manage hero banners"
ON public.hero_banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active hero banners"
ON public.hero_banners
FOR SELECT
USING (
  (start_at IS NULL OR start_at <= now()) 
  AND (end_at IS NULL OR end_at >= now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_auto_update ON public.notifications(auto_update, pinned, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expiry ON public.notifications(expiry_at);
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON public.hero_banners(pinned, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hero_banners_timing ON public.hero_banners(start_at, end_at);
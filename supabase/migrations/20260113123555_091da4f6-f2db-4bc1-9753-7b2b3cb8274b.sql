-- Add tagline column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Create user_works table for custom projects
CREATE TABLE public.user_works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'personal',
  media_type TEXT NOT NULL DEFAULT 'link',
  thumbnail_url TEXT,
  media_url TEXT,
  award_tags JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create public_portfolios table for sharing settings
CREATE TABLE public.public_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_portfolios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_works
CREATE POLICY "Users can view their own works"
ON public.user_works FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own works"
ON public.user_works FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own works"
ON public.user_works FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own works"
ON public.user_works FOR DELETE
USING (auth.uid() = user_id);

-- Public can view works for public portfolios
CREATE POLICY "Public can view works for public portfolios"
ON public.user_works FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.public_portfolios pp 
    WHERE pp.user_id = user_works.user_id 
    AND pp.is_public = true
  )
);

-- RLS Policies for public_portfolios
CREATE POLICY "Users can view their own portfolio settings"
ON public.public_portfolios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio settings"
ON public.public_portfolios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio settings"
ON public.public_portfolios FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view public portfolios"
ON public.public_portfolios FOR SELECT
USING (is_public = true);

-- Create indexes for performance
CREATE INDEX idx_user_works_user_id ON public.user_works(user_id);
CREATE INDEX idx_user_works_order ON public.user_works(user_id, order_index);
CREATE INDEX idx_public_portfolios_slug ON public.public_portfolios(slug);
CREATE INDEX idx_public_portfolios_user_id ON public.public_portfolios(user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_user_works_updated_at
BEFORE UPDATE ON public.user_works
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_public_portfolios_updated_at
BEFORE UPDATE ON public.public_portfolios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
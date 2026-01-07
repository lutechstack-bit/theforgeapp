-- Create community_highlights table for admin-curated moments
CREATE TABLE public.community_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID REFERENCES public.editions(id),
  highlight_type TEXT NOT NULL DEFAULT 'milestone',
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  highlight_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add last_active_at to profiles for online status tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on community_highlights
ALTER TABLE public.community_highlights ENABLE ROW LEVEL SECURITY;

-- Everyone can view highlights
CREATE POLICY "Everyone can view community highlights"
ON public.community_highlights
FOR SELECT
USING (true);

-- Admins can manage highlights
CREATE POLICY "Admins can manage community highlights"
ON public.community_highlights
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for community_highlights table
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_highlights;
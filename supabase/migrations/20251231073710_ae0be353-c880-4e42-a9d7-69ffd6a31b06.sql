-- Create city_groups table for the 5 main city groups + All Forge
CREATE TABLE public.city_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city_key TEXT NOT NULL UNIQUE,
  is_main BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.city_groups ENABLE ROW LEVEL SECURITY;

-- Everyone can view city groups
CREATE POLICY "Everyone can view city groups"
ON public.city_groups
FOR SELECT
USING (true);

-- Admins can manage city groups
CREATE POLICY "Admins can manage city groups"
ON public.city_groups
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default city groups
INSERT INTO public.city_groups (name, city_key, is_main) VALUES
  ('All Forge', 'all_forge', true),
  ('LevelUp Chennai', 'chennai', false),
  ('LevelUp Mumbai', 'mumbai', false),
  ('LevelUp Bangalore', 'bangalore', false),
  ('LevelUp Hyderabad', 'hyderabad', false),
  ('LevelUp Kerala', 'kerala', false);

-- Add group_id to community_messages for multi-group support
ALTER TABLE public.community_messages 
ADD COLUMN group_id UUID REFERENCES public.city_groups(id),
ADD COLUMN image_url TEXT,
ADD COLUMN is_announcement BOOLEAN NOT NULL DEFAULT false;

-- Set default group for existing messages (All Forge)
UPDATE public.community_messages 
SET group_id = (SELECT id FROM public.city_groups WHERE city_key = 'all_forge');

-- Make group_id NOT NULL after setting defaults
ALTER TABLE public.community_messages 
ALTER COLUMN group_id SET NOT NULL;

-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS on reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view all reactions
CREATE POLICY "Users can view reactions"
ON public.message_reactions
FOR SELECT
USING (true);

-- Users can add their own reactions
CREATE POLICY "Users can add reactions"
ON public.message_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for messages and reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.city_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
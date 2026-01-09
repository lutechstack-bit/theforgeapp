-- Create nightly_ritual_items table for storing ritual definitions
CREATE TABLE public.nightly_ritual_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_type TEXT NOT NULL DEFAULT 'FORGE',
  day_number INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reflect', 'prepare', 'wellness')),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Moon',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_nightly_progress table for tracking completions
CREATE TABLE public.user_nightly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ritual_item_id UUID NOT NULL REFERENCES public.nightly_ritual_items(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, ritual_item_id)
);

-- Enable RLS
ALTER TABLE public.nightly_ritual_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nightly_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nightly_ritual_items
CREATE POLICY "Everyone can view nightly ritual items"
ON public.nightly_ritual_items
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage nightly ritual items"
ON public.nightly_ritual_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_nightly_progress
CREATE POLICY "Users can view their own progress"
ON public.user_nightly_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_nightly_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.user_nightly_progress
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
ON public.user_nightly_progress
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_nightly_ritual_items_cohort_day ON public.nightly_ritual_items(cohort_type, day_number);
CREATE INDEX idx_user_nightly_progress_user ON public.user_nightly_progress(user_id);

-- Seed data for FORGE (Filmmakers) cohort
-- Day 1
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE', 1, 'reflect', 'Write 3 key takeaways from the storytelling psychology session', 'What insights about narrative structure resonated with you?', 'BookOpen', 1),
('FORGE', 1, 'reflect', 'Note one connection you made with a fellow filmmaker', 'Building your creative network starts tonight', 'Users', 2),
('FORGE', 1, 'prepare', 'Review tomorrow''s schedule: Improv Drills + Film Direction workshop', 'Check the roadmap for timing details', 'Calendar', 3),
('FORGE', 1, 'prepare', 'Think about your film''s core conflict for Directors'' Whisper', 'What''s the central tension in your story?', 'Lightbulb', 4),
('FORGE', 1, 'prepare', 'Prepare comfortable clothes for improv activities', 'You''ll be moving around tomorrow', 'Shirt', 5),
('FORGE', 1, 'wellness', 'Hydrate - drink a full glass of water', 'Stay refreshed for tomorrow', 'Droplet', 6),
('FORGE', 1, 'wellness', 'Set alarm for breakfast (8:30 AM)', 'Don''t miss the morning fuel', 'Clock', 7),
('FORGE', 1, 'wellness', 'Charge all devices', 'Phone, laptop, power bank', 'Battery', 8);

-- Day 2
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE', 2, 'reflect', 'Record your favorite moment from the Film Direction workshop', 'What technique will you remember?', 'Film', 1),
('FORGE', 2, 'reflect', 'Note one improv technique you want to use in your film', 'How will spontaneity enhance your direction?', 'Sparkles', 2),
('FORGE', 2, 'prepare', 'Review tomorrow: Cinematography Workshop + Shot Division', 'Big visual learning day ahead', 'Camera', 3),
('FORGE', 2, 'prepare', 'Prepare your script for shot division rehearsals', 'Have it ready for blocking exercises', 'FileText', 4),
('FORGE', 2, 'prepare', 'Think about costume requirements for your film', 'What will your characters wear?', 'Shirt', 5),
('FORGE', 2, 'wellness', 'Drink water before bed', 'Hydration helps creativity', 'Droplet', 6),
('FORGE', 2, 'wellness', 'Set alarm for morning movement (8:00 AM)', 'Energize your body', 'Clock', 7),
('FORGE', 2, 'wellness', 'Phone on silent by 11 PM', 'Quality rest matters', 'Moon', 8);

-- Day 3 (Night before shoot)
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE', 3, 'reflect', 'Write down 3 cinematography techniques you''ll use', 'What visual language will define your film?', 'Video', 1),
('FORGE', 3, 'reflect', 'Note any equipment needs for your shoot tomorrow', 'Make a mental checklist', 'Package', 2),
('FORGE', 3, 'prepare', 'Confirm your shooting slot (Day: 9AM-3PM or Evening: 3:30PM-9:30PM)', 'Know your call time!', 'Clock', 3),
('FORGE', 3, 'prepare', 'Exchange numbers with your camera assistant and lightman', 'Communication is key on set', 'Phone', 4),
('FORGE', 3, 'prepare', 'Prepare all props and costumes for your film', 'Gather everything tonight', 'Package', 5),
('FORGE', 3, 'prepare', 'Charge ALL devices (phone, laptop, power bank)', 'No dead batteries on set', 'Battery', 6),
('FORGE', 3, 'prepare', 'Pack your day bag with essentials', 'Snacks, water, sunscreen, script', 'Backpack', 7),
('FORGE', 3, 'wellness', 'Get proper rest - BIG shoot day tomorrow', 'Your energy matters most', 'Moon', 8),
('FORGE', 3, 'wellness', 'Lay out tomorrow''s clothes', 'No morning scramble', 'Shirt', 9),
('FORGE', 3, 'wellness', 'Set multiple alarms for call time', 'Don''t be late to your own set!', 'Clock', 10);

-- Day 4
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE', 4, 'reflect', 'Review today''s footage mentally - what went well?', 'Celebrate your wins', 'CheckCircle', 1),
('FORGE', 4, 'reflect', 'Note any shots you need to patch tomorrow', 'Plan for pickups', 'AlertCircle', 2),
('FORGE', 4, 'prepare', 'Check tomorrow''s patchwork shoot requirements', 'What still needs to be captured?', 'Camera', 3),
('FORGE', 4, 'prepare', 'Ensure all equipment is charged', 'Ready for another day', 'Battery', 4),
('FORGE', 4, 'prepare', 'Confirm any cast availability for tomorrow', 'Lock in your actors', 'Users', 5),
('FORGE', 4, 'wellness', 'Rest your voice and body', 'You worked hard today', 'Heart', 6),
('FORGE', 4, 'wellness', 'Hydrate well', 'Recover and refresh', 'Droplet', 7),
('FORGE', 4, 'wellness', 'Phone silent by 11 PM', 'Deep rest for day 2', 'Moon', 8);

-- Day 5
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE', 5, 'reflect', 'Celebrate completing production!', 'You made a film. That''s huge.', 'Trophy', 1),
('FORGE', 5, 'reflect', 'Note your favorite behind-the-scenes moment', 'What will you remember forever?', 'Heart', 2),
('FORGE', 5, 'prepare', 'Transfer all footage to laptop', 'Backup is crucial', 'HardDrive', 3),
('FORGE', 5, 'prepare', 'Organize clips into folders', 'Day, Scene, Take structure', 'FolderOpen', 4),
('FORGE', 5, 'prepare', 'Think about your edit structure/timeline', 'How will you tell this story?', 'Film', 5),
('FORGE', 5, 'prepare', 'Prepare laptop charger and headphones', 'Post-production essentials', 'Headphones', 6),
('FORGE', 5, 'wellness', 'Good rest - creative post work tomorrow', 'Fresh eyes edit better', 'Moon', 7),
('FORGE', 5, 'wellness', 'Stretch and relax', 'Release the production tension', 'Heart', 8),
('FORGE', 5, 'wellness', 'Set alarm for breakfast', 'Fuel the edit day', 'Clock', 9);

-- Day 6
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE', 6, 'reflect', 'How''s your edit coming along?', 'Trust your instincts', 'Film', 1),
('FORGE', 6, 'reflect', 'Note any sound design ideas from the workshop', 'Audio is 50% of the film', 'Volume2', 2),
('FORGE', 6, 'prepare', 'Continue rendering overnight if needed', 'Let the computer work while you rest', 'Loader', 3),
('FORGE', 6, 'prepare', 'Prepare questions for Part 2 editing workshop', 'What do you need help with?', 'HelpCircle', 4),
('FORGE', 6, 'prepare', 'Think about music/SFX needs', 'What sonic texture does your film need?', 'Music', 5),
('FORGE', 6, 'wellness', 'Rest your eyes from screens', '20-20-20 rule', 'Eye', 6),
('FORGE', 6, 'wellness', 'Hydrate', 'Brain fuel', 'Droplet', 7),
('FORGE', 6, 'wellness', 'Set alarm for final push', 'Almost there!', 'Clock', 8);

-- Day 7
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE', 7, 'reflect', 'How does your final cut feel?', 'You''re nearly there', 'Film', 1),
('FORGE', 7, 'reflect', 'Write what you''re most proud of in your film', 'Own your creation', 'Star', 2),
('FORGE', 7, 'prepare', 'Final render check - is it ready?', 'No surprises on screening day', 'CheckCircle', 3),
('FORGE', 7, 'prepare', 'Prepare a 30-second intro about your film', 'What will you say to the audience?', 'Mic', 4),
('FORGE', 7, 'prepare', 'Pack your belongings for checkout', 'Be ready for departure', 'Briefcase', 5),
('FORGE', 7, 'prepare', 'Take photos with your batch!', 'Capture the memories', 'Camera', 6),
('FORGE', 7, 'wellness', 'Get good sleep for screening day', 'Be present and proud', 'Moon', 7),
('FORGE', 7, 'wellness', 'Set alarm early for photo session', 'Golden hour memories', 'Sunrise', 8),
('FORGE', 7, 'wellness', 'Charge phone for memories', 'Document the finale', 'Battery', 9);

-- Seed data for FORGE_CREATORS cohort
-- Day 1
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE_CREATORS', 1, 'reflect', 'Write 3 insights from the Creator Mindset session', 'What shifted your perspective?', 'BookOpen', 1),
('FORGE_CREATORS', 1, 'reflect', 'Note one creator you want to collaborate with', 'Who inspired you today?', 'Users', 2),
('FORGE_CREATORS', 1, 'prepare', 'Review tomorrow: Art of the Hook + Scriptwriting + Camera/Lighting', 'Content creation fundamentals', 'Calendar', 3),
('FORGE_CREATORS', 1, 'prepare', 'Think about content ideas for your first reel', 'What story will you tell?', 'Lightbulb', 4),
('FORGE_CREATORS', 1, 'prepare', 'Prepare outfit for camera work', 'Look your best on screen', 'Shirt', 5),
('FORGE_CREATORS', 1, 'wellness', 'Hydrate and rest', 'Big learning day ahead', 'Droplet', 6),
('FORGE_CREATORS', 1, 'wellness', 'Set alarm for 8 AM breakfast', 'Start strong', 'Clock', 7),
('FORGE_CREATORS', 1, 'wellness', 'Phone charged', 'Content creation requires power', 'Battery', 8);

-- Day 2
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE_CREATORS', 2, 'reflect', 'Record your best hook idea from today', 'What''s your attention grabber?', 'Zap', 1),
('FORGE_CREATORS', 2, 'reflect', 'Note one scriptwriting tip you''ll apply', 'Structure matters', 'Edit', 2),
('FORGE_CREATORS', 2, 'prepare', 'Pack beach-appropriate gear', 'Sunscreen, hat, comfortable clothes', 'Sun', 3),
('FORGE_CREATORS', 2, 'prepare', 'Charge phone and power bank', 'All-day shooting needs power', 'Battery', 4),
('FORGE_CREATORS', 2, 'prepare', 'Prepare content concepts for beach shoot', 'What will you create?', 'Video', 5),
('FORGE_CREATORS', 2, 'prepare', 'Check weather forecast', 'Plan for conditions', 'Cloud', 6),
('FORGE_CREATORS', 2, 'wellness', 'Early sleep - big shoot day', 'Energy is everything', 'Moon', 7),
('FORGE_CREATORS', 2, 'wellness', 'Apply sunscreen reminder for AM', 'Protect your skin', 'Sun', 8),
('FORGE_CREATORS', 2, 'wellness', 'Set multiple alarms', 'Don''t miss the golden hour', 'Clock', 9);

-- Day 3
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE_CREATORS', 3, 'reflect', 'How did your beach content turn out?', 'Review your best takes', 'Video', 1),
('FORGE_CREATORS', 3, 'reflect', 'Note what worked and what to improve', 'Growth mindset', 'TrendingUp', 2),
('FORGE_CREATORS', 3, 'prepare', 'Review city shoot locations', 'Know where you''re going', 'MapPin', 3),
('FORGE_CREATORS', 3, 'prepare', 'Plan content strategy for urban setting', 'Different vibe, different content', 'Building', 4),
('FORGE_CREATORS', 3, 'prepare', 'Charge all devices', 'Full power for city exploration', 'Battery', 5),
('FORGE_CREATORS', 3, 'prepare', 'Pack comfortable walking shoes', 'City shooting means walking', 'Footprints', 6),
('FORGE_CREATORS', 3, 'wellness', 'Rest and recover', 'Beach day was intense', 'Heart', 7),
('FORGE_CREATORS', 3, 'wellness', 'Hydrate well', 'Rehydrate after sun exposure', 'Droplet', 8),
('FORGE_CREATORS', 3, 'wellness', 'Set alarm for breakfast', 'Fuel the city exploration', 'Clock', 9);

-- Day 4
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE_CREATORS', 4, 'reflect', 'Compare beach vs city content - which style fits you?', 'Finding your aesthetic', 'Sparkles', 1),
('FORGE_CREATORS', 4, 'reflect', 'Note monetization insights from today''s session', 'How will you earn?', 'DollarSign', 2),
('FORGE_CREATORS', 4, 'prepare', 'Check island shoot logistics', 'Divar Island awaits', 'Map', 3),
('FORGE_CREATORS', 4, 'prepare', 'Prepare for unique island content', 'What makes this location special?', 'Palmtree', 4),
('FORGE_CREATORS', 4, 'prepare', 'Pack all essential gear', 'Don''t forget anything', 'Backpack', 5),
('FORGE_CREATORS', 4, 'prepare', 'Review brand video concepts', 'Professional content coming up', 'Briefcase', 6),
('FORGE_CREATORS', 4, 'wellness', 'Good rest for island adventure', 'Unique location needs energy', 'Moon', 7),
('FORGE_CREATORS', 4, 'wellness', 'Phone charged', 'Island content day', 'Battery', 8),
('FORGE_CREATORS', 4, 'wellness', 'Set alarm early', 'Ferry timing matters', 'Clock', 9);

-- Day 5
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE_CREATORS', 5, 'reflect', 'How was shooting at Divar Island?', 'What unique content did you capture?', 'Palmtree', 1),
('FORGE_CREATORS', 5, 'reflect', 'What brand-ready content did you capture?', 'Portfolio pieces', 'Star', 2),
('FORGE_CREATORS', 5, 'prepare', 'Review Analytics & Algorithm session topics', 'Data drives growth', 'BarChart', 3),
('FORGE_CREATORS', 5, 'prepare', 'Think about questions for mentors', 'Make the most of access', 'HelpCircle', 4),
('FORGE_CREATORS', 5, 'prepare', 'Prepare final content pieces for editing', 'Organize your best takes', 'FolderOpen', 5),
('FORGE_CREATORS', 5, 'wellness', 'Rest and recharge', 'Final day tomorrow', 'Heart', 6),
('FORGE_CREATORS', 5, 'wellness', 'Hydrate', 'Stay sharp', 'Droplet', 7),
('FORGE_CREATORS', 5, 'wellness', 'Set alarm for last full day', 'Make it count', 'Clock', 8);

-- Day 6
INSERT INTO public.nightly_ritual_items (cohort_type, day_number, category, title, description, icon, order_index) VALUES
('FORGE_CREATORS', 6, 'reflect', 'Write your top 5 learnings from the entire program', 'What changed for you?', 'Award', 1),
('FORGE_CREATORS', 6, 'reflect', 'Note creators you want to stay connected with', 'Your network is your net worth', 'Users', 2),
('FORGE_CREATORS', 6, 'prepare', 'Pack all belongings', 'Checkout tomorrow', 'Briefcase', 3),
('FORGE_CREATORS', 6, 'prepare', 'Final content roadmap review', 'What''s your 30-day plan?', 'Map', 4),
('FORGE_CREATORS', 6, 'prepare', 'Exchange contact info with batchmates', 'Build your creator circle', 'Phone', 5),
('FORGE_CREATORS', 6, 'prepare', 'Download all edited content', 'Backup everything', 'Download', 6),
('FORGE_CREATORS', 6, 'wellness', 'Get good rest', 'Departure day tomorrow', 'Moon', 7),
('FORGE_CREATORS', 6, 'wellness', 'Set alarm for checkout (12:30 PM)', 'Be ready on time', 'Clock', 8),
('FORGE_CREATORS', 6, 'wellness', 'Prepare for departure', 'Safe travels home', 'Plane', 9);
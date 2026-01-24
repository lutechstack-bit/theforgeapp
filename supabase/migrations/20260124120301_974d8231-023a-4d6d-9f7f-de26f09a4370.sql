-- Create journey_stages table for the 6-stage timeline
CREATE TABLE public.journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  icon TEXT DEFAULT 'Circle',
  color TEXT DEFAULT 'amber',
  days_before_start INTEGER,
  days_after_start INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create journey_tasks table for admin-managed tasks
CREATE TABLE public.journey_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.journey_stages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cohort_types TEXT[] DEFAULT ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'],
  auto_complete_field TEXT,
  deep_link TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_journey_progress table for tracking completion
CREATE TABLE public.user_journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task_id UUID REFERENCES public.journey_tasks(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS on all tables
ALTER TABLE public.journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for journey_stages (public read, admin write)
CREATE POLICY "Everyone can view journey stages"
  ON public.journey_stages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage journey stages"
  ON public.journey_stages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for journey_tasks (public read, admin write)
CREATE POLICY "Everyone can view journey tasks"
  ON public.journey_tasks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage journey tasks"
  ON public.journey_tasks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_journey_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_journey_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_journey_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_journey_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.user_journey_progress FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed the 6 journey stages
INSERT INTO public.journey_stages (stage_key, title, description, order_index, icon, color, days_before_start, days_after_start) VALUES
  ('pre_registration', 'Pre-Registration', 'Get your spot confirmed and start connecting', 0, 'UserPlus', 'emerald', 30, NULL),
  ('pre_travel', 'Pre-Travel', 'Plan your journey and prepare for the experience', 1, 'Plane', 'amber', 15, NULL),
  ('final_prep', 'Final Prep', 'Last-minute preparations before you arrive', 2, 'CheckSquare', 'blue', 0, NULL),
  ('online_forge', 'Online Forge', 'Virtual sessions to kickstart your journey', 3, 'Video', 'purple', NULL, 0),
  ('physical_forge', 'Physical Forge', 'The immersive in-person experience', 4, 'MapPin', 'rose', NULL, 3),
  ('post_forge', 'Post Forge', 'Celebrate, share, and stay connected', 5, 'Award', 'primary', NULL, NULL);

-- Seed journey tasks for each stage
-- Stage 1: Pre-Registration
INSERT INTO public.journey_tasks (stage_id, title, description, auto_complete_field, deep_link, order_index, cohort_types) VALUES
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_registration'), 'Complete your Forge form', 'Fill out KYF/KYW/KYC to confirm your spot', 'ky_form_completed', '/kyf', 0, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_registration'), 'Set up your profile with photo', 'Help your batchmates recognize you', 'profile_setup_completed', '/profile', 1, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_registration'), 'Pay remaining balance', 'Secure your slot and get peace of mind', 'payment_status', NULL, 2, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_registration'), 'Introduce yourself in community', 'Start building connections early', 'community_intro', '/community', 3, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_registration'), 'Watch the orientation video', 'Know what to expect at Forge', NULL, '/learn', 4, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_registration'), 'Connect your Instagram', 'Boost your portfolio visibility', 'instagram_handle', '/profile', 5, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']);

-- Stage 2: Pre-Travel
INSERT INTO public.journey_tasks (stage_id, title, description, auto_complete_field, deep_link, order_index, cohort_types) VALUES
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_travel'), 'Book your travel', 'Sort out your flight or train tickets', NULL, '/roadmap/prep', 0, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_travel'), 'Review the complete roadmap', 'Know the schedule and plan ahead', NULL, '/roadmap', 1, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_travel'), 'Check packing essentials list', 'Don''t forget anything important', NULL, '/roadmap/prep', 2, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_travel'), 'Start a conversation with a batchmate', 'Know someone before arriving', NULL, '/community', 3, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_travel'), 'Watch at least 1 masterclass', 'Come prepared with context', NULL, '/learn', 4, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'pre_travel'), 'Add Forge dates to your calendar', 'Block time and avoid conflicts', NULL, '/roadmap', 5, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']);

-- Stage 3: Final Prep
INSERT INTO public.journey_tasks (stage_id, title, description, auto_complete_field, deep_link, order_index, cohort_types) VALUES
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'final_prep'), 'Complete script/content prep', 'Get your creative work ready', NULL, '/roadmap/prep', 0, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'final_prep'), 'Review Day 0 arrival instructions', 'Ensure a smooth first day', NULL, '/roadmap', 1, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'final_prep'), 'Note emergency contacts', 'Be prepared for any situation', NULL, '/roadmap/prep', 2, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'final_prep'), 'Download offline content', 'Access materials without WiFi', NULL, '/learn', 3, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'final_prep'), 'Pack your bags using checklist', 'Final check before departure', NULL, '/roadmap/prep', 4, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']);

-- Stage 4: Online Forge
INSERT INTO public.journey_tasks (stage_id, title, description, auto_complete_field, deep_link, order_index, cohort_types) VALUES
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'online_forge'), 'Attend Day 1 online session', 'Start the program strong', NULL, '/events', 0, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'online_forge'), 'Submit your script/content draft', 'Get mentor feedback early', NULL, NULL, 1, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'online_forge'), 'Pick your slot/team', 'Know your group assignment', NULL, NULL, 2, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'online_forge'), 'Prepare your prop list', 'Get ready for shoot days', NULL, '/roadmap/prep', 3, ARRAY['FORGE']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'online_forge'), 'Connect with your team in chat', 'Build team rapport early', NULL, '/community', 4, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']);

-- Stage 5: Physical Forge
INSERT INTO public.journey_tasks (stage_id, title, description, auto_complete_field, deep_link, order_index, cohort_types) VALUES
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'physical_forge'), 'Check-in at location', 'Confirm your arrival', NULL, '/roadmap', 0, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'physical_forge'), 'Submit casting/role decisions', 'Lock in your production plan', NULL, NULL, 1, ARRAY['FORGE']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'physical_forge'), 'Complete daily reflections', 'Process your learnings', NULL, NULL, 2, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'physical_forge'), 'Share BTS in community', 'Document your experience', NULL, '/community', 3, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'physical_forge'), 'Submit your final work', 'Complete the program', NULL, NULL, 4, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']);

-- Stage 6: Post Forge
INSERT INTO public.journey_tasks (stage_id, title, description, auto_complete_field, deep_link, order_index, cohort_types) VALUES
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'post_forge'), 'Download your certificate', 'Proof of your achievement', NULL, '/profile', 0, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'post_forge'), 'Add work to your portfolio', 'Showcase your achievements', NULL, '/profile', 1, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'post_forge'), 'Submit feedback/testimonial', 'Share your experience', NULL, NULL, 2, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'post_forge'), 'Join alumni network', 'Stay connected with your batch', NULL, '/community', 3, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']),
  ((SELECT id FROM public.journey_stages WHERE stage_key = 'post_forge'), 'Share your work on socials', 'Promote your creation', NULL, NULL, 4, ARRAY['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS']);
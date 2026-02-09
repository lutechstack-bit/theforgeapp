
-- =============================================
-- Phase 1: Today's Focus Cards table
-- =============================================
CREATE TABLE public.today_focus_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Start Now',
  cta_route TEXT NOT NULL,
  icon_emoji TEXT DEFAULT 'target',
  priority INTEGER NOT NULL DEFAULT 0,
  auto_detect_field TEXT,
  cohort_types TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.today_focus_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active focus cards"
  ON public.today_focus_cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage focus cards"
  ON public.today_focus_cards FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Phase 4: Homepage Sections table (create now for future use)
-- =============================================
CREATE TABLE public.homepage_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  cohort_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view homepage sections"
  ON public.homepage_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage homepage sections"
  ON public.homepage_sections FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default section order
INSERT INTO public.homepage_sections (section_key, title, subtitle, order_index, is_visible) VALUES
  ('countdown', 'Countdown', NULL, 0, true),
  ('todays_focus', 'Today''s Focus', 'Your next priority', 1, true),
  ('onboarding', 'Complete Your Onboarding', 'Get ready for the Forge', 2, true),
  ('journey', 'Your Forge Journey', 'Day by day through the Forge', 3, true),
  ('batchmates', 'Your Batchmates', 'Meet your cohort', 4, true),
  ('mentors', 'Meet Your Mentors', 'Industry experts guiding your journey', 5, true),
  ('alumni', 'Alumni Showcase', 'Films from past editions', 6, true),
  ('travel_stay', 'Travel & Stay', 'Your accommodation details', 7, true);

-- Seed some default focus cards
INSERT INTO public.today_focus_cards (title, description, cta_text, cta_route, icon_emoji, priority, auto_detect_field, cohort_types, order_index) VALUES
  ('Complete your Filmmaker Profile', 'Tell us about your filmmaking journey so we can personalize your Forge experience', 'Start Now', '/kyf-form', 'clipboard-list', 10, 'ky_form_completed', ARRAY['FORGE'], 0),
  ('Complete your Creator Profile', 'Tell us about your creative journey so we can personalize your Forge experience', 'Start Now', '/kyc-form', 'clipboard-list', 10, 'ky_form_completed', ARRAY['FORGE_CREATORS'], 1),
  ('Complete your Writer Profile', 'Tell us about your writing journey so we can personalize your Forge experience', 'Start Now', '/kyw-form', 'clipboard-list', 10, 'ky_form_completed', ARRAY['FORGE_WRITING'], 2);

-- Add show_batchmates to editions
ALTER TABLE public.editions ADD COLUMN IF NOT EXISTS show_batchmates BOOLEAN NOT NULL DEFAULT true;

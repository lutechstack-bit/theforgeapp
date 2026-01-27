-- Create user_notes table for personal user memos
CREATE TABLE public.user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notes
CREATE POLICY "Users can view own notes"
  ON public.user_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON public.user_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.user_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.user_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Create announcement_triggers table for admin-configurable trigger rules
CREATE TABLE public.announcement_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT,
  deep_link TEXT,
  icon_emoji TEXT DEFAULT '📢',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcement_triggers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcement_triggers
CREATE POLICY "Everyone can view triggers"
  ON public.announcement_triggers FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can insert triggers"
  ON public.announcement_triggers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update triggers"
  ON public.announcement_triggers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete triggers"
  ON public.announcement_triggers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add new columns to notifications table for hero announcements
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS is_hero_announcement BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_style TEXT DEFAULT 'card',
  ADD COLUMN IF NOT EXISTS icon_emoji TEXT DEFAULT '📢',
  ADD COLUMN IF NOT EXISTS target_stage TEXT;

-- Insert default trigger configurations
INSERT INTO public.announcement_triggers (trigger_type, title_template, message_template, deep_link, icon_emoji, priority, config) VALUES
  ('kyf_deadline', '📋 KYF deadline in {days} days!', 'Complete your Know Yourself form before the deadline.', '/kyf', '📋', 10, '{"days_before": [3, 2, 1]}'),
  ('forge_countdown', '⏰ {days} days until Forge!', 'Get ready for an amazing experience.', '/roadmap', '⏰', 5, '{"days": [14, 7, 3, 1, 0]}'),
  ('stage_entry', '🎯 Welcome to {stage}!', 'You have new tasks to complete in this stage.', '/journey', '🎯', 3, '{"all_stages": true}'),
  ('streak_milestone', '🔥 {days}-day streak achieved!', 'Keep up the amazing momentum!', null, '🔥', 2, '{"days": [3, 7, 14, 30]}'),
  ('event_reminder', '🎬 {event} starts soon!', 'Don''t miss this event.', '/events', '🎬', 4, '{"hours_before": [24, 2]}')
ON CONFLICT (trigger_type) DO NOTHING;
-- Add virtual meeting columns to roadmap_days table
ALTER TABLE public.roadmap_days
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meeting_url TEXT,
ADD COLUMN IF NOT EXISTS meeting_id TEXT,
ADD COLUMN IF NOT EXISTS meeting_passcode TEXT,
ADD COLUMN IF NOT EXISTS session_start_time TIME,
ADD COLUMN IF NOT EXISTS session_duration_hours NUMERIC(3,1);

-- Add comment for documentation
COMMENT ON COLUMN public.roadmap_days.is_virtual IS 'Flag to indicate online/virtual session';
COMMENT ON COLUMN public.roadmap_days.meeting_url IS 'Full Zoom/Meet meeting URL';
COMMENT ON COLUMN public.roadmap_days.meeting_id IS 'Meeting ID for manual entry';
COMMENT ON COLUMN public.roadmap_days.meeting_passcode IS 'Meeting passcode';
COMMENT ON COLUMN public.roadmap_days.session_start_time IS 'Exact session start time';
COMMENT ON COLUMN public.roadmap_days.session_duration_hours IS 'Session duration in hours';

-- Insert session notification triggers
INSERT INTO public.announcement_triggers (trigger_type, title_template, message_template, deep_link, icon_emoji, priority, config, is_active)
VALUES 
  ('session_starting_soon', 'Session starting in {minutes} minutes', 'Join "{session_title}" now!', '/roadmap/journey', '🎬', 85, '{"minutes_before": [30, 15, 5]}', true),
  ('session_live_now', 'Your session is LIVE!', 'Join "{session_title}" now', '/roadmap/journey', '🔴', 95, '{}', true)
ON CONFLICT DO NOTHING;
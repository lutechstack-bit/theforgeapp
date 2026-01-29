-- Create changelog table for tracking app updates
CREATE TABLE public.app_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Feature',
  status TEXT NOT NULL DEFAULT 'Completed',
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_changelog ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins can manage changelog"
  ON public.app_changelog FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed with initial changelog entries
INSERT INTO public.app_changelog (version, title, description, category, status, date_added, added_by) VALUES
('1.4.0', 'Compact Countdown Timer', 'Implemented global clipping split-number effect with gold gradient fill (orange → gold → yellow) and standard time units display', 'UI', 'Completed', '2026-01-28', 'Dev Team'),
('1.3.0', 'Sticky Notes + Announcements + Note Taker', 'Added 6-stage journey tracker with sticky-note cards, auto-cycling announcement banner, and personal note card with 500-char limit and auto-save', 'Feature', 'Completed', '2026-01-27', 'Dev Team'),
('1.2.0', 'Mobile Floating Button', 'Added bottom-right sparkle button on mobile for accessing Past Moments, Stay Locations, and Student Works via drawer', 'UI', 'Completed', '2026-01-26', 'Dev Team'),
('1.1.0', 'UI Alignment Fixes', 'Standardized padding and responsiveness across Homepage and Roadmap, ensured text contrast on gold/cream backgrounds', 'Bug Fix', 'Completed', '2026-01-25', 'Dev Team');
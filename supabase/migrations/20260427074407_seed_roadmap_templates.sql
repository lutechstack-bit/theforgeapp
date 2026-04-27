-- Seed roadmap template rows from existing edition-specific content.
-- Copies days from the best past edition of each cohort into new template
-- rows (edition_id = NULL, is_template = TRUE, cohort_type set).
-- Per-edition fields (date, zoom links) are cleared — bootcamp dates are
-- calculated dynamically; online session dates/zoom are set per-edition
-- via the admin "Online Sessions" tab.
--
-- Existing edition-specific rows are NOT modified.

-- ── FORGE (Filmmaking) — from Filmmakers Edition 15 ─────────────────
INSERT INTO public.roadmap_days (
  day_number, title, description, call_time, location, is_active, is_virtual,
  meeting_url, meeting_id, meeting_passcode, session_start_time, session_duration_hours,
  checklist, activity_type, intensity_level, theme_name, objective, schedule,
  location_image_url, milestone_type, duration_hours, reveal_days_before,
  teaser_text, key_learnings, mentors, cohort_type, is_template, edition_id, date
)
SELECT
  day_number, title, description, call_time, location, is_active, is_virtual,
  NULL,   -- meeting_url     (set per-edition via Online Sessions tab)
  NULL,   -- meeting_id      (set per-edition)
  NULL,   -- meeting_passcode (set per-edition)
  NULL,   -- session_start_time (set per-edition)
  session_duration_hours,
  checklist, activity_type, intensity_level, theme_name, objective, schedule,
  location_image_url, milestone_type, duration_hours, reveal_days_before,
  teaser_text, key_learnings, mentors,
  'FORGE'::cohort_type,   -- cohort_type
  TRUE,                   -- is_template
  NULL,                   -- edition_id (NULL = template)
  NULL                    -- date (bootcamp = calculated; online = set per-edition)
FROM public.roadmap_days
WHERE edition_id = 'ec048e00-421e-4ceb-bcc0-df675173b296';

-- ── FORGE_CREATORS — from Creators Edition 3 ────────────────────────
INSERT INTO public.roadmap_days (
  day_number, title, description, call_time, location, is_active, is_virtual,
  meeting_url, meeting_id, meeting_passcode, session_start_time, session_duration_hours,
  checklist, activity_type, intensity_level, theme_name, objective, schedule,
  location_image_url, milestone_type, duration_hours, reveal_days_before,
  teaser_text, key_learnings, mentors, cohort_type, is_template, edition_id, date
)
SELECT
  day_number, title, description, call_time, location, is_active, is_virtual,
  NULL, NULL, NULL, NULL,
  session_duration_hours,
  checklist, activity_type, intensity_level, theme_name, objective, schedule,
  location_image_url, milestone_type, duration_hours, reveal_days_before,
  teaser_text, key_learnings, mentors,
  'FORGE_CREATORS'::cohort_type,
  TRUE,
  NULL,
  NULL
FROM public.roadmap_days
WHERE edition_id = '2fd72d93-ebef-450b-82cf-1dab56872777';

-- ── FORGE_WRITING — from Writing Edition 5 ──────────────────────────
INSERT INTO public.roadmap_days (
  day_number, title, description, call_time, location, is_active, is_virtual,
  meeting_url, meeting_id, meeting_passcode, session_start_time, session_duration_hours,
  checklist, activity_type, intensity_level, theme_name, objective, schedule,
  location_image_url, milestone_type, duration_hours, reveal_days_before,
  teaser_text, key_learnings, mentors, cohort_type, is_template, edition_id, date
)
SELECT
  day_number, title, description, call_time, location, is_active, is_virtual,
  NULL, NULL, NULL, NULL,
  session_duration_hours,
  checklist, activity_type, intensity_level, theme_name, objective, schedule,
  location_image_url, milestone_type, duration_hours, reveal_days_before,
  teaser_text, key_learnings, mentors,
  'FORGE_WRITING'::cohort_type,
  TRUE,
  NULL,
  NULL
FROM public.roadmap_days
WHERE edition_id = 'cf2b9fd2-a3da-4d0b-8370-da0937f9d786';

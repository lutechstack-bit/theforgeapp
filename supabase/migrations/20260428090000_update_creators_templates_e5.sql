-- Update FORGE_CREATORS roadmap templates based on Goa E5 GamePlan PDF
-- Online sessions: 5 (was 6 in old template — remove day -6)
-- Bootcamp: 7 days with updated titles, descriptions, themes, schedules

-- ─────────────────────────────────────────────────────────────────
-- Step 1: Remove extra online session (old E3 template had 6, E5 has 5)
-- ─────────────────────────────────────────────────────────────────
DELETE FROM public.roadmap_days
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = -6;

-- ─────────────────────────────────────────────────────────────────
-- Step 2: Update online sessions (day -5 → S1 … day -1 → S5)
-- ─────────────────────────────────────────────────────────────────

-- S1 — Orientation (1 hr)
UPDATE public.roadmap_days SET
  title              = 'Orientation',
  description        = 'Welcome to Forge Creators! Meet your cohort, understand the program structure, and set your creative intentions for the journey ahead.',
  session_duration_hours = 1,
  is_virtual         = true,
  is_active          = true
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = -5;

-- S2 — Niche Discovery + Competitor Analysis (2 hrs)
UPDATE public.roadmap_days SET
  title              = 'Niche Discovery + Competitor Analysis',
  description        = 'Identify your unique creator niche and deep-dive into competitor research to understand what works, what doesn''t, and where your opportunity lies.',
  session_duration_hours = 2,
  is_virtual         = true,
  is_active          = true
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = -4;

-- S3 — Positioning & Content Pillars (2 hrs)
UPDATE public.roadmap_days SET
  title              = 'Positioning & Content Pillars',
  description        = 'Define your positioning in the creator space and build the content pillars that will drive your channel''s identity and growth.',
  session_duration_hours = 2,
  is_virtual         = true,
  is_active          = true
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = -3;

-- S4 — Videography Theory (2 hrs)
UPDATE public.roadmap_days SET
  title              = 'Videography Theory',
  description        = 'Master the fundamentals of mobile videography — framing, composition, movement, and capturing compelling footage for social media.',
  session_duration_hours = 2,
  is_virtual         = true,
  is_active          = true
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = -2;

-- S5 — Video Editing Theory (2 hrs)
UPDATE public.roadmap_days SET
  title              = 'Video Editing Theory',
  description        = 'Learn the principles of editing for social media — pacing, cuts, music, captions, and creating scroll-stopping content.',
  session_duration_hours = 2,
  is_virtual         = true,
  is_active          = true
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = -1;

-- ─────────────────────────────────────────────────────────────────
-- Step 3: Update bootcamp days 1–7
-- ─────────────────────────────────────────────────────────────────

-- Day 1 — Orientation and Creator Mindset
UPDATE public.roadmap_days SET
  title       = 'Orientation and Creator Mindset',
  description = 'Arrive, settle in, and build the psychological foundation of a creator. Understand the psychology behind storytelling that drives deep audience connection.',
  theme_name  = 'Foundation',
  call_time   = '17:30',
  is_active   = true,
  is_virtual  = false,
  schedule    = '[
    {"time": "5:30PM – 7:30PM", "activity": "Orientation"},
    {"time": "7:30PM – 8:30PM", "activity": "Psychology Behind Storytelling"},
    {"time": "8:30PM – 9:30PM", "activity": "Dinner"},
    {"time": "9:30PM – 10:30PM", "activity": "Psychology Behind Storytelling - 2"}
  ]'::json
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = 1;

-- Day 2 — Scripting & Pre-Production
UPDATE public.roadmap_days SET
  title       = 'Scripting & Pre-Production',
  description = 'Learn the art of the hook and scriptwriting. Write your first script from scratch and plan your pre-production for the shoots ahead.',
  theme_name  = 'Creation',
  call_time   = '10:00',
  is_active   = true,
  is_virtual  = false,
  schedule    = '[
    {"time": "9AM – 10AM", "activity": "Breakfast"},
    {"time": "10AM – 11AM", "activity": "Art of the Hook"},
    {"time": "11:30AM – 1:30PM", "activity": "Scriptwriting"},
    {"time": "1:30PM – 2:30PM", "activity": "Lunch"},
    {"time": "2:30PM – 4:30PM", "activity": "Write Your Script"},
    {"time": "4:30PM – 6:30PM", "activity": "Pre Production"},
    {"time": "6:30PM – 8:30PM", "activity": "Write Your Script"},
    {"time": "8:30PM – 9:30PM", "activity": "Dinner"},
    {"time": "9:30PM – 11PM", "activity": "Do Your Pre Production"}
  ]'::json
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = 2;

-- Day 3 — Camera, Lighting & Beach Shoot
UPDATE public.roadmap_days SET
  title       = 'Camera, Lighting & Beach Shoot',
  description = 'Master camera and lighting fundamentals, then hit the beach for your first real shoot. Learn by doing in Goa''s stunning outdoor setting.',
  theme_name  = 'Production',
  call_time   = '09:00',
  is_active   = true,
  is_virtual  = false,
  schedule    = '[
    {"time": "8AM – 9AM", "activity": "Breakfast"},
    {"time": "9AM – 11AM", "activity": "Camera and Lighting"},
    {"time": "11AM – 1:30PM", "activity": "Prep for Shoot"},
    {"time": "1:30PM – 2:30PM", "activity": "Lunch"},
    {"time": "2:30PM – 5:30PM", "activity": "Shoot at the Beach"},
    {"time": "8:30PM – 9:30PM", "activity": "Dinner"}
  ]'::json
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = 3;

-- Day 4 — Editing for Social Media
UPDATE public.roadmap_days SET
  title       = 'Editing for Social Media',
  description = 'Learn acting in front of camera and master editing for social media. Edit your first video with full mentor support and get it ready to post.',
  theme_name  = 'Post-Production',
  call_time   = '09:30',
  is_active   = true,
  is_virtual  = false,
  schedule    = '[
    {"time": "8AM – 9AM", "activity": "Breakfast"},
    {"time": "9:30AM – 11:30AM", "activity": "Acting in Front of Camera"},
    {"time": "12PM – 1:30PM", "activity": "Editing for Social Media"},
    {"time": "1:30PM – 2PM", "activity": "Lunch"},
    {"time": "1:30PM – 3:30PM", "activity": "Editing for Social Media (continued)"},
    {"time": "3:30PM – 8:30PM", "activity": "Edit with Mentors"},
    {"time": "8:30PM – 9:30PM", "activity": "Dinner"},
    {"time": "9:30PM – 11PM", "activity": "Edit with Mentors + Post"}
  ]'::json
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = 4;

-- Day 5 — Community, Monetisation & Outdoor Shoot
UPDATE public.roadmap_days SET
  title       = 'Community, Monetisation & Outdoor Shoot',
  description = 'Understand how to build a community and monetise your content. Take your skills outdoors for a second shoot and close the day with an unforgettable experience.',
  theme_name  = 'Growth',
  call_time   = '10:00',
  is_active   = true,
  is_virtual  = false,
  schedule    = '[
    {"time": "8AM – 9AM", "activity": "Breakfast"},
    {"time": "10AM – 12PM", "activity": "Community Building & Monetisation"},
    {"time": "12PM – 1:30PM", "activity": "Prep for Shoot"},
    {"time": "1:30PM – 2PM", "activity": "Lunch"},
    {"time": "2:30PM – 6:30PM", "activity": "Outdoor Shoot"},
    {"time": "7PM onwards", "activity": "Experience"}
  ]'::json
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = 5;

-- Day 6 — Brand Videos, Analytics & Final Edit
UPDATE public.roadmap_days SET
  title       = 'Brand Videos, Analytics & Final Edit',
  description = 'Learn brand video creation and platform analytics. Spend the day refining and editing your final video with mentor guidance — then post it.',
  theme_name  = 'Strategy',
  call_time   = '10:00',
  is_active   = true,
  is_virtual  = false,
  schedule    = '[
    {"time": "8AM – 9AM", "activity": "Breakfast"},
    {"time": "10AM – 11AM", "activity": "Brand Videos 101"},
    {"time": "11:30AM – 1:30PM", "activity": "Analytics & Algo 101"},
    {"time": "1:30PM – 2PM", "activity": "Lunch"},
    {"time": "2PM – 8:30PM", "activity": "Edit with Mentors"},
    {"time": "8:30PM – 9:30PM", "activity": "Dinner"},
    {"time": "9:30PM onwards", "activity": "Edit with Mentors + Post"}
  ]'::json
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = 6;

-- Day 7 — Screening & Graduation
UPDATE public.roadmap_days SET
  title       = 'Screening & Graduation',
  description = 'The final day — screen your finished videos, celebrate your transformation, and graduate as a Forge Creator. Checkout and carry your skills forward.',
  theme_name  = 'Graduation',
  call_time   = '09:30',
  is_active   = true,
  is_virtual  = false,
  schedule    = '[
    {"time": "8AM – 9AM", "activity": "Breakfast"},
    {"time": "9:30AM – 12:30PM", "activity": "Screening & Graduation"},
    {"time": "1PM", "activity": "Checkout"}
  ]'::json
WHERE is_template = true AND edition_id IS NULL
  AND cohort_type = 'FORGE_CREATORS' AND day_number = 7;

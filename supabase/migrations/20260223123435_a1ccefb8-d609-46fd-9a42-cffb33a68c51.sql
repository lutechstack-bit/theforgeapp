
-- Step 1: Delete existing Creators Edition 3 placeholder rows
DELETE FROM public.roadmap_days WHERE edition_id = '2fd72d93-ebef-450b-82cf-1dab56872777';

-- ============================================================
-- FORGE FILMMAKERS - Edition 15 (ec048e00-421e-4ceb-bcc0-df675173b296)
-- ============================================================

-- Online Sessions
INSERT INTO public.roadmap_days (edition_id, day_number, title, description, is_virtual, is_active, date, session_start_time) VALUES
('ec048e00-421e-4ceb-bcc0-df675173b296', -7, 'The Forge for Filmmakers: Orientation', 'Introduction to the program, team, and what to expect', true, true, NULL, NULL),
('ec048e00-421e-4ceb-bcc0-df675173b296', -6, 'Screenwriting for Short Films', 'Themes, Plot Ideas, and screenwriting fundamentals', true, true, NULL, NULL),
('ec048e00-421e-4ceb-bcc0-df675173b296', -5, 'Everything Cinematography (Theory)', 'Cinematography theory and visual language', true, true, NULL, NULL),
('ec048e00-421e-4ceb-bcc0-df675173b296', -4, 'Premise Approval', 'Present and get approval for your short film premise', true, true, NULL, NULL),
('ec048e00-421e-4ceb-bcc0-df675173b296', -3, 'Everything Film Editing (Theory)', 'Editing theory, pacing, and storytelling through cuts', true, true, NULL, NULL),
('ec048e00-421e-4ceb-bcc0-df675173b296', -2, 'One-on-One Script Mentorship', 'Mandatory 20-min slot for individual script feedback', true, true, NULL, NULL),
('ec048e00-421e-4ceb-bcc0-df675173b296', -1, 'One-on-One Script Mentorship (contd.)', 'Additional script mentorship if required (20-min slot)', true, true, NULL, NULL);

-- Bootcamp Days
INSERT INTO public.roadmap_days (edition_id, day_number, title, description, theme_name, objective, is_virtual, is_active, date, session_start_time, schedule) VALUES
('ec048e00-421e-4ceb-bcc0-df675173b296', 1, 'Orientation + Meet and Greet', 'Day 1 of the Forge Filmmaking bootcamp', 'Everything Everywhere All At Once', 'Orientation + Meet and Greet', false, true, NULL, NULL,
 '[{"time":"","activity":"Arrival"},{"time":"","activity":"Orientation"},{"time":"","activity":"Participants'' Intro and Ice-breaker + Visual Story Game"},{"time":"","activity":"Dinner"},{"time":"","activity":"Psychology behind Powerful Storytelling"}]'::jsonb),

('ec048e00-421e-4ceb-bcc0-df675173b296', 2, 'Learning + Pre-production', 'Deep dive into film direction and pre-production', 'Super Deluxe', 'Learning + Pre-production', false, true, NULL, NULL,
 '[{"time":"","activity":"Improv Drill + Breakfast"},{"time":"","activity":"Film Direction, Directors'' Whisper and Conflict Improv Workshop"},{"time":"","activity":"Lunch"},{"time":"","activity":"Everything Pre-production"},{"time":"","activity":"Pre-production with mentors'' guidance"},{"time":"","activity":"Dinner"},{"time":"","activity":"Film Quiz"}]'::jsonb),

('ec048e00-421e-4ceb-bcc0-df675173b296', 3, 'Learning + Pre-production', 'Cinematography workshop and shot division', 'Aparajito', 'Learning + Pre-production', false, true, NULL, NULL,
 '[{"time":"","activity":"Movement and Breakfast"},{"time":"","activity":"Practical Workshop on Cinematography Techniques and Equipment"},{"time":"","activity":"Lunch"},{"time":"","activity":"Filmmaking Masterclass and Shot Division rehearsals"},{"time":"","activity":"Creating your Pre-production worksheets + Costumes and equipment checklist"},{"time":"","activity":"Dinner"},{"time":"","activity":"Props Set-up, Acting Rehearsals and Mock Shooting + Navarasa Drill"}]'::jsonb),

('ec048e00-421e-4ceb-bcc0-df675173b296', 4, 'Production and Review', 'Full day shoot', NULL, 'Production and Review', false, true, NULL, NULL,
 '[{"time":"","activity":"Shoot + Breakfast"},{"time":"","activity":"Shoot + Lunch"},{"time":"","activity":"Shoot + Dinner"}]'::jsonb),

('ec048e00-421e-4ceb-bcc0-df675173b296', 5, 'Production and Review', 'Full day shoot', 'Gangs of Wasseypur', 'Production and Review', false, true, NULL, NULL,
 '[{"time":"","activity":"Shoot + Breakfast"},{"time":"","activity":"Shoot + Lunch"},{"time":"","activity":"Shoot + Dinner"}]'::jsonb),

('ec048e00-421e-4ceb-bcc0-df675173b296', 6, 'Post-production', 'Edit, Audio, SFX and Music workshop', 'Kantara', 'Post-production', false, true, NULL, NULL,
 '[{"time":"","activity":"Breakfast"},{"time":"","activity":"Workshop on Post Production: Edit, Audio, SFX and Music - Part 1"},{"time":"","activity":"Lunch"},{"time":"","activity":"Post Production of your Short Film"},{"time":"","activity":"Dinner"},{"time":"","activity":"Campfire + Open Mic"}]'::jsonb),

('ec048e00-421e-4ceb-bcc0-df675173b296', 7, 'Post-production', 'Final post-production, dubbing and sound design', 'Before Sunrise', 'Post-production', false, true, NULL, NULL,
 '[{"time":"","activity":"Breakfast"},{"time":"","activity":"Workshop on Post Production: Edit, Audio, SFX and Music Part 2 (optional)"},{"time":"","activity":"Lunch"},{"time":"","activity":"Post Production of your Short Film"},{"time":"","activity":"Pitch Gauntlet"},{"time":"","activity":"Dubbing and Sound Design of your Film"},{"time":"","activity":"Dinner"},{"time":"","activity":"Final Cut, Assembling and Rendering"}]'::jsonb),

('ec048e00-421e-4ceb-bcc0-df675173b296', 8, 'Screening and Farewell', 'Final screening, feedback, and departure', 'Mayabazar', 'Screening and Farewell', false, true, NULL, NULL,
 '[{"time":"","activity":"Breakfast"},{"time":"","activity":"Prepping the movies for screening"},{"time":"","activity":"Photo Session + Networking"},{"time":"","activity":"Screening and Feedback"},{"time":"","activity":"Departure"}]'::jsonb);

-- ============================================================
-- FORGE WRITING - Edition 5 (cf2b9fd2-a3da-4d0b-8370-da0937f9d786)
-- ============================================================

INSERT INTO public.roadmap_days (edition_id, day_number, title, description, objective, is_virtual, is_active, date, session_start_time, schedule) VALUES
('cf2b9fd2-a3da-4d0b-8370-da0937f9d786', 0, 'Pre-Forge Preparation', 'Prepare for the Forge Writing bootcamp', 'Preparation', false, true, NULL, NULL, NULL),

('cf2b9fd2-a3da-4d0b-8370-da0937f9d786', 1, 'Orientation + Meet and Greet', 'Welcome and introduction to the Forge Writing program', 'Orientation + Meet and Greet', false, true, NULL, NULL,
 '[{"time":"","activity":"Arrival"},{"time":"4:30 PM - 6:30 PM","activity":"Orientation"},{"time":"7:00 PM - 9:00 PM","activity":"Workshop on the Psychology behind Powerful Storytelling"},{"time":"9:00 PM - 10:00 PM","activity":"Dinner"}]'::jsonb),

('cf2b9fd2-a3da-4d0b-8370-da0937f9d786', 2, 'Foundational Learning', 'Fundamentals of storytelling, narrative structures, and sensory writing', 'Foundational Learning', false, true, NULL, NULL,
 '[{"time":"8:30 AM - 9:30 AM","activity":"Breakfast"},{"time":"10:00 AM - 1:30 PM","activity":"Fundamentals of Storytelling"},{"time":"1:30 PM - 2:30 PM","activity":"Lunch"},{"time":"2:45 PM - 3:45 PM","activity":"Independent Focus Writing"},{"time":"4:00 PM - 5:30 PM","activity":"Writing with your senses"},{"time":"6:30 PM - 8:30 PM","activity":"Developing Narratives and Structures"},{"time":"9:00 PM - 10:00 PM","activity":"Dinner"}]'::jsonb),

('cf2b9fd2-a3da-4d0b-8370-da0937f9d786', 3, 'Advanced Learning', 'Advanced writing techniques and mentorship', 'Advanced Learning', false, true, NULL, NULL,
 '[{"time":"8:30 AM - 9:30 AM","activity":"Breakfast"},{"time":"10:00 AM - 1:30 PM","activity":"Advanced Writing"},{"time":"1:30 PM - 2:30 PM","activity":"Lunch"},{"time":"3:30 PM - 6:30 PM","activity":"Mentorship Sessions (in slots)"},{"time":"7:00 PM - 8:00 PM","activity":"Writing Analysis with case studies"},{"time":"8:30 PM - 9:30 PM","activity":"Dinner"}]'::jsonb),

('cf2b9fd2-a3da-4d0b-8370-da0937f9d786', 4, 'Drafts and Focus Writing', 'Sacred forest experience, focus writing, and peer feedback', 'Drafts and Focus Writing', false, true, NULL, NULL,
 '[{"time":"5:30 AM - 11:00 AM","activity":"Sacred Forest Experience (travel included)"},{"time":"12:00 PM - 1:30 PM","activity":"Independent Focus Writing"},{"time":"1:30 PM - 2:30 PM","activity":"Lunch"},{"time":"2:30 PM - 4:00 PM","activity":"Independent Focus Writing"},{"time":"4:30 PM - 7:30 PM","activity":"Mentorship Sessions (in slots)"},{"time":"7:30 PM - 8:30 PM","activity":"Peer-to-Peer Feedback"},{"time":"8:30 PM - 9:30 PM","activity":"Dinner"}]'::jsonb),

('cf2b9fd2-a3da-4d0b-8370-da0937f9d786', 5, 'Feedback and Prep', 'Focus writing with mentor and pitching preparation', 'Feedback and Prep', false, true, NULL, NULL,
 '[{"time":"8:30 AM - 9:30 AM","activity":"Breakfast"},{"time":"9:30 AM - 1:30 PM","activity":"Focus Writing and Feedback"},{"time":"1:30 PM - 2:30 PM","activity":"Lunch"},{"time":"2:30 PM - 4:00 PM","activity":"Independent Focus Writing"},{"time":"4:30 PM - 6:30 PM","activity":"Focus Writing with your mentor"},{"time":"6:30 PM - 8:30 PM","activity":"Pitching and Publishing 101"},{"time":"8:30 PM - 9:30 PM","activity":"Dinner"}]'::jsonb),

('cf2b9fd2-a3da-4d0b-8370-da0937f9d786', 6, 'Pitching and Farewell', 'Final pitches, farewell, and departure', 'Pitching and Farewell', false, true, NULL, NULL,
 '[{"time":"8:30 AM - 9:30 AM","activity":"Breakfast"},{"time":"9:30 AM - 11:30 AM","activity":"Pitch your story"},{"time":"11:30 AM - 12:00 PM","activity":"Farewell and Photo Session"},{"time":"","activity":"Departure"}]'::jsonb);

-- ============================================================
-- FORGE CREATORS - Edition 3 (2fd72d93-ebef-450b-82cf-1dab56872777)
-- ============================================================

-- Online Sessions
INSERT INTO public.roadmap_days (edition_id, day_number, title, description, is_virtual, is_active, date, session_start_time) VALUES
('2fd72d93-ebef-450b-82cf-1dab56872777', -6, 'Orientation', 'Introduction to the Forge Creators program', true, true, NULL, NULL),
('2fd72d93-ebef-450b-82cf-1dab56872777', -5, 'Niche Discovery + Competitor Analysis', 'Finding your niche and analyzing the competition', true, true, NULL, NULL),
('2fd72d93-ebef-450b-82cf-1dab56872777', -4, 'Storytelling for Social Media', 'Crafting stories that resonate on social platforms', true, true, NULL, NULL),
('2fd72d93-ebef-450b-82cf-1dab56872777', -3, 'Videography Theory', 'Fundamentals of videography for content creation', true, true, NULL, NULL),
('2fd72d93-ebef-450b-82cf-1dab56872777', -2, 'Assignment Review and Feedback', 'Review of assignments and personalized feedback', true, true, NULL, NULL),
('2fd72d93-ebef-450b-82cf-1dab56872777', -1, 'Video Editing Theory', 'Editing fundamentals for social media content', true, true, NULL, NULL);

-- Bootcamp Days
INSERT INTO public.roadmap_days (edition_id, day_number, title, description, theme_name, objective, is_virtual, is_active, date, session_start_time, schedule) VALUES
('2fd72d93-ebef-450b-82cf-1dab56872777', 0, 'Pre-Forge Preparation', 'Prepare for the Forge Creators bootcamp in Bali', 'Preparation', 'Preparation', false, true, NULL, NULL, NULL),

('2fd72d93-ebef-450b-82cf-1dab56872777', 1, 'Orientation and Creator Mindset', 'Welcome and building the creator mindset', 'Foundation', 'Orientation and Creator Mindset', false, true, NULL, NULL,
 '[{"time":"5:30 PM - 6:30 PM","activity":"Orientation"},{"time":"6:30 PM - 7:30 PM","activity":"Psychology behind Storytelling"},{"time":"7:30 PM - 8:30 PM","activity":"Building the Creator Mindset"},{"time":"8:30 PM - 9:30 PM","activity":"Dinner"},{"time":"9:30 PM - 11:00 PM","activity":"Community Night"}]'::jsonb),

('2fd72d93-ebef-450b-82cf-1dab56872777', 2, 'Lighting, Scriptwriting and Pre-production', 'Art of lighting, scriptwriting, and shoot preparation', 'Skills', 'Lighting, Scriptwriting and Pre-production', false, true, NULL, NULL,
 '[{"time":"8:00 AM - 9:00 AM","activity":"Breakfast"},{"time":"9:00 AM - 11:00 AM","activity":"Art of Lighting"},{"time":"11:00 AM - 12:30 PM","activity":"Scriptwriting"},{"time":"12:30 PM - 1:30 PM","activity":"Lunch"},{"time":"1:30 PM - 3:30 PM","activity":"Write Your Script"},{"time":"3:30 PM - 4:30 PM","activity":"Pre Production"},{"time":"4:30 PM - 6:30 PM","activity":"Prep for Shoot"},{"time":"6:30 PM - 8:30 PM","activity":"Dinner"},{"time":"9:30 PM - 11:00 PM","activity":"Mentorship"}]'::jsonb),

('2fd72d93-ebef-450b-82cf-1dab56872777', 3, 'Editing for Social Media and Shoot in Nature', 'Social media editing and nature shoot', 'Production', 'Editing for Social Media and Shoot in Nature', false, true, NULL, NULL,
 '[{"time":"8:00 AM - 9:00 AM","activity":"Breakfast"},{"time":"9:00 AM - 12:00 PM","activity":"Editing for Social Media"},{"time":"12:00 PM - 1:30 PM","activity":"Edit with Mentors"},{"time":"1:30 PM - 2:30 PM","activity":"Lunch"},{"time":"2:30 PM - 5:30 PM","activity":"Shoot in Nature"},{"time":"5:30 PM - 8:30 PM","activity":"Edit with Mentors"},{"time":"8:30 PM - 9:30 PM","activity":"Dinner"}]'::jsonb),

('2fd72d93-ebef-450b-82cf-1dab56872777', 4, 'Cretya Ubud and Community Building', 'Cretya Ubud experience and community building', 'Production', 'Cretya Ubud and Community Building', false, true, NULL, NULL,
 '[{"time":"7:00 AM onwards","activity":"Cretya Ubud experience"},{"time":"11:00 AM - 1:30 PM","activity":"Community Building and Monetisation"},{"time":"12:30 PM - 1:30 PM","activity":"Edit with Mentors"},{"time":"1:30 PM - 2:00 PM","activity":"Lunch"},{"time":"2:30 PM - 5:00 PM","activity":"Review and Acting in front of Camera"},{"time":"5:00 PM onwards","activity":"Edit with Mentors"},{"time":"8:30 PM - 9:30 PM","activity":"Dinner"}]'::jsonb),

('2fd72d93-ebef-450b-82cf-1dab56872777', 5, 'Brands, Analytics and Shoot at Nuanu', 'Brand partnerships, analytics, and Nuanu shoot', 'Business', 'Brands, Analytics and Shoot at Nuanu', false, true, NULL, NULL,
 '[{"time":"8:00 AM - 9:00 AM","activity":"Breakfast"},{"time":"9:00 AM - 11:00 AM","activity":"Brands and Agencies 101"},{"time":"11:00 AM - 12:00 PM","activity":"Analytics and Algo 101"},{"time":"12:00 PM - 1:30 PM","activity":"Lunch"},{"time":"1:30 PM - 3:00 PM","activity":"Prep for Shoot"},{"time":"3:00 PM - 5:30 PM","activity":"Shoot at Nuanu Creative City"},{"time":"8:00 PM onwards","activity":"Edit with Mentors + Post Beach"}]'::jsonb),

('2fd72d93-ebef-450b-82cf-1dab56872777', 6, 'Screening and Graduation', 'Final screening, graduation, and departure', 'Celebration', 'Screening and Graduation', false, true, NULL, NULL,
 '[{"time":"8:00 AM - 9:00 AM","activity":"Breakfast"},{"time":"9:00 AM - 10:30 AM","activity":"Planning Your Content Roadmap"},{"time":"10:30 AM - 12:30 PM","activity":"Screening and Graduation"},{"time":"12:30 PM","activity":"Checkout"}]'::jsonb);

-- Add cohort_type column to prep_checklist_items
ALTER TABLE public.prep_checklist_items 
ADD COLUMN cohort_type TEXT NOT NULL DEFAULT 'FORGE';

-- Add check constraint for valid cohort types
ALTER TABLE public.prep_checklist_items 
ADD CONSTRAINT prep_checklist_items_cohort_type_check 
CHECK (cohort_type IN ('FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'));

-- Update existing items to be FORGE-specific (they already are via default)
UPDATE public.prep_checklist_items SET cohort_type = 'FORGE' WHERE cohort_type = 'FORGE';

-- Expand category constraint to include new categories for other cohorts
ALTER TABLE public.prep_checklist_items DROP CONSTRAINT IF EXISTS prep_checklist_items_category_check;
ALTER TABLE public.prep_checklist_items 
ADD CONSTRAINT prep_checklist_items_category_check 
CHECK (category IN ('script_prep', 'writing_prep', 'content_prep', 'packing', 'mindset', 'technical'));

-- =========================================
-- FORGE_WRITING Prep Items
-- =========================================

-- Writing Prep category
INSERT INTO public.prep_checklist_items (cohort_type, category, title, description, is_required, due_days_before, order_index)
VALUES 
  ('FORGE_WRITING', 'writing_prep', 'Prepare your story premise', 'Have a clear idea of the story/theme you want to explore during the program', true, 14, 1),
  ('FORGE_WRITING', 'writing_prep', 'Know your writing style', 'Identify your preferred genre or style before arriving', true, 14, 2),
  ('FORGE_WRITING', 'writing_prep', 'Bring writing samples', 'Optional: Bring any previous work for feedback from mentors', false, 7, 3);

-- Technical category for Writing
INSERT INTO public.prep_checklist_items (cohort_type, category, title, description, is_required, due_days_before, order_index)
VALUES 
  ('FORGE_WRITING', 'technical', 'Bring your writing laptop', 'For focus writing sessions and mentorship', true, 7, 10),
  ('FORGE_WRITING', 'technical', 'Install writing software', 'Word, Google Docs, or Scrivener installed and ready', false, 5, 11);

-- Packing category for Writing
INSERT INTO public.prep_checklist_items (cohort_type, category, title, description, is_required, due_days_before, order_index)
VALUES 
  ('FORGE_WRITING', 'packing', 'Valid government ID', 'Aadhar Card or equivalent for hotel check-in', true, 3, 20),
  ('FORGE_WRITING', 'packing', 'Cash money', 'For personal expenses. ATMs may not be nearby', true, 3, 21),
  ('FORGE_WRITING', 'packing', 'Power bank & chargers', 'Essential for keeping devices charged', true, 3, 22),
  ('FORGE_WRITING', 'packing', 'Notebooks & pens', 'For brainstorming and handwritten notes during sessions', true, 3, 23),
  ('FORGE_WRITING', 'packing', 'Reusable water bottle', 'Stay hydrated during long writing sessions', true, 3, 24),
  ('FORGE_WRITING', 'packing', 'Comfortable loose clothing', 'For long writing sessions', true, 3, 25),
  ('FORGE_WRITING', 'packing', 'Toiletries kit', 'Toothbrush, toothpaste, soap, shampoo, deodorant', true, 3, 26),
  ('FORGE_WRITING', 'packing', 'Moisturizer & sunscreen', 'For skin protection', true, 3, 27),
  ('FORGE_WRITING', 'packing', 'Personal medication', 'Any medicines you need', true, 3, 28);

-- Mindset category for Writing
INSERT INTO public.prep_checklist_items (cohort_type, category, title, description, is_required, due_days_before, order_index)
VALUES 
  ('FORGE_WRITING', 'mindset', 'Be open to feedback', 'The mentorship sessions involve critique - embrace it', true, 3, 30),
  ('FORGE_WRITING', 'mindset', 'Prepare discussion topics', 'Writers/books you want to discuss with mentors', false, 3, 31),
  ('FORGE_WRITING', 'mindset', 'Sleep well before Day 0', 'The program is intensive. Come well-rested', true, 1, 32);

-- =========================================
-- FORGE_CREATORS Prep Items
-- =========================================

-- Content Prep category
INSERT INTO public.prep_checklist_items (cohort_type, category, title, description, is_required, due_days_before, order_index)
VALUES 
  ('FORGE_CREATORS', 'content_prep', 'Define your niche', 'Know the type of content you want to create', true, 14, 1),
  ('FORGE_CREATORS', 'content_prep', 'Content ideas ready', 'Have 3-5 content concepts prepared before arriving', true, 7, 2),
  ('FORGE_CREATORS', 'content_prep', 'Know your target audience', 'Understand who your content is for', true, 7, 3);

-- Technical category for Creators
INSERT INTO public.prep_checklist_items (cohort_type, category, title, description, is_required, due_days_before, order_index)
VALUES 
  ('FORGE_CREATORS', 'technical', 'Your phone with good camera', 'Primary shooting device for creators', true, 3, 10),
  ('FORGE_CREATORS', 'technical', 'Phone rain cover', 'Essential for beach/outdoor shoots in monsoon', true, 3, 11),
  ('FORGE_CREATORS', 'technical', 'Power bank (Very essential)', 'Must be high capacity for long shoot days', true, 3, 12),
  ('FORGE_CREATORS', 'technical', 'Laptop', 'For editing and content planning sessions', true, 7, 13),
  ('FORGE_CREATORS', 'technical', 'Any creator tools you own', 'Ring lights, tripods, mics if you have them', false, 3, 14);

-- Packing category for Creators
INSERT INTO public.prep_checklist_items (cohort_type, category, title, description, is_required, due_days_before, order_index)
VALUES 
  ('FORGE_CREATORS', 'packing', 'Valid government ID', 'For hotel check-in', true, 3, 20),
  ('FORGE_CREATORS', 'packing', 'Cash money', 'For personal expenses. ATMs may not be nearby', true, 3, 21),
  ('FORGE_CREATORS', 'packing', 'Raincoat', 'Essential for monsoon season outdoor shoots', true, 3, 22),
  ('FORGE_CREATORS', 'packing', 'Running shoes', 'For outdoor shoots and moving around', true, 3, 23),
  ('FORGE_CREATORS', 'packing', 'Comfortable clothes', 'Lightweight and movement-friendly', true, 3, 24),
  ('FORGE_CREATORS', 'packing', 'Slippers', 'For the resort', true, 3, 25),
  ('FORGE_CREATORS', 'packing', 'Cap & sunglasses', 'Sun protection for outdoor shoots', false, 3, 26),
  ('FORGE_CREATORS', 'packing', 'Small backpack', 'For carrying essentials during shoots', true, 3, 27),
  ('FORGE_CREATORS', 'packing', 'Reusable water bottle', 'Stay hydrated', true, 3, 28),
  ('FORGE_CREATORS', 'packing', 'Notebooks & pens', 'For planning and notes', true, 3, 29),
  ('FORGE_CREATORS', 'packing', 'Toiletries kit', 'Toothbrush, toothpaste, soap, shampoo, deodorant', true, 3, 30),
  ('FORGE_CREATORS', 'packing', 'Moisturizer & sunscreen', 'Essential for outdoor shoots and skin protection', true, 3, 31),
  ('FORGE_CREATORS', 'packing', 'Insect repellant', 'For outdoor evening shoots', true, 3, 32),
  ('FORGE_CREATORS', 'packing', 'Personal medication', 'Any medicines you need', true, 3, 33);

-- Mindset category for Creators
INSERT INTO public.prep_checklist_items (cohort_type, category, title, description, is_required, due_days_before, order_index)
VALUES 
  ('FORGE_CREATORS', 'mindset', 'Creator mindset', 'Be ready to experiment and iterate on your content', true, 3, 40),
  ('FORGE_CREATORS', 'mindset', 'Community first', 'You''ll be shooting with and for others too - embrace collaboration', true, 3, 41),
  ('FORGE_CREATORS', 'mindset', 'Sleep well before Day 0', 'The program is intensive. Come well-rested', true, 1, 42);
-- Create roadmap_sidebar_content table for dynamic sidebar blocks
CREATE TABLE public.roadmap_sidebar_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL CHECK (block_type IN ('past_moments', 'student_work', 'stay_locations')),
  title TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'youtube', 'instagram')),
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roadmap_sidebar_content ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view active sidebar content"
ON public.roadmap_sidebar_content
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage sidebar content"
ON public.roadmap_sidebar_content
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_sidebar_content_edition ON public.roadmap_sidebar_content(edition_id);
CREATE INDEX idx_sidebar_content_block_type ON public.roadmap_sidebar_content(block_type);

-- Insert prep checklist items from brochures for FORGE (Filmmakers)
INSERT INTO public.prep_checklist_items (category, title, description, is_required, order_index, due_days_before) VALUES
-- Script Prep
('script_prep', 'Choose your shooting slot', 'Pick between day or evening slot. Your script should be written with your chosen time of day in mind.', true, 1, 14),
('script_prep', 'Keep your cast small', 'Maximum 2 actors recommended. Smaller cast = tighter control = better film.', true, 2, 14),
('script_prep', 'Write for your environment', 'Scout the location in photos/videos beforehand and write scenes that make use of available spaces.', true, 3, 14),
('script_prep', 'Finalize your screenplay', 'Complete your script before arriving. You will refine on Day 1-2 with mentors.', true, 4, 7),

-- Technical
('technical', 'Bring your editing laptop', 'You will need to edit your film during the program. Ensure laptop has sufficient storage and editing software installed.', true, 5, 7),
('technical', 'Install DaVinci Resolve', 'Free version is sufficient. Familiarize yourself with basics before arriving.', false, 6, 7),
('technical', 'No Log/RAW shooting', 'To keep workflow manageable, all shooting will be in standard color profiles only.', true, 7, 3),
('technical', 'Coordinate with your crew', 'Connect with fellow participants before arriving to discuss potential collaborations.', false, 8, 5),

-- Packing - Essentials
('packing', 'Valid government ID', 'Carry Aadhar Card or equivalent valid ID proof for hotel check-in.', true, 9, 3),
('packing', 'Cash money', 'Carry sufficient cash for personal expenses. ATMs may not be nearby.', true, 10, 3),
('packing', 'Power bank & chargers', 'Essential for long shooting days. Bring a high-capacity power bank.', true, 11, 3),
('packing', 'Reusable water bottle', 'Stay hydrated. Bring a refillable bottle for shoots.', true, 12, 3),
('packing', 'Notebooks & pens', 'For taking notes during masterclasses and planning your shots.', true, 13, 3),
('packing', 'Cap and sunglasses', 'Protection for outdoor shoots in bright conditions.', false, 14, 3),
('packing', 'Small backpack', 'For carrying essentials during mobile shoots.', false, 15, 3),

-- Packing - Clothing
('packing', 'Comfortable clothing', 'Bring clothes you can move freely in for long shoot days.', true, 16, 3),
('packing', 'Lightweight/breathable outfits', 'Weather can be hot and humid. Pack accordingly.', true, 17, 3),
('packing', 'Durable gloves', 'For handling equipment safely during shoots.', false, 18, 3),
('packing', 'Running/sports shoes', 'Comfortable footwear for long days on set.', true, 19, 3),
('packing', 'Slippers/flip-flops', 'For relaxing at the stay location.', false, 20, 3),
('packing', 'UV/sun sleeves', 'Protection from sun during outdoor shoots.', false, 21, 3),

-- Packing - Personal Care
('packing', 'Toiletries kit', 'Toothbrush, toothpaste, soap, shampoo, deodorant.', true, 22, 3),
('packing', 'Moisturizer & sunscreen', 'Essential for outdoor shoots and skin protection.', true, 23, 3),
('packing', 'Insect repellent', 'For outdoor evening shoots and rural locations.', false, 24, 3),
('packing', 'Wet wipes & tissues', 'Quick cleanup between takes.', false, 25, 3),
('packing', 'Personal medication', 'Any prescription medications you require.', true, 26, 3),
('packing', 'First aid basics', 'Band-aids, pain relievers, any allergy medications.', false, 27, 3),
('packing', 'Torch/flashlight', 'For evening shoots and moving around location at night.', false, 28, 3),
('packing', 'Hair dryer (optional)', 'Not always provided at stay location.', false, 29, 3),

-- Props
('packing', 'Portable props for your film', 'Bring any small props specific to your script that you can carry.', false, 30, 5),

-- Mindset
('mindset', 'Sleep well before Day 0', 'The program is intensive. Come well-rested.', true, 31, 1),
('mindset', 'Set intention for your film', 'Know what story you want to tell and why it matters to you.', true, 32, 3),
('mindset', 'Be open to collaboration', 'You will work with fellow filmmakers. Embrace the community.', true, 33, 1);
-- Fix RLS policies for public-facing content tables
-- These tables should be viewable by anyone (public role) for the home page

-- Events: Allow public to view events
DROP POLICY IF EXISTS "Everyone can view events" ON public.events;
CREATE POLICY "Everyone can view events" 
  ON public.events FOR SELECT 
  USING (true);

-- Learn Content: Allow public to view learn content  
DROP POLICY IF EXISTS "Everyone can view learn content" ON public.learn_content;
CREATE POLICY "Everyone can view learn content" 
  ON public.learn_content FOR SELECT 
  USING (true);

-- Editions: Allow public to view editions (needed for countdown timer)
DROP POLICY IF EXISTS "Everyone can view editions" ON public.editions;
CREATE POLICY "Everyone can view editions" 
  ON public.editions FOR SELECT 
  USING (true);

-- Mentors: Ensure public can view (may already exist)
DROP POLICY IF EXISTS "Everyone can view mentors" ON public.mentors;
CREATE POLICY "Everyone can view mentors" 
  ON public.mentors FOR SELECT 
  USING (true);

-- Alumni Testimonials: Ensure public can view
DROP POLICY IF EXISTS "Everyone can view alumni testimonials" ON public.alumni_testimonials;
CREATE POLICY "Everyone can view alumni testimonials" 
  ON public.alumni_testimonials FOR SELECT 
  USING (true);
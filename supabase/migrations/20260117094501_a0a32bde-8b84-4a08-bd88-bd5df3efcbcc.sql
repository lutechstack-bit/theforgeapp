-- Create mentors table
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  roles TEXT[] DEFAULT '{}',
  image_url TEXT,
  modal_image_url TEXT,
  bio TEXT[] DEFAULT '{}',
  brands JSONB DEFAULT '[]',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create alumni_testimonials table
CREATE TABLE public.alumni_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  film TEXT,
  achievement TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on mentors
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- Mentors: Public can view active mentors
CREATE POLICY "Public can view active mentors" 
ON public.mentors 
FOR SELECT 
USING (is_active = true);

-- Mentors: Admins can manage all mentors (using EXISTS check for user_roles)
CREATE POLICY "Admins can manage mentors" 
ON public.mentors 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Enable RLS on alumni_testimonials
ALTER TABLE public.alumni_testimonials ENABLE ROW LEVEL SECURITY;

-- Alumni: Public can view active testimonials
CREATE POLICY "Public can view active testimonials" 
ON public.alumni_testimonials 
FOR SELECT 
USING (is_active = true);

-- Alumni: Admins can manage all testimonials
CREATE POLICY "Admins can manage testimonials" 
ON public.alumni_testimonials 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Create updated_at trigger for mentors
CREATE TRIGGER update_mentors_updated_at
BEFORE UPDATE ON public.mentors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
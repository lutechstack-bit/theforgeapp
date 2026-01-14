-- Junction table for many-to-many relationship between sidebar content and editions
CREATE TABLE public.roadmap_sidebar_content_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.roadmap_sidebar_content(id) ON DELETE CASCADE,
  edition_id UUID NOT NULL REFERENCES public.editions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, edition_id)
);

-- Enable RLS
ALTER TABLE public.roadmap_sidebar_content_editions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read content editions"
ON public.roadmap_sidebar_content_editions
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage content editions
CREATE POLICY "Allow admins to manage content editions"
ON public.roadmap_sidebar_content_editions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Migrate existing edition_id data to junction table
INSERT INTO public.roadmap_sidebar_content_editions (content_id, edition_id)
SELECT id, edition_id 
FROM public.roadmap_sidebar_content 
WHERE edition_id IS NOT NULL;
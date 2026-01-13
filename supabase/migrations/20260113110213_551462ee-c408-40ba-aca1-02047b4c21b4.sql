-- Create cohort_groups table for edition-specific chat groups
CREATE TABLE public.cohort_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(edition_id)
);

-- Enable RLS
ALTER TABLE public.cohort_groups ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view cohort groups they belong to
CREATE POLICY "Users can view their cohort group"
ON public.cohort_groups FOR SELECT TO authenticated
USING (
  edition_id IN (
    SELECT edition_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Add cohort_group_id to community_messages
ALTER TABLE public.community_messages 
ADD COLUMN cohort_group_id UUID REFERENCES public.cohort_groups(id) ON DELETE CASCADE;

-- Create function to auto-create cohort group when edition is created
CREATE OR REPLACE FUNCTION public.create_cohort_group_for_edition()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cohort_groups (edition_id, name)
  VALUES (NEW.id, NEW.name || ' Cohort');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER on_edition_created
  AFTER INSERT ON public.editions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_cohort_group_for_edition();

-- Create cohort groups for existing editions
INSERT INTO public.cohort_groups (edition_id, name)
SELECT id, name || ' Cohort'
FROM public.editions
WHERE id NOT IN (SELECT edition_id FROM public.cohort_groups WHERE edition_id IS NOT NULL);

-- Add RLS policy for messages to cohort groups
CREATE POLICY "Users can view cohort messages they belong to"
ON public.community_messages FOR SELECT TO authenticated
USING (
  cohort_group_id IS NULL 
  OR cohort_group_id IN (
    SELECT cg.id FROM public.cohort_groups cg
    JOIN public.profiles p ON p.edition_id = cg.edition_id
    WHERE p.id = auth.uid()
  )
);

-- Policy for inserting messages to cohort groups
CREATE POLICY "Users can send cohort messages"
ON public.community_messages FOR INSERT TO authenticated
WITH CHECK (
  cohort_group_id IS NULL 
  OR cohort_group_id IN (
    SELECT cg.id FROM public.cohort_groups cg
    JOIN public.profiles p ON p.edition_id = cg.edition_id
    WHERE p.id = auth.uid()
  )
);
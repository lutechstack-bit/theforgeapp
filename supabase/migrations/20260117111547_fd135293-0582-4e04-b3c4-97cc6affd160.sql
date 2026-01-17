-- Add learn_content_id column to past_programs table
ALTER TABLE public.past_programs 
ADD COLUMN learn_content_id uuid REFERENCES public.learn_content(id);

COMMENT ON COLUMN public.past_programs.learn_content_id IS 
'Reference to the learn_content session for this past program';
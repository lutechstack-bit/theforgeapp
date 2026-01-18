-- Add instructor avatar URL column to learn_content table
ALTER TABLE public.learn_content 
ADD COLUMN IF NOT EXISTS instructor_avatar_url TEXT;

-- Add unique constraint to learn_watch_progress for upsert operations
-- First check if constraint exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'learn_watch_progress_user_content_unique'
  ) THEN
    ALTER TABLE public.learn_watch_progress
    ADD CONSTRAINT learn_watch_progress_user_content_unique 
    UNIQUE (user_id, learn_content_id);
  END IF;
END $$;
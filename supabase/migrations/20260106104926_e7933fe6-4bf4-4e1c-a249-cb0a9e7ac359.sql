-- Add video_source_type column to learn_content table
ALTER TABLE learn_content 
ADD COLUMN video_source_type TEXT DEFAULT 'upload';

-- Update existing records that have video URLs to be marked as 'upload'
UPDATE learn_content 
SET video_source_type = 'upload' 
WHERE video_url IS NOT NULL AND video_source_type IS NULL;
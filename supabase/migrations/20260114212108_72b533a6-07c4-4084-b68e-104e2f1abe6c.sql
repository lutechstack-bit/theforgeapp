-- Add archive columns to editions table
ALTER TABLE editions 
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE editions 
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
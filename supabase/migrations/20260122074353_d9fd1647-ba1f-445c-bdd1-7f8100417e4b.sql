-- Create table for storing versioned app documentation
CREATE TABLE app_doc_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  changelog TEXT,
  release_notes TEXT,
  content_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_current BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE app_doc_versions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage doc versions
CREATE POLICY "Admins can manage doc versions" ON app_doc_versions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view doc versions (for reference)
CREATE POLICY "Authenticated users can view doc versions" ON app_doc_versions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX idx_app_doc_versions_version ON app_doc_versions(version);
CREATE INDEX idx_app_doc_versions_is_current ON app_doc_versions(is_current);

-- Function to ensure only one version is marked as current
CREATE OR REPLACE FUNCTION set_current_doc_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE app_doc_versions SET is_current = false WHERE id != NEW.id AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to maintain single current version
CREATE TRIGGER ensure_single_current_version
  BEFORE INSERT OR UPDATE ON app_doc_versions
  FOR EACH ROW
  WHEN (NEW.is_current = true)
  EXECUTE FUNCTION set_current_doc_version();
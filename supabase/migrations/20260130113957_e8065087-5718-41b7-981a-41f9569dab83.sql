-- Create junction table for multi-edition support
CREATE TABLE stay_location_editions (
  stay_location_id UUID REFERENCES stay_locations(id) ON DELETE CASCADE,
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  PRIMARY KEY (stay_location_id, edition_id)
);

-- Enable RLS
ALTER TABLE stay_location_editions ENABLE ROW LEVEL SECURITY;

-- Policies (following existing pattern)
CREATE POLICY "Allow authenticated users to read stay location editions" 
ON stay_location_editions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admins to manage stay location editions" 
ON stay_location_editions FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing single edition_id data to junction table
INSERT INTO stay_location_editions (stay_location_id, edition_id)
SELECT id, edition_id FROM stay_locations WHERE edition_id IS NOT NULL;

-- Drop the old column
ALTER TABLE stay_locations DROP COLUMN edition_id;
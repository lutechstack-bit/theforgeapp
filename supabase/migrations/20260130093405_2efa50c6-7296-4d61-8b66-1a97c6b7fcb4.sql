-- Create enhanced stay_locations table
CREATE TABLE stay_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES editions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  google_maps_url TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  featured_image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE stay_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stay locations" ON stay_locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage stay locations" ON stay_locations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
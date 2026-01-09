-- Create forge_equipment table
CREATE TABLE public.forge_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_type TEXT NOT NULL DEFAULT 'FORGE',
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  model TEXT,
  description TEXT,
  specs JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forge_equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active equipment"
ON public.forge_equipment
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage equipment"
ON public.forge_equipment
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed Filmmakers equipment data
INSERT INTO public.forge_equipment (cohort_type, category, brand, name, model, description, specs, image_url, is_featured, order_index) VALUES
-- Hero Featured Camera
('FORGE', 'camera', 'Sony', 'Cinema Line', 'FX3', 'Your primary cinema camera - compact yet powerful with exceptional low-light performance', '["4K 120fps", "S-Log3", "Full-Frame"]', '/images/equipment/sony-fx3.png', true, 0),
-- Lenses
('FORGE', 'lens', 'Sony', 'Wide-Angle Zoom', '16-35mm f/2.8 GM', 'Perfect for establishing shots, interiors, and dramatic perspectives', '["f/2.8", "Full-Frame", "Ultra-Wide"]', '/images/equipment/sony-16-35mm.png', false, 1),
('FORGE', 'lens', 'Sony', 'Standard Zoom', '24-70mm f/2.8 GM II', 'The workhorse lens for narrative filmmaking and interviews', '["f/2.8", "Full-Frame", "Versatile"]', '/images/equipment/sony-24-70mm.png', false, 2),
('FORGE', 'lens', 'Sony', 'Telephoto Zoom', '70-200mm f/2.8 GM II', 'Ideal for compressed shots, distant subjects, and cinematic bokeh', '["f/2.8", "Full-Frame", "Telephoto"]', '/images/equipment/sony-70-200mm.png', false, 3),
('FORGE', 'lens', 'Zeiss', 'Cinema Prime Kit', 'CP.3 Series', 'Professional cinema glass for that unmistakable Zeiss look', '["T2.1", "5-Lens Set", "Cinema Glass"]', '/images/equipment/zeiss-cp3.png', false, 4),
-- Grip
('FORGE', 'grip', 'DJI', 'Gimbal Stabilizer', 'RS 3 Pro', 'Buttery smooth camera movements for dynamic shots', '["3-Axis", "4.5kg Payload", "Pro Stabilization"]', '/images/equipment/dji-rs3-pro.png', false, 5),
('FORGE', 'grip', 'Manfrotto', 'Video Tripod', '504X + 546B', 'Rock-solid support for static shots and smooth pans', '["Fluid Head", "Pro Legs", "75mm Bowl"]', '/images/equipment/manfrotto-504x.png', false, 6),
('FORGE', 'grip', 'Tiffen', 'ND Filter Set', 'Variable ND 2-5 Stop', 'Control exposure outdoors while keeping your aperture wide', '["Variable", "82mm", "2-5 Stop"]', NULL, false, 7),
('FORGE', 'grip', 'Lilliput', 'Field Monitor', 'A7S 7" 4K', 'See exactly what you are capturing in any lighting', '["7-inch", "4K HDMI", "1920x1200"]', NULL, false, 8),
-- Audio
('FORGE', 'audio', 'RODE', 'Shotgun Microphone', 'NTG5', 'Crystal-clear dialogue capture on location', '["Supercardioid", "RF-Bias", "Broadcast Quality"]', '/images/equipment/rode-ntg5.png', false, 9),
('FORGE', 'audio', 'RODE', 'Wireless Lav System', 'Wireless GO II', 'Freedom to record anywhere without cable constraints', '["Dual Channel", "200m Range", "Built-in Recorder"]', '/images/equipment/rode-wireless-go.png', false, 10),
-- Lighting
('FORGE', 'lighting', 'Aperture', 'LED Light', 'RS 600c Pro', 'Powerful, color-accurate lighting for any scene', '["RGBWW", "600W", "Bowens Mount"]', NULL, false, 11),
-- Software
('FORGE', 'software', 'Blackmagic', 'Editing Suite', 'DaVinci Resolve Studio', 'Industry-standard post-production for your final cut', '["Color Grading", "Edit", "VFX"]', NULL, false, 12);
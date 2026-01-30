-- Add new single address field
ALTER TABLE stay_locations ADD COLUMN full_address TEXT;

-- Migrate existing data (combine all address parts)
UPDATE stay_locations 
SET full_address = CONCAT_WS(', ', 
  NULLIF(address_line1, ''),
  NULLIF(address_line2, ''),
  NULLIF(city, ''),
  NULLIF(postcode, '')
)
WHERE address_line1 IS NOT NULL OR city IS NOT NULL;

-- Drop old columns
ALTER TABLE stay_locations DROP COLUMN IF EXISTS address_line1;
ALTER TABLE stay_locations DROP COLUMN IF EXISTS address_line2;
ALTER TABLE stay_locations DROP COLUMN IF EXISTS city;
ALTER TABLE stay_locations DROP COLUMN IF EXISTS postcode;
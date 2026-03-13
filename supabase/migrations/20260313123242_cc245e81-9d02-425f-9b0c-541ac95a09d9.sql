-- KYF: missing country for country-state field
ALTER TABLE public.kyf_responses
  ADD COLUMN IF NOT EXISTS country text;

-- KYC: missing hospitality fields
ALTER TABLE public.kyc_responses
  ADD COLUMN IF NOT EXISTS food_allergies text,
  ADD COLUMN IF NOT EXISTS medication_support text,
  ADD COLUMN IF NOT EXISTS tshirt_size text;

-- KYW: missing general + location fields
ALTER TABLE public.kyw_responses
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS country text;
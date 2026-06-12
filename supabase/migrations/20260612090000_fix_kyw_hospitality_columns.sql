-- Fix: the KY Writer form writes the shared Food/Dietary + Merch/Emergency
-- fields, but kyw_responses was never given those columns (migration
-- 20260313123242 added them to kyc_responses but skipped kyw_responses).
-- Writing students hit "Could not find the 'food_allergies' column of
-- 'kyw_responses' in the schema cache" on the final step.
-- Run this in the Lovable SQL editor.

ALTER TABLE public.kyw_responses
  ADD COLUMN IF NOT EXISTS meal_preference   text,
  ADD COLUMN IF NOT EXISTS food_allergies    text,
  ADD COLUMN IF NOT EXISTS medication_support text,
  ADD COLUMN IF NOT EXISTS tshirt_size       text;

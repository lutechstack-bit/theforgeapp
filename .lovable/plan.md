

# Fix Missing Database Columns Across All KY Form Tables

## Problem
Multiple KY form tables are missing columns that their form configurations reference, causing errors when users try to save responses.

## Column Audit Results

| Table | Missing Column | Type | Referenced In Config |
|-------|---------------|------|---------------------|
| `kyf_responses` | `country` | text | Line 157 — `countryKey: 'country'` in address step |
| `kyc_responses` | `food_allergies` | text | Line 397 — Hospitality section |
| `kyc_responses` | `medication_support` | text | Line 398 — Hospitality section |
| `kyc_responses` | `tshirt_size` | text | Line 406 — Hospitality section |
| `kyw_responses` | `date_of_birth` | date | Line 439 — General Details step |
| `kyw_responses` | `country` | text | Line 447 — `countryKey: 'country'` in location step |

## Fix

Single database migration adding all 6 missing columns:

```sql
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
```

No frontend code changes needed. The form configs are already correct — only the database schemas need to catch up.


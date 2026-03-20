

# Download KY Form Responses as CSV

## Overview
Add a "Download Responses" button to each cohort type card on the AdminKYForms page. When clicked, it fetches all rows from the corresponding response table (`kyf_responses`, `kyc_responses`, or `kyw_responses`), joins with `profiles` to include user names, and downloads as a CSV file.

## Changes

### File: `src/pages/admin/AdminKYForms.tsx`

1. Import `Download` from lucide-react
2. Add a `downloadResponses` async function that:
   - Maps cohort type to the correct table (`FORGE` → `kyf_responses`, `FORGE_CREATORS` → `kyc_responses`, `FORGE_WRITING` → `kyw_responses`)
   - Fetches all rows from that table
   - Fetches profiles to map `user_id` → `full_name` and `email`
   - Flattens all columns into CSV with headers
   - Triggers browser download as `ky-responses-{cohort}.csv`
3. Add a "Download CSV" button on each cohort card (next to Edit), visible only when a form exists

### No database changes needed
Admin already has SELECT access to all three response tables via existing RLS policies.


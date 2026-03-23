

# Download All Student Data as CSV

## Problem
The existing "Download Responses" button only exports KY form responses (kyf/kyc/kyw tables). You want a single CSV that combines **everything**: profile info, creative profile data, and KY form responses for all students.

## Changes — `src/pages/admin/AdminKYForms.tsx`

### 1. Add "Download All Student Data" button
Place a prominent button at the top of the page (next to the heading) that exports a comprehensive CSV.

### 2. New `downloadAllStudentData` function
Fetches and merges data from multiple tables:

- **`profiles`** — full_name, email, city, phone, payment_status, edition_id, profile_setup_completed, ky_form_completed
- **`editions`** — edition name, cohort_type, city (joined via edition_id)
- **`collaborator_profiles`** — tagline, intro, about, occupations, available_for_hire, open_to_remote, portfolio_url, portfolio_type
- **`kyf_responses`** / **`kyc_responses`** / **`kyw_responses`** — all KY form fields, matched per user based on their cohort type

### 3. CSV structure
One row per student, columns include:
- Profile: full_name, email, city, phone, payment_status, edition_name, cohort_type
- Creative profile: tagline, intro, about, occupations, available_for_hire, open_to_remote, portfolio_url, portfolio_type
- KY form fields: all columns from their cohort-specific response table (flattened)

### 4. No database changes needed
Admin already has SELECT access to all tables.

## File
`src/pages/admin/AdminKYForms.tsx` — add button + download function


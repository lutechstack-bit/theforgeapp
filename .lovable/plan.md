

# Seed KY Form Builder with Existing Form Definitions

## Problem
The admin KY Form Builder page reads from `ky_forms`/`ky_form_steps`/`ky_form_fields` database tables, but these are empty. The actual student-facing forms are hardcoded in `src/components/kyform/KYSectionConfig.ts`. The two systems are disconnected, so the admin sees empty "Create Form" cards.

## Solution
Add an "auto-seed" mechanism: when the admin page loads and finds no form for a cohort type, automatically populate the database tables from the hardcoded `KYSectionConfig.ts` definitions. This is a one-time operation per cohort.

## Changes

### File: `src/pages/admin/AdminKYForms.tsx`

1. Import `getSectionsForCohort` from `KYSectionConfig`
2. Add a `seedFormsFromConfig` function that runs after `fetchForms`:
   - For each cohort type (FORGE, FORGE_CREATORS, FORGE_WRITING), check if a form exists in the fetched data
   - If not, read the sections from `getSectionsForCohort(cohortType)`
   - Insert a `ky_forms` row, then for each section create `ky_form_steps` rows, and for each field in each step create `ky_form_fields` rows
   - Map field types from `KYSectionConfig` format to the admin builder format (e.g., `proficiency-grid` -> `proficiency`, `tags` -> `multi_select`, etc.)
3. After seeding, re-fetch forms so the UI shows the populated data

### No database changes needed
The `ky_forms`, `ky_form_steps`, and `ky_form_fields` tables already exist with the correct schema.

## Technical Detail: Field Type Mapping
KYSectionConfig uses types like `proficiency-grid`, `tags`, `chronotype`, `mbti`, `meal-preference`, `tshirt-size`, `pill-select`, `country-state`. These will be mapped to the closest admin builder types (`proficiency`, `multi_select`, `radio`, `select`, `text`) with options preserved.


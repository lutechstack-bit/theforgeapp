

# Rebuild Admin KY Forms Page + Dashboard KY Metrics

## What Changes

### 1. Admin KY Forms page — Live Sheet View with student data
Replace the current form-builder-only page with a tabbed layout:
- **Tab 1: "Student Data"** (new, default) — A spreadsheet-style table showing all students with their KY form completion status and key filled fields. Features:
  - Filterable by cohort type (Filmmaking / Creators / Writing)
  - Columns: Name, Email, Edition, Cohort, KY Form Status (complete/incomplete), Collaborator Profile Status (complete/incomplete), key KY fields (occupation, MBTI, city)
  - Checkbox selection on each row for bulk actions
  - "Download Selected" button that exports selected rows as CSV (or all if none selected)
  - "Download All Student Data" button retained
  - Click a row to expand/view all their filled KY data in a slide-out sheet
- **Tab 2: "Form Builder"** — Existing form builder UI moved here unchanged

### 2. Dashboard — KY Form Completion Metrics
Add a new KPI card row or section in the Overview tab showing:
- **KY Forms Completed**: Count of users with `ky_form_completed = true` vs total, shown as a percentage ring or fraction
- **Collaborator Profiles Created**: Count of `collaborator_profiles` entries vs total users — this is the community profile completion metric
- These two metrics will be added as new KPI cards in the existing top row (making it 7 cards, or placed in the Overview tab as a mini section)

### 3. Fix runtime error
The `AdminTestingContext.tsx` has a `useState` crash — likely a React version mismatch or import issue. Will check and fix the import.

## Technical Plan

### Files to modify:
1. **`src/pages/admin/AdminKYForms.tsx`** — Major rewrite:
   - Add `Tabs` with "Student Data" and "Form Builder"
   - New `useStudentKYData` hook that fetches profiles + edition + ky responses + collaborator_profiles in one query
   - Render a `Table` with checkboxes, filters, and download functionality
   - Row click opens a `Sheet` showing all KY response fields for that student
   
2. **`src/pages/admin/AdminDashboard.tsx`** — Add KY completion metrics:
   - New `useKYFormStats` hook querying `profiles` for `ky_form_completed` counts and `collaborator_profiles` count
   - Add 2 KPI cards: "KY Forms" (% completed) and "Community Profiles" (count)
   - Place in the existing KPI row or as a new mini-section in the Overview tab

3. **`src/contexts/AdminTestingContext.tsx`** — Fix the `useState` null error (likely needs a guard or React import fix)

### No database changes needed
All data already exists in `profiles`, `kyf_responses`, `kyc_responses`, `kyw_responses`, `collaborator_profiles`, and `editions`.


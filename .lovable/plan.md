

# Add Separate Online & Bootcamp Start Dates to Editions

## Problem
Currently, both online sessions (negative day numbers) and bootcamp days (positive day numbers) calculate dates from a single `forge_start_date`. Since there's a 2-day gap between online and offline phases, dates can overlap or collapse — especially for FORGE and FORGE_CREATORS cohorts that have both online and bootcamp sessions.

## Solution
Add an `online_start_date` field to the `editions` table. The roadmap date calculation will use `online_start_date` for negative day numbers and `forge_start_date` for positive day numbers (bootcamp). This only applies to FORGE and FORGE_CREATORS cohorts (Writing has no online sessions).

## Changes

### 1. Database Migration
Add `online_start_date` column to the `editions` table:
```sql
ALTER TABLE public.editions 
ADD COLUMN online_start_date timestamp with time zone;
```

### 2. Admin Editions Form (`AdminEditions.tsx`)
- Show `online_start_date` field only when cohort type is FORGE or FORGE_CREATORS
- Rename existing date fields for clarity: "Bootcamp Start" and "Bootcamp End"
- Add a new "Online Start" date input above the bootcamp dates
- The form will conditionally render the online field based on selected cohort type

### 3. Roadmap Date Calculation (`useRoadmapData.ts`)
Update the date calculation logic:
- **Negative day numbers** (online sessions): Calculate from `edition.online_start_date` if available, otherwise fall back to `forge_start_date` minus gap
- **Positive day numbers** (bootcamp): Continue using `forge_start_date` as today

### 4. Edition Card Display (`AdminEditions.tsx`)
Show both date ranges on the edition card when `online_start_date` is set:
- "Online: Mar 10 - Mar 14"
- "Bootcamp: Mar 17 - Mar 22"

| File | Action |
|------|--------|
| `editions` table | Migration: add `online_start_date` column |
| `src/pages/admin/AdminEditions.tsx` | Add online start date field (conditional on cohort type), update card display |
| `src/hooks/useRoadmapData.ts` | Use `online_start_date` for negative day numbers |


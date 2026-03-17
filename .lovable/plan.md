

# Fix: Roadmap Template Per Cohort Type with Dynamic Dates

## Problem

The `roadmap_days` table has identical content duplicated across multiple editions per cohort type. When a user's assigned edition (e.g., E16 `cafb3143`) has no `roadmap_days`, the fallback loops through random editions and may pick an old/incomplete one. The real issue: the editions users are assigned to (like "Forge Filmmaking Bootcamp - E16") are **different DB rows** from the editions that have roadmap content (like "Forge Filmmaking - Edition 16 - Goa").

**Current DB state:**
- FORGE: 15-day template exists in 3 editions (`ec048e00`, `a548bddb`, `1916b61f`), plus a 7-day old one
- FORGE_CREATORS: 13-day template in 4 editions, plus 7-day old ones
- FORGE_WRITING: 7-day template in 3 editions
- User editions (`cafb3143`, `fada9b20`) have **zero** roadmap_days

## Solution

Add a `cohort_type` column to `roadmap_days` and mark one canonical template per cohort. Then query by cohort_type directly instead of looping through editions.

### 1. Database Migration

```sql
-- Add cohort_type to roadmap_days
ALTER TABLE roadmap_days ADD COLUMN cohort_type cohort_type;
ALTER TABLE roadmap_days ADD COLUMN is_template boolean DEFAULT false;

-- Backfill cohort_type from editions
UPDATE roadmap_days rd
SET cohort_type = e.cohort_type
FROM editions e WHERE rd.edition_id = e.id;

-- Shared (null edition_id) defaults to FORGE
UPDATE roadmap_days SET cohort_type = 'FORGE' WHERE edition_id IS NULL AND cohort_type IS NULL;

-- Mark ONE master template per cohort (most complete sets)
UPDATE roadmap_days SET is_template = true WHERE edition_id = '1916b61f-f414-4e11-82b9-8c7c857b57dd'; -- FORGE 15 days
UPDATE roadmap_days SET is_template = true WHERE edition_id = '9a202834-5928-42f3-93eb-0e7791fe0e25'; -- CREATORS 13 days
UPDATE roadmap_days SET is_template = true WHERE edition_id = '7f94f1b7-2fb6-4fb4-869e-6957a550c701'; -- WRITING 7 days
```

### 2. Simplify `useRoadmapData.ts` Query

Replace the 3-step fallback with a clean 2-step:

```typescript
// Step 1: Try user's exact edition
const { data } = await supabase
  .from('roadmap_days').select('*')
  .eq('edition_id', editionIdForQuery)
  .order('day_number', { ascending: true });

if (data && data.length > 0) return data;

// Step 2: Get master template for cohort type
const { data: tpl } = await supabase
  .from('roadmap_days').select('*')
  .eq('cohort_type', userCohortType)
  .eq('is_template', true)
  .order('day_number', { ascending: true });

return tpl || [];
```

Dates continue to be calculated dynamically from the user's edition's `online_start_date` and `forge_start_date` -- no change needed to the date calculation `useMemo`.

### 3. Add `online_end_date` to Editions

```sql
ALTER TABLE editions ADD COLUMN online_end_date timestamp with time zone;
```

Update `AdminEditions.tsx` to include an "Online End Date" field in the create/edit form.

## File Changes

| File | Change |
|------|--------|
| **DB migration** | Add `cohort_type`, `is_template` to `roadmap_days`; backfill; add `online_end_date` to `editions` |
| `src/hooks/useRoadmapData.ts` | Replace 3-step fallback with 2-step (edition → cohort template) |
| `src/pages/admin/AdminEditions.tsx` | Add `online_end_date` field |

## How It Works After Fix

```text
User on E16 (FORGE, cafb3143, no roadmap_days)
  → Step 1: edition_id = cafb3143 → 0 rows
  → Step 2: cohort_type = FORGE, is_template = true → 15 rows ✓
  → Dates calculated from E16's online_start_date (Apr 15) + forge_start_date (Apr 25) ✓
```


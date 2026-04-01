

# Fix: Online Session Dates Wrong for E16 & E17

## Root Cause
The `Edition` interface and `fetchEdition` query in `AuthContext.tsx` only select `id, forge_start_date, forge_end_date, cohort_type` — **missing `online_start_date`, `online_end_date`, and `city`**.

So `useRoadmapData.ts` line 39 casts `(effectiveEd as any)?.online_start_date` which is always `undefined`, causing online session dates to be calculated from `forge_start_date` minus day offsets instead of the actual `online_start_date`.

**Result**: E16 shows Apr 18 instead of Apr 15. E17 shows Apr 20 instead of Apr 17.

## Fix (3 files, small changes)

### 1. `src/contexts/AuthContext.tsx`
- Add `online_start_date`, `online_end_date` (both `string | null`) and `city` (`string`) to the `Edition` interface (line 50-56)
- Update the `fetchEdition` select query (line 193) to include those 3 fields:
  `'id, forge_start_date, forge_end_date, cohort_type, online_start_date, online_end_date, city'`

### 2. `src/hooks/useEffectiveCohort.ts`
- Add `online_start_date` and `online_end_date` to the simulated edition object (line 23-30) so admin simulation also gets correct dates

### 3. `src/hooks/useRoadmapData.ts`
- Remove the `(effectiveEd as any)` cast on line 39 since `online_start_date` will now be on the `Edition` type

## Result
- E16 online sessions: Apr 15–23 (correct)
- E17 online sessions: Apr 17–25 (correct)
- Bootcamp dates unaffected (already use `forge_start_date`)
- No database changes needed — `online_start_date` and `online_end_date` already exist in the `editions` table


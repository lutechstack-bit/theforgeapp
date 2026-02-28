

# Make Admin Cohort Switcher Functional

## Problem
The cohort switcher UI exists but only `useRoadmapData` respects `simulatedCohortType`. All other hooks (`useStudentJourney`, `useHomepageSections`, `useTodaysFocus`) and `Home.tsx` read `edition?.cohort_type` directly from `useAuth()`, so switching cohorts in the admin panel has no effect on most of the app.

Additionally, when simulating a different cohort, the system still uses the admin's own `edition_id` for data queries — meaning roadmap days, prep items, etc. won't load for the simulated cohort unless there's a matching edition.

## Approach
Create a shared hook `useEffectiveCohort()` that centralizes the logic of "simulated cohort or real cohort" and also resolves a representative edition for the simulated cohort (so data queries work). Then update all consumers.

## Implementation Steps

### Step 1: Create `src/hooks/useEffectiveCohort.ts`
A new hook that:
- Reads `simulatedCohortType` from `useAdminTestingSafe()`
- Reads `edition` from `useAuth()`
- If simulating a different cohort, fetches the latest non-archived edition of that cohort type (using a react-query cache) to provide a `simulatedEdition` object
- Returns `{ effectiveCohortType, effectiveEdition, isSimulating }`

### Step 2: Update `useStudentJourney.ts`
- Replace `const cohortType = edition?.cohort_type || 'FORGE'` with `useEffectiveCohort()` so journey tasks and stage filtering respect the simulated cohort

### Step 3: Update `useHomepageSections.ts`
- Replace `const userCohortType = edition?.cohort_type` with `useEffectiveCohort()` so homepage section visibility respects the simulated cohort

### Step 4: Update `useTodaysFocus.ts`
- Replace `const userCohortType = edition?.cohort_type` with `useEffectiveCohort()` so focus card cohort filtering works

### Step 5: Update `src/pages/Home.tsx`
- Replace `const userCohortType = edition?.cohort_type` with `useEffectiveCohort()` for the debug display and any cohort-based logic

### Step 6: Update `useRoadmapData.ts`
- Use `useEffectiveCohort()` instead of its inline logic, so all hooks share the same simulated edition resolution (including the correct `edition_id` for roadmap_days queries)

### Step 7: Update `AdminCohortSwitcher.tsx`
- When a cohort is selected, also pick a representative edition for that cohort (latest non-archived) and store its ID in the testing context
- Add `simulatedEditionId` to `AdminTestingContext` so the effective cohort hook can use it

## Technical Detail

The `AdminTestingContext` gets a new field:
```
simulatedEditionId: string | null
```

When `setSimulatedCohortType(cohort)` is called in the switcher, it also queries for the latest edition of that cohort and sets `simulatedEditionId`. This way `useEffectiveCohort` can return a full edition object (with city, dates, etc.) for the simulated cohort.

The `useEffectiveCohort` hook:
```typescript
export const useEffectiveCohort = () => {
  const { edition } = useAuth();
  const { isTestingMode, simulatedCohortType, simulatedEditionId } = useAdminTestingSafe();
  
  // If simulating, fetch the simulated edition
  const { data: simEdition } = useQuery({
    queryKey: ['simulated-edition', simulatedEditionId],
    queryFn: /* fetch edition by ID */,
    enabled: isTestingMode && !!simulatedEditionId,
  });
  
  const effectiveCohortType = (isTestingMode && simulatedCohortType) || edition?.cohort_type;
  const effectiveEdition = (isTestingMode && simEdition) || edition;
  
  return { effectiveCohortType, effectiveEdition, isSimulating: ... };
};
```

## Files Changed
1. **New**: `src/hooks/useEffectiveCohort.ts`
2. **Edit**: `src/contexts/AdminTestingContext.tsx` — add `simulatedEditionId`
3. **Edit**: `src/components/admin/AdminCohortSwitcher.tsx` — fetch & set edition when switching
4. **Edit**: `src/hooks/useStudentJourney.ts` — use `useEffectiveCohort`
5. **Edit**: `src/hooks/useHomepageSections.ts` — use `useEffectiveCohort`
6. **Edit**: `src/hooks/useTodaysFocus.ts` — use `useEffectiveCohort`
7. **Edit**: `src/hooks/useRoadmapData.ts` — use `useEffectiveCohort`
8. **Edit**: `src/pages/Home.tsx` — use `useEffectiveCohort`

No database changes needed.


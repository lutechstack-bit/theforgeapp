

# Fix: Duplicate Roadmap Days + Clean Up All Courses Grid

## Problem 1: Duplicate Roadmap Days

**Root cause** (lines 87-103 in `useRoadmapData.ts`): When the user's edition has no roadmap days, the Step 2 fallback fetches days from ALL editions of the same cohort type using `.in('edition_id', editionIds)`. If 7 FORGE editions have roadmap data, it returns 7 copies of every day.

**The user's point**: Roadmap days should come from the user's assigned edition. If their edition has no days, the fallback should grab from ONE other edition of the same cohort type — not all of them.

**Fix**: Replace the `.in()` bulk query with a loop that tries each edition individually and returns the first one with data.

### Code change — `src/hooks/useRoadmapData.ts` (lines 87-103)

Replace the `.in('edition_id', editionIds)` block with:
```typescript
for (const eid of editionIds) {
  const cohortResult = await promiseWithTimeout(
    supabase
      .from('roadmap_days')
      .select('*')
      .eq('edition_id', eid)
      .order('day_number', { ascending: true })
      .then(res => res),
    ROADMAP_QUERY_TIMEOUT,
    'roadmap_days_cohort_single'
  );
  if (cohortResult.data && cohortResult.data.length > 0) {
    return cohortResult.data as RoadmapDay[];
  }
}
```

## Problem 2: Community Cards Too Large on All Courses Page

**Root cause** (line 113-114): Community sessions use `grid-cols-1`, making portrait cards span full width.

**Fix**: Use `grid-cols-2 sm:grid-cols-2 lg:grid-cols-3` for all filters uniformly.

### Code change — `src/pages/AllCourses.tsx` (lines 111-116)

```typescript
<div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
```

Remove the conditional grid logic entirely.

## Summary

| File | Change |
|------|--------|
| `src/hooks/useRoadmapData.ts` | Fix Step 2 fallback: loop editions individually, return first with data |
| `src/pages/AllCourses.tsx` | Remove conditional grid, use uniform multi-column layout |




# Fix Venue Edition Filtering & Empty State

## Changes

### 1. `src/components/home/TravelStaySection.tsx` — Filter by user's edition

Update the query to first check `stay_location_editions` for the user's edition, then fetch only matching `stay_locations`. Follow the same pattern already used in `RoadmapSidebar.tsx` (lines 147-151).

- Add `edition?.id` to the query key: `['home_stay_locations', edition?.id]`
- If `edition?.id` exists: query `stay_location_editions` filtered by `edition_id`, get the `stay_location_id` list, then fetch those from `stay_locations`
- If no edition or no edition-specific mappings: fall back to fetching all active locations (current behavior)

### 2. `src/pages/Home.tsx` (line 207) — Gate empty state on alumni section

Add `alumniSection &&` to the condition so "Content Coming Soon" only renders when the alumni section is enabled:

```
{alumniSection && !loadingTimedOut && studentWorksQuery.isFetched && displayAlumni.length === 0 && !isAnyError && (
```

No database or backend changes needed.


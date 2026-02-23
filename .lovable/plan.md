
# Fix Journey Card to Always Show Day Title

## Problem
The Journey summary card shows "Journey" as fallback text because `currentDay` is `undefined`. This happens when:
- In PRE_FORGE mode, the "current" day has `day_number === 0`, but no bootcamp day (day_number > 0) matches
- No roadmap days exist yet
- All days are completed (POST_FORGE)

## Solution
Update the `currentDay` lookup in `RoadmapSummaryCards.tsx` to search ALL `roadmapDays` (not just bootcamp days), and add better fallbacks:

1. **Find current day from all roadmap days** (not just day_number > 0)
2. **If no current day found**, fall back to the first upcoming day, or the last completed day
3. **Show the day's title as the bold heading** with a proper fallback chain

## File Modified

| File | Change |
|------|--------|
| `src/components/roadmap/RoadmapSummaryCards.tsx` | Update `currentDay` logic (lines 24-32) to search all days with fallback, and improve the title display |

## Technical Details

Replace the current day lookup:

```typescript
// Current (broken for PRE_FORGE)
const currentDay = roadmapDays?.find(d => getDayStatus(d) === 'current');
```

With a fallback chain:

```typescript
const currentDay = roadmapDays?.find(d => getDayStatus(d) === 'current')
  || roadmapDays?.find(d => getDayStatus(d) === 'upcoming')
  || roadmapDays?.[roadmapDays.length - 1];
```

This ensures there is always a day with a real title to display, regardless of the forge mode.

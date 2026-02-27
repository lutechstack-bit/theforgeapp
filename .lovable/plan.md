

# Fix: Roadmap Summary Cards Overflow on Mobile

## Problem
On mobile (375px), three summary cards with `min-w-[140px]` each plus 12px gaps total ~444px, exceeding the ~343px available width. This causes the Prep card to be partially hidden/cut off.

## Fix

### `src/components/roadmap/RoadmapSummaryCards.tsx`

**Line 126** — Change the container from `flex` with overflow-scroll to a CSS grid that fits all 3 cards:
```
flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1 mb-4
```
→
```
grid grid-cols-3 gap-2 sm:gap-3 mb-4
```

**Line 133-134** — Remove scroll-related classes from cards:
- Remove `flex-1 min-w-[140px] snap-start`
- Replace with `min-w-0` (allows grid children to shrink below content size)

**Line 111** — In the Prep card content, add `truncate` to the percentage text so it doesn't force the card wider.

This ensures all three cards are always equally sized and fully visible regardless of viewport width, with no horizontal scrolling needed.


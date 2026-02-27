

# Restructure Roadmap Summary Cards for Mobile

## Problem
Three equal-width cards in a 3-column grid on mobile (~375px) leaves each card only ~105px wide. Text like "19 remaining" and "19 required left" gets clipped, and the ProgressRing crowds the Tasks card content.

## New Layout
Stack the cards: **Journey full-width on top**, **Tasks + Prep side-by-side below** in a 2-column grid.

```text
┌─────────────────────────────┐
│  Journey  (full width)      │
│  Screening...   Feb 16      │
│  ●●●●●●●●○○○○              │
└─────────────────────────────┘
┌──────────────┐┌─────────────┐
│  Tasks       ││  Prep       │
│  ⟳41%  19    ││  85% ready  │
│  remaining   ││  ████░ bar  │
│  19 req left ││  22/26      │
└──────────────┘└─────────────┘
```

On `sm:` (640px+), revert to the original 3-column layout so wider screens still get the compact row.

## Changes

### `src/components/roadmap/RoadmapSummaryCards.tsx`

1. **Container** (line 126): Change from `grid grid-cols-3` to `grid grid-cols-2 sm:grid-cols-3` — 2 columns on mobile, 3 on sm+.

2. **Journey card** (line 130-148): Add `col-span-2 sm:col-span-1` so Journey spans the full width on mobile but takes one column on sm+.

3. **Tasks card content** (line 87-100): Reduce ProgressRing size from 44→36 and gap from 3→2 on the inner flex to give text more room. Also add `min-w-0` on the text wrapper to allow truncation.

4. **Padding** (line 135): Tighten card padding from `p-4` to `p-3 sm:p-4` for mobile breathing room.




# Redesign Roadmap Page: Homepage Journey UI + No Sidebar

## Summary
Replace the roadmap's timeline-based Journey with the homepage-style journey UI (segmented control + date pills + session detail card), remove the sidebar completely, and clean up the layout for a focused, user-friendly experience.

## What Changes

### 1. Replace RoadmapJourney with Homepage-Style Journey
The current `RoadmapJourney` component (vertical timeline with cards and nodes) gets replaced. The `/roadmap` index route will instead render the same UI pattern used in `HomeJourneySection` -- the segmented control toggle ("Online Sessions" / "Goa Bootcamp"), date pills, and session detail card.

A new `RoadmapJourneyHome.tsx` component will be created that reuses the same logic from `HomeJourneySection` but adapted for the roadmap context (no section header since the Hero handles that, full-width layout).

### 2. Remove the Sidebar
- Remove `RoadmapSidebar` from `RoadmapLayout`
- Remove `FloatingHighlightsButton` (mobile sheet for sidebar content)
- The layout becomes single-column, full-width (no `lg:block w-60` sidebar div)

### 3. Keep Everything Else
- Hero section stays (cohort name + countdown/status badge)
- Tab navigation stays (Journey, Tasks, Prep, Equipment, Rules, Gallery, Films)
- Tasks, Prep, Rules, Equipment, Gallery, Films pages remain unchanged

### 4. Clean Up
- Delete the old `RoadmapJourney.tsx` page
- Remove unused imports from `RoadmapLayout`
- Update the roadmap pages index export

## Files Modified

| File | Change |
|------|--------|
| `src/pages/roadmap/RoadmapJourneyHome.tsx` | **New** -- Homepage-style journey with segmented control, date pills, session detail card (adapted from HomeJourneySection) |
| `src/components/roadmap/RoadmapLayout.tsx` | Remove sidebar div, FloatingHighlightsButton, RoadmapSidebar import; single-column layout |
| `src/pages/roadmap/RoadmapJourney.tsx` | Replace with new homepage-style journey (or redirect to new component) |
| `src/pages/roadmap/index.ts` | Update export if component name changes |
| `src/App.tsx` | No route changes needed (index route stays the same) |

## Technical Details

### New RoadmapJourney Component
Reuses the exact same logic from `HomeJourneySection`:
- `activeTab` state for online/bootcamp toggle
- `DatePillSelector` for day selection
- `SessionDetailCard` for selected day details
- `DayDetailModal` for expanded view
- Cohort-aware toggle visibility (hidden for Writers)
- Auto-selects current day on load

The key difference from the homepage version: no section header (the Hero already provides context), and it occupies the full content area.

### Layout Change
Current layout:
```text
[Hero]
[Tabs]
[Content (flex-1)] [Sidebar (w-60)]
```

New layout:
```text
[Hero]
[Tabs]
[Content (full width)]
```

The `container` class and existing padding handle max-width constraints.


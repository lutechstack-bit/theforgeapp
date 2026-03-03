

# Add Roadmap Summary Cards to Homepage Journey Section

## What
Place the existing Journey / Tasks / Prep summary cards inside `HomeJourneySection`, positioned between the section header and the Online/Bootcamp toggle. Clicking each card navigates to its respective roadmap sub-page (`/roadmap`, `/roadmap/tasks`, `/roadmap/prep`).

## How

### Edit: `src/components/home/HomeJourneySection.tsx`
- Import `RoadmapSummaryCards` from `@/components/roadmap/RoadmapSummaryCards`
- Insert `<RoadmapSummaryCards />` after the header block (after line 229) and before the segmented control toggle (line 232)
- This reuses the exact same component already used on the Roadmap page — no duplication, same data hooks, same styling

That's it — one import, one line of JSX. The `RoadmapSummaryCards` component already handles all data fetching, responsive grid layout (Journey spans full width on mobile, Tasks + Prep side-by-side), navigation on click, and the amber-bordered card styling matching the uploaded reference.


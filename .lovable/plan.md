

# Mobile Responsiveness Fixes — Home Page

All issues identified from 320px and 375px viewport testing.

---

## Issues & Fixes

### 1. `src/pages/Home.tsx` — Section spacing too generous on small screens
- Line 152: Change `space-y-8 sm:space-y-10` → `space-y-6 sm:space-y-8`

### 2. `src/components/home/CompactCountdownTimer.tsx` — City column too narrow on 320px
- Line 69: Change `w-16` → `w-20` so "The Forge" and city names don't wrap awkwardly
- Line 75: Add `truncate` to city name span to prevent overflow

### 3. `src/components/home/DatePillSelector.tsx` — Edge pills clip against container
- Line 48: Add `px-1` to scroll container so first/last pills aren't flush against edges

### 4. `src/components/home/HomeJourneySection.tsx` — Segmented control buttons can wrap on 320px
- Lines 231-251: Add `flex-wrap` to the segmented control container and make buttons `flex-1 min-w-0 text-center` so they share equal width instead of overflowing

### 5. `src/components/home/AlumniShowcaseSection.tsx` — Film cards too wide for 320px
- Line 75: Change `w-[260px] sm:w-[300px]` → `w-[220px] sm:w-[280px]`
- Add `snap-x snap-mandatory` to scroll container, `snap-start` to each card

### 6. `src/components/home/SessionDetailCard.tsx` — Inner padding too generous on mobile
- Line 37: Change `p-5 sm:p-6` → `p-4 sm:p-6`

### 7. `src/components/home/HomeErrorState.tsx` — Padding too generous on mobile
- Line 32: Change `p-6` → `p-4 sm:p-6`

### 8. `src/components/home/BatchmatesSection.tsx` — Skeleton loading shows 5 items that overflow on 320px
- Line 57: Change skeleton count from 5 → 4
- Add `snap-x` to the avatar scroll container (line 77)

### 9. `src/components/home/TravelStaySection.tsx` — Image carousel takes too much vertical space on mobile
- Line 108: Change `aspect-[4/3]` → `aspect-[16/10] sm:aspect-[4/3]`

---

## Summary
9 targeted fixes across 8 files. All changes are CSS/className-only — no logic changes.


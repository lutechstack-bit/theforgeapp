

## Summary

Two changes requested:
1. **Logo navigation** — Already works correctly. Both `SideNav.tsx` and `TopBar.tsx` have `Link to="/"` that navigates to Home from any page. No changes needed.
2. **Remove the "0/7 days" progress bar** — Remove the confusing/inaccurate days progress indicator from the Roadmap, applying to all three cohorts (Filmmakers, Writers, Creators).

---

## Analysis: Logo Navigation

The logo already navigates to Home from any page:

| File | Line | Current Implementation |
|------|------|------------------------|
| `SideNav.tsx` | 110 | `<Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>` |
| `TopBar.tsx` | 30 | `<Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>` |

**Result:** No changes needed — this already works as expected.

---

## Analysis: Days Progress Bar

The "X/Y days" progress indicator appears in **two components**:

### 1. RoadmapHero.tsx (lines 71-121)
Currently shows:
- A progress ring (SVG circle) with percentage
- Text: `{completedCount} / {totalCount}` days complete
- Mobile progress bar with `{completedCount}/{totalCount} days`

### 2. JourneyStats.tsx (lines 150-167)
Currently shows:
- Text: `{completedCount}/{totalCount}`
- A small `<Progress>` bar (16 wide on desktop)

---

## Implementation Plan

### File 1: `src/components/roadmap/RoadmapHero.tsx`

**Remove:** The entire "Right side - Progress Ring" section (lines 71-111) and the mobile progress bar (lines 114-121).

**Keep:** The left side status & title section which shows:
- Mode badge (e.g., "X days until Forge", "FORGE IS LIVE", "FORGE COMPLETE")
- Cohort-specific headline and subtitle

The hero will become a clean header showing only the status and title without the confusing days counter.

### File 2: `src/components/roadmap/JourneyStats.tsx`

**Remove:** The "Progress" section (lines 150-167) which shows the `{completedCount}/{totalCount}` text and the small progress bar.

**Keep:**
- Status badge (PRE_FORGE / DURING_FORGE / POST_FORGE)
- Cohort name and label
- Countdown timer (for PRE_FORGE and DURING_FORGE modes)
- Mobile cohort name display

### File 3: `src/components/roadmap/RoadmapLayout.tsx`

**Update:** Remove the `completedCount` and `totalCount` props being passed to `RoadmapHero` since they're no longer needed.

### File 4: `src/components/roadmap/JourneyStats.tsx` (interface)

**Update:** Remove `completedCount` and `totalCount` from the props interface since they're no longer used.

### File 5: `src/pages/roadmap/RoadmapJourney.tsx`

**Update:** Remove `completedCount` and `totalCount` props being passed to `JourneyStats`.

---

## Technical Details

### RoadmapHero.tsx Changes

**Before (lines 6-12 interface):**
```tsx
interface RoadmapHeroProps {
  cohortName: string;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
  completedCount: number;
  totalCount: number;
}
```

**After:**
```tsx
interface RoadmapHeroProps {
  cohortName: string;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
}
```

**Remove lines 20-22** (progressPercent calculation and unused props).

**Remove lines 71-121** (entire progress ring section + mobile progress bar).

### JourneyStats.tsx Changes

**Before (interface lines 8-18):**
```tsx
interface JourneyStatsProps {
  cohortName: string;
  cohortType: CohortType;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
  forgeEndDate?: Date | null;
  completedCount: number;
  totalCount: number;
  currentDayNumber: number;
  nextDayDate?: Date | null;
}
```

**After:**
```tsx
interface JourneyStatsProps {
  cohortName: string;
  cohortType: CohortType;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
  forgeEndDate?: Date | null;
  currentDayNumber: number;
  nextDayDate?: Date | null;
}
```

**Remove line 33** (progressPercent calculation).

**Remove lines 147-167** (separator + progress section).

---

## Affected Cohorts

These changes apply universally to all three cohorts:
- **FORGE** (Filmmakers)
- **FORGE_WRITING** (Writers)
- **FORGE_CREATORS** (Creators)

The components already use `cohortType` and `cohortName` props dynamically, so removing the progress display will work consistently across all cohorts.

---

## Files Changed

1. `src/components/roadmap/RoadmapHero.tsx` — Remove progress ring and mobile progress bar
2. `src/components/roadmap/JourneyStats.tsx` — Remove progress count and bar
3. `src/components/roadmap/RoadmapLayout.tsx` — Remove unused props from RoadmapHero
4. `src/pages/roadmap/RoadmapJourney.tsx` — Remove unused props from JourneyStats




# Fix Learn Page Card Layout Issues

## Issues Identified

1. **AllCourses filter tabs**: "Community Sessions" button text is clipped at the edge — needs scroll padding so the last button is fully visible
2. **AllCourses cards**: All cards forced to `cardLayout="landscape"` (16:10), but community session thumbnails are portrait (4:5) — cards appear cropped. Need to detect section and use appropriate layout, showing full-size stacked cards
3. **Learn page Community Sessions**: Two cards peek on mobile but second is partially hidden. User wants exactly **one card** visible at a time on mobile
4. **Learn page Masterclasses**: User wants exactly **two equal-sized cards** side by side without overflow

## Changes

### 1. `src/pages/AllCourses.tsx`

**Filter tabs (line 72)**: Add right padding so the last button isn't clipped:
```
"px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide"
→ "px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide pr-6"
```

**Cards (line 111-123)**: Change from fixed `cardLayout="landscape"` to dynamic — use single-column full-width cards for `community_sessions` (portrait thumbnails) and keep landscape grid for `bfp_sessions`:
- For community sessions: `grid-cols-1` with no forced landscape, letting cards render full-width portrait-style
- For pre-forge / all: keep current `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` landscape grid

### 2. `src/components/learn/LevelUpCourseCard.tsx` (line 10)

Change fixed width from `w-[260px] sm:w-[280px]` to `w-[calc(100vw-48px)] sm:w-[280px]` so exactly one card fills the mobile viewport with proper margins, preventing the second card from peeking.

### 3. `src/components/learn/MasterclassCard.tsx` (line 22)

Change fixed width from `w-[200px] sm:w-[220px]` to `w-[calc(50vw-32px)] sm:w-[220px]` so exactly two cards fit side-by-side on mobile with proper gaps, preventing overflow or hiding.


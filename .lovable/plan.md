

# Fix AllCourses Card Width and Filter Tab Overflow

## Issues
1. **Portrait cards have fixed width** (`w-[180px]`) — in a grid layout they don't expand to fill the column, leaving large empty space on the right
2. **"Community Sessions" filter button** is clipped because the scroll container doesn't have enough end-padding

## Changes

### `src/components/learn/LearnCourseCard.tsx` (line 67)
When used inside a grid (like AllCourses), the fixed `w-[180px]` prevents the card from filling its grid cell. Add `w-full` as an additional class option, but since this card is also used in horizontal carousels where fixed width is needed, the fix is to make the portrait wrapper use `w-full` when it's not in a carousel context. The simplest approach: remove the fixed width from the outer div and replace with `w-full` — the grid parent already constrains the width. For carousel usage, the parent `ScrollableCardRow` handles sizing.

**Change line 67**: Remove `w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] flex-shrink-0` → `w-full`

**But** this would break carousel usage. So instead, add a new prop `fullWidth` to toggle between fixed and fluid width.

Actually, simpler: In `AllCourses.tsx`, the cards are in a grid — the grid cell constrains them. The issue is the fixed `w-[180px]` overrides the grid. Best fix: remove the fixed width classes when inside a grid by making it conditional, or just override in AllCourses with a wrapper.

**Simplest fix**: Change the portrait card's outer div to not set a fixed width — use `w-full` instead. For carousel contexts where fixed width is needed, the carousel parent's flex + gap handles sizing anyway through `flex-shrink-0` and snap points.

### Plan

1. **`src/components/learn/LearnCourseCard.tsx` line 67**: Change `w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] flex-shrink-0` to `w-full flex-shrink-0` — cards will fill their parent container (grid cell or carousel slot)

2. **`src/pages/AllCourses.tsx` line 72**: Increase right padding from `pr-6` to `pr-8` to ensure the last filter button ("Community Sessions") is fully visible when scrolled

3. **`src/pages/AllCourses.tsx` line 114**: Remove `max-w-md` constraint from community_sessions grid — let cards fill the full width of the screen


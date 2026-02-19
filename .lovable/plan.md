

# Pre Forge Sessions: 3x2 Grid with "View All"

## What Changes

Replace the horizontal scrolling carousel for "Pre Forge Sessions" with a **3-column, 2-row grid** (6 cards visible). The remaining cards are hidden until the user clicks "View All", which navigates to the existing `/learn/all?section=bfp_sessions` page.

## Layout

- **Desktop**: 3 columns x 2 rows = 6 cards visible
- **Tablet**: 2 columns x 3 rows = 6 cards visible
- **Mobile**: 2 columns x 3 rows = 6 cards visible
- Cards resize to fill available width (no fixed pixel widths; use `w-full` within grid cells)
- Aspect ratio stays at 16:10 for landscape cards
- "View All" button always shows if there are more than 6 items

## Technical Changes

### 1. `src/pages/Learn.tsx` -- Update `CourseCarouselSection`

Add an optional `gridLayout` prop (e.g., `gridLayout?: boolean`). When `true`:
- Render items in a CSS grid (`grid grid-cols-2 md:grid-cols-3 gap-3`) instead of `ScrollableCardRow`
- Slice items to show only the first 6
- Always show "View All" button when total items exceed 6

Pass `gridLayout={true}` for the Pre Forge Sessions section.

### 2. `src/components/learn/LearnCourseCard.tsx` -- Make landscape cards responsive

Remove fixed width (`w-[320px] sm:w-[360px]`) from the landscape variant's outer div and replace with `w-full` so the card fills its grid cell.

## Files Modified

| File | Change |
|------|--------|
| `src/pages/Learn.tsx` | Add `gridLayout` prop to `CourseCarouselSection`; pass it for bfp_sessions; render grid instead of carousel when enabled; slice to 6 items |
| `src/components/learn/LearnCourseCard.tsx` | Change landscape card width from fixed to `w-full` |


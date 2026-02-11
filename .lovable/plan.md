

# Fix Overflow Issue on Learn Page

## Problem

The outer content wrapper on the Learn page has `max-w-full overflow-hidden` which conflicts with the `-mx-4 px-4` negative-margin scroll trick used by the carousel sections. This causes the horizontal scroll containers to get clipped incorrectly, cutting off cards at the edges and potentially causing layout shifts on wider screens.

## Solution

1. Remove `overflow-hidden` from the outer wrapper div -- it's unnecessary since each scroll container already manages its own overflow independently.
2. Add `overflow-x-clip` on the outermost page div instead, which prevents horizontal page-level scrollbar without interfering with child scroll containers.
3. Cap card widths on larger screens so they don't grow disproportionately large.

## Technical Details

### `src/pages/Learn.tsx`
- Line 115: Change outer div to `overflow-x-clip` to prevent page-level horizontal overflow
- Line 116: Remove `max-w-full overflow-hidden` from the content wrapper -- let the scroll containers handle their own overflow
- The `-mx-4 px-4` trick on scroll containers will now work correctly without being clipped by the parent

### `src/components/learn/LearnCourseCard.tsx`
- Line 49: Adjust card width classes to prevent overly large cards on wider viewports -- cap at `lg:w-[240px]` max

| File | Action |
|------|--------|
| `src/pages/Learn.tsx` | UPDATE -- Remove conflicting overflow-hidden from wrapper |
| `src/components/learn/LearnCourseCard.tsx` | UPDATE -- Cap card width on large screens |


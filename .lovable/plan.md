

# Switch All Courses Grid to Landscape Cards

## Problem
The "All Courses" page renders cards in portrait (3:4) aspect ratio, which looks oversized and wastes space. The Pre Forge Sessions cards on the Learn page already use a landscape layout -- the same should apply here.

## Change

### `src/pages/AllCourses.tsx`
- Pass `cardLayout="landscape"` to each `LearnCourseCard` in the grid
- Change the grid from `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (landscape cards need more width)
- Update the skeleton placeholders to use `aspect-[16/10]` instead of `aspect-[3/4]`

Only one file is modified.


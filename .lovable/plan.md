

# Fix CourseDetail Bottom Padding for Bottom Nav

## Problem
The CourseDetail page content gets hidden behind the persistent bottom navigation bar on mobile because the main content container lacks bottom padding (`pb-24`), which is the standard used across other pages.

## Change

### `src/pages/CourseDetail.tsx` (line 277)
Change the main content container from `container py-4` to `container py-4 pb-24` to add sufficient bottom clearance for the bottom nav bar on mobile.


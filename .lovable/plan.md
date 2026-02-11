

# Remove Card Metadata & Upgrade Scroll Experience

## What Changes

1. **Remove metadata sections below course cards** -- The category label (SESSION/WORKSHOP), title, and instructor name shown below thumbnails will be removed. The card becomes a clean thumbnail-only design.

2. **Replace arrow navigation with premium scroll** -- Remove the `CarouselPrevious`/`CarouselNext` arrow buttons. Instead, use native touch/drag scrolling with subtle fade edges on left/right to hint at more content. This feels more natural on mobile and cleaner on desktop.

3. **Fix sizing/padding** -- Ensure consistent card sizing with no overflow or spacing issues.

## Technical Details

### 1. `src/components/learn/LearnCourseCard.tsx`
- Remove the entire metadata `div` below the thumbnail (lines 78-99: category, title, instructor, company)
- The card becomes just the thumbnail image with duration badge
- Adjust card width to be slightly wider since there's no text below

### 2. `src/pages/Learn.tsx`
- Remove `CarouselPrevious` and `CarouselNext` from **both** `CourseCarouselSection` and the Masterclass section
- Replace `Carousel`/`CarouselContent` with a simple native horizontal scroll container that has:
  - `overflow-x-auto scrollbar-hide` for smooth drag scrolling
  - CSS `scroll-snap-type: x mandatory` for snappy card alignment
  - Fade gradient overlays on edges to indicate scrollability
- Clean up unused imports (`CarouselPrevious`, `CarouselNext`, etc.)

### 3. `src/components/learn/UpcomingSessionsSection.tsx`
- Same treatment: remove `CarouselPrevious`/`CarouselNext` arrows
- Switch to native scroll container with snap and fade edges

## Files Summary

| File | Action |
|------|--------|
| `src/components/learn/LearnCourseCard.tsx` | UPDATE -- Remove metadata section below thumbnail |
| `src/pages/Learn.tsx` | UPDATE -- Replace carousel arrows with native premium scroll |
| `src/components/learn/UpcomingSessionsSection.tsx` | UPDATE -- Replace carousel arrows with native premium scroll |


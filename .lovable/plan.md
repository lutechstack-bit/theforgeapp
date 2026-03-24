

# Add Venue Detail Popup with Autoplay Carousel

## What
When clicking "Details" on the Your Venue card, open a fullscreen dialog with an autoplay image carousel and a Google Maps CTA button — instead of navigating to `/roadmap`.

## Changes — `src/components/home/TravelStaySection.tsx`

1. **Add state**: `showDetail` boolean to control dialog open/close
2. **Change "Details" button**: Instead of `navigate('/roadmap')`, set `showDetail = true`
3. **Add Dialog** with:
   - Dark background (`bg-black/95 border-none`)
   - Full-width autoplay carousel using `useEffect` + `setInterval` (3s per slide) cycling through `allImages`
   - Pause autoplay on hover
   - Image counter ("2 / 5") overlay
   - Location name + address below the carousel
   - Large "Open in Maps" CTA button at the bottom
4. **Autoplay logic**: `useEffect` with interval that advances `modalImageIdx`, clears on unmount or when dialog closes

### No new files or dependencies needed
Uses existing `Dialog`/`DialogContent` from the UI library. Manual autoplay via `setInterval` — no need for Embla carousel.


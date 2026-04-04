

# Fix: Full-Screen Zoom Meeting Experience

## Problem
From the screenshot, the Zoom SDK renders its video in a constrained box (~1040px wide) with black dead space on the right. The SDK's internal elements aren't stretching to fill the viewport. Additionally, there's no scrolling possible and the Zoom toolbar may be cut off at the bottom.

Root causes:
1. **Init sizing uses container rect, but container is `w-0 h-0` at init time** — so `getBoundingClientRect()` returns 0/0 and the fallback minimum (900x600) is used, which is smaller than the viewport
2. **No CSS overrides** for Zoom SDK's internal elements — the SDK creates its own DOM nodes with hardcoded sizes that don't respect the parent container
3. **Missing height constraint** — the zoom container uses `mt-[57px]` but no explicit `h-[calc(100vh-57px)]` to fill remaining space

## Changes — `src/pages/LiveSession.tsx`

### 1. Fix init sizing — use `window.innerWidth/Height` instead of container rect
Since the container is hidden (`w-0 h-0`) when `handleJoinZoom` runs, use viewport dimensions directly:
```typescript
const width = window.innerWidth;
const height = window.innerHeight - 57; // subtract header
```

### 2. Add CSS overrides for Zoom SDK internals
Inject a `<style>` tag when meeting is active to force Zoom's internal elements to fill the container:
```css
#zoom-meeting-container [class*="meeting-client"] { width: 100% !important; height: 100% !important; }
#zoom-meeting-container iframe { width: 100% !important; height: 100% !important; }
```

### 3. Fix container dimensions when active
Change from `mt-[57px]` to explicit positioning:
```
fixed top-[57px] left-0 right-0 bottom-0 z-[51]
```
This ensures it fills exactly the remaining viewport below the header.

### 4. ResizeObserver — use window dimensions
Update the resize handler to pass full available dimensions.

### 5. Mobile — keep existing behavior
Mobile already opens native Zoom app, no changes needed there.

## Technical Details
- The Zoom Meeting SDK "Component View" creates internal `<div>` elements with inline `width`/`height` styles — CSS `!important` overrides are the standard approach to make it fill a parent
- The header bar stays at 57px; zoom fills `calc(100vh - 57px)` below it
- `z-[51]` on the container ensures it layers above the `z-50` header overlay properly


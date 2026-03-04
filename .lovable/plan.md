

# Fix: Profile Avatar Overlapping Page Headings

## Problem
The `TopProfileDropdown` uses `fixed top-4 right-4 z-50`, causing it to float over page content and collide with headings. The third reference image shows it should sit in a dedicated top strip/bar area that pages reserve space for.

## Solution
Instead of a floating `fixed` position, embed the profile dropdown into a **static top bar row** within the `AppLayout`. Each page's content will naturally flow below it. This avoids overlap on every page without touching individual page files.

### `src/components/layout/AppLayout.tsx`
- Add a top bar row inside `<main>` that contains the `TopProfileDropdown` aligned right
- This bar has a fixed height (~`h-14`) and acts as a reserved strip at the top of the content area
- The profile dropdown becomes `relative` positioned within this bar, not `fixed`

### `src/components/layout/TopProfileDropdown.tsx`
- Remove `fixed top-4 right-4 z-50` positioning
- Make it a simple flex-end aligned element (the parent bar handles placement)
- Keep the dropdown menu, avatar, and all existing functionality

### Result
- Every page automatically gets the spacing because the bar is in the shared layout
- No per-page padding hacks needed
- Profile icon never overlaps headings
- Works on all viewports (mobile, tablet, desktop)

## Files
| Action | File |
|--------|------|
| Edit | `src/components/layout/TopProfileDropdown.tsx` — remove fixed positioning |
| Edit | `src/components/layout/AppLayout.tsx` — add top bar row containing the dropdown |


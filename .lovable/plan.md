

# Fix Profile Button Visibility

## Problem
The profile dropdown button uses `bg-white/10` (nearly transparent) which makes it invisible against hero images on the homepage and hard to see elsewhere. Also, on the homepage it uses `absolute` positioning so it disappears on scroll.

## Changes

### 1. `src/components/layout/TopProfileDropdown.tsx`
- Change button background from `bg-white/10` to `bg-black/40 backdrop-blur-md` so it's always clearly visible against any background (dark or light images, solid backgrounds).
- Change text colors to `text-white` so they contrast against the dark backdrop.

### 2. `src/components/layout/AppLayout.tsx`
- On the home route: change from `absolute` to `sticky top-0` with a scroll-based background transition.
- Add a scroll listener: when scrolled > 50px, apply `bg-background`; otherwise keep transparent.
- This keeps the profile button always accessible as users scroll.

| File | Change |
|------|--------|
| `TopProfileDropdown.tsx` | `bg-white/10` → `bg-black/40 backdrop-blur-md`, white text |
| `AppLayout.tsx` | `absolute` → `sticky` with scroll-based transparent-to-solid transition |


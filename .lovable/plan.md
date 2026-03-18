

# Floating Profile Button on Home — No Top Bar

## Problem
The sticky top bar on the Home page creates a visible strip that blocks the carousel from reaching the top. The user wants: no bar at all on Home — just the profile button floating over the carousel. When scrolled past the hero, the full top bar should appear.

## Changes

### `src/components/layout/AppLayout.tsx`
- On the Home route (`/`), **don't render the top bar div at all** when not scrolled. Instead, render the `TopProfileDropdown` as an **absolutely positioned element** in the top-right corner (inside `<main>`), outside any bar container.
- When scrolled past 50px, switch to the normal sticky top bar with `bg-background`.
- This eliminates the invisible `h-14` bar that pushes the carousel down.

**Logic:**
```
if (isHome && !isScrolled):
  → render TopProfileDropdown as absolute, top-right, no bar wrapper
else:
  → render normal sticky top bar with bg-background
```

### `src/components/layout/TopProfileDropdown.tsx`
- No changes needed — already has `bg-black/40 backdrop-blur-md` styling which works well floating over images.

### `src/pages/Home.tsx`
- Add negative top margin (`-mt-14`) on the `HeroBanner` wrapper to pull it up behind where the top bar would be, OR better: since the bar won't render on home when not scrolled, the carousel will naturally sit at the top.

| File | Change |
|------|--------|
| `AppLayout.tsx` | Conditionally render floating profile (absolute) vs sticky bar based on home + scroll state |


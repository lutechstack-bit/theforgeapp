

# Fix: Make Profile Tab Button Visible

## Problem
The profile tab button exists in the code and renders in the sticky header, but it's nearly invisible because:
- `bg-white/5` is almost fully transparent (5% opacity)
- `border-primary/60` is a semi-transparent gold border that blends into the dark background
- The text colors are too subtle against the dark theme

## Solution
Increase the visibility by using stronger background, border, and ensuring the button stands out clearly against the dark background.

## Changes

### `src/components/layout/TopProfileDropdown.tsx`
- Change `bg-white/5` to `bg-white/10` for a more visible background
- Change `border-primary/60` to `border-primary` for a fully opaque gold border
- Add a subtle default shadow so the button is noticeable even without hover: `shadow-[0_0_8px_hsl(var(--primary)/0.3)]`
- Keep the hover glow enhancement as-is

This will make the tab button clearly visible as a gold-outlined rectangular button in the top-right corner.

| File | Change |
|------|--------|
| `src/components/layout/TopProfileDropdown.tsx` | Increase border + background opacity for visibility |




# Perks Page: Responsive Grid Layout

## Problem
Cards are stacked full-width vertically, making them oversized with no breathing room. The GrowthX reference shows a responsive multi-column grid with consistent card sizing.

## Changes

### `src/pages/Perks.tsx`
- Replace `space-y-3` vertical stack with a responsive CSS grid:
  - Mobile (< 640px): 1 column
  - Tablet (640px+): 2 columns
  - Desktop (1024px+): 3 columns
- Add `gap-4` for consistent spacing between cards
- Update skeleton loading to match the grid layout

### `src/components/perks/PerkCard.tsx`
- For the banner image mode: constrain the card with a fixed aspect ratio (`aspect-[16/10]`) so all cards are uniform height in the grid, using `object-cover` on the image
- Ensure the card fills its grid cell (`w-full h-full`)
- For the text fallback mode: add a min-height to keep cards consistent

## Files
| Action | File |
|--------|------|
| Edit | `src/pages/Perks.tsx` — grid layout |
| Edit | `src/components/perks/PerkCard.tsx` — constrained aspect ratio for grid |


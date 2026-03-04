

# Perks Page: Full-Image Banner Cards

## Overview
Replace the current text-based `PerkCard` blocks with full-image banner cards that display the `banner_url` image at its natural aspect ratio, with no overlay text. The uploaded images (Sony, Digitek, Sandcastles) are reference for the visual style — they will be set as `banner_url` values in the database by the admin, not hardcoded.

## Changes

### `src/components/perks/PerkCard.tsx`
- Redesign the card to be image-first: when `bannerUrl` is provided, render a full-width rounded image card with no text overlay
- The image fills the card at its natural aspect ratio (roughly 16:9 based on the uploaded samples)
- Keep the clickable behavior (navigate to `/perks/{id}`)
- Keep "Coming Soon" badge overlay in the corner if applicable
- Fallback to the current text layout when no `bannerUrl` is present
- Add `bannerUrl` to the component props

### `src/pages/Perks.tsx`
- Pass `bannerUrl={perk.banner_url}` to `PerkCard`
- Change the grid layout from `space-y-3` to a responsive grid or keep vertical stack with appropriate spacing for the larger banner cards

### Visual Details
- Cards: `rounded-2xl overflow-hidden` with subtle border
- Hover: slight scale + shadow, matching the amber glow style used elsewhere
- No text overlays on the image — the banner image itself contains the branding
- Aspect ratio driven by the image itself (using `w-full` with auto height)

## Files
| Action | File |
|--------|------|
| Edit | `src/components/perks/PerkCard.tsx` — add banner image mode |
| Edit | `src/pages/Perks.tsx` — pass `bannerUrl`, adjust layout |


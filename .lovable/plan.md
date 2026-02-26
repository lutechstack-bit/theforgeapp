

# Replace Cinematography Masterclass Banner with Creator Academy Image

## What Changes

The third program banner ("Cinematography Masterclass") currently uses a gradient-only fallback layout. It will be replaced with the uploaded "LevelUp Creator Academy" banner image, using the same image-only mode already used by the first two banners.

## Steps

1. Copy `banner4.jpg` to `public/images/programs/creator-academy.png`
2. Update the third `ProgramBanner` in `src/pages/Learn.tsx` (lines 247-252) to use `imageUrl` prop instead of the gradient fallback

## Files Changed

| File | Change |
|---|---|
| `public/images/programs/creator-academy.png` | New asset (copied from uploaded banner4.jpg) |
| `src/pages/Learn.tsx` (lines 247-252) | Add `imageUrl="/images/programs/creator-academy.png"` to the third ProgramBanner, which switches it to the clickable image-only mode (gradient and text are ignored when `imageUrl` is set) |

## Technical Detail

The `ProgramBanner` component already has an image-only code path: when `imageUrl` is provided, it renders a pure `<img>` wrapped in an `<a>` tag with a fixed `1280:465` aspect ratio. The title/description/gradient props become unused. This is the same pattern used by the Breakthrough Filmmaking and Video Editing Academy banners above it.


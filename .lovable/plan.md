

# Replace Video Editing Academy Banner with Uploaded Image

## What Changes

1. Copy the uploaded image (`image-427.png`) to `public/images/programs/video-editing-academy.png`
2. Update `src/pages/Learn.tsx` (line 240-244): Add `imageUrl="/images/programs/video-editing-academy.png"` to the second `ProgramBanner` (Video Editing Academy), exactly as was done for Breakthrough Filmmaking

## Files Changed

| File | Change |
|---|---|
| `public/images/programs/video-editing-academy.png` | New asset copied from upload |
| `src/pages/Learn.tsx` (line 240) | Add `imageUrl` prop to the Video Editing Academy `ProgramBanner` |

The banner will render as a clickable image link with `aspect-[1280/465]`, matching the Breakthrough Filmmaking banner above it. The gradient background, text overlay, and CTA button will be hidden automatically by the existing `imageUrl` logic in `ProgramBanner.tsx`.


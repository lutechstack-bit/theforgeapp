

# Replace Breakthrough Filmmaking Banner with Uploaded Image

## What Changes

1. **Copy the uploaded image** (`image-426.png`) to `public/images/programs/breakthrough-filmmaking.png`
2. **Update `Learn.tsx`** (line 233-238): Pass the `imageUrl` prop to the first `ProgramBanner` pointing to the copied image
3. **Update `ProgramBanner.tsx`**: When `imageUrl` is provided, use a fixed aspect ratio of 1280:465 (approximately 2.75:1) instead of the `min-h-[220px]` approach, so the banner renders at the exact proportions of the uploaded image. Remove the text overlay (label, title, description) and CTA button when `imageUrl` is set, since the image already contains the branding text. The banner becomes a clickable image link.

## Technical Details

### ProgramBanner.tsx
- When `imageUrl` is provided: render a simple clickable `<a>` wrapper with `aspect-[1280/465]` containing the image filling the container via `object-cover`, rounded corners preserved. No text overlay, no gradient, no button.
- When `imageUrl` is not provided: keep the existing gradient + text + CTA layout unchanged (for the other two banners).

### Learn.tsx (line 233-238)
```tsx
<ProgramBanner
  title="Breakthrough Filmmaking"
  description="..."
  ctaUrl="https://www.leveluplearning.in/"
  gradient="..."
  imageUrl="/images/programs/breakthrough-filmmaking.png"
/>
```

Only two files are modified, plus one image file copied.




# Fix Community Session Thumbnail Fitting in Course Detail

## Problem

Community session cards use portrait (4:5) thumbnails, but the course detail page forces them into a 16:9 `aspect-video` container with `object-cover`. This crops the image heavily, hiding the poster artwork.

## Solution

Change `object-cover` to `object-contain` on the thumbnail `<img>` in `CourseDetail.tsx`. The parent container already has `bg-black`, so the empty space on left/right will be solid black — clean and finished.

## Files Changed

| File | Change |
|---|---|
| `src/pages/CourseDetail.tsx` (line 299) | Change `object-cover` → `object-contain` on the thumbnail image |

## Technical Detail

Line 299 currently:
```tsx
className="w-full h-full object-cover"
```
Changes to:
```tsx
className="w-full h-full object-contain"
```

The parent `div` (line 283) already has `bg-black`, so the letterbox bars will be solid black with no extra work needed.


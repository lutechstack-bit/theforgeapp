

# Fix Event Card Images - Uniform Size + No Cropping

## Problem

The current `SimpleEventCard` uses:
- Fixed `aspect-[3/4]` ratio (uniform size ✓)
- `object-cover` which **crops** images to fill the container (cropping ✗)

## Solution

Use `object-contain` instead of `object-cover` to display the **full poster** within uniform card dimensions. Add a subtle background so the poster looks premium against the dark theme.

---

## File: `src/components/shared/SimpleEventCard.tsx`

### Changes

| Property | Before | After |
|----------|--------|-------|
| Image fit | `object-cover` (crops) | `object-contain` (full image) |
| Background | `bg-muted` | `bg-black/40` (subtle dark fill behind image) |

### Visual Result

```text
Before (cropped):          After (full poster):
┌──────────────┐           ┌──────────────┐
│ ████████████ │           │   ┌──────┐   │
│ ████CROP████ │    →      │   │ FULL │   │
│ ████████████ │           │   │POSTER│   │
│ ████████████ │           │   └──────┘   │
└──────────────┘           └──────────────┘
  (text cut off)             (all visible)
```

### Code Change

**Line 34:** Change `object-cover` to `object-contain`

```tsx
<img
  src={imageUrl}
  alt={title}
  className="w-full h-full object-contain"
/>
```

---

## Summary

A single CSS change from `object-cover` → `object-contain` ensures:
- ✅ Uniform card sizes (fixed 3:4 aspect ratio)
- ✅ Full poster visible (no cropping)
- ✅ Premium look with dark background fill




# Auto-Trim Empty Borders from Event Posters

## Problem Analysis

Looking at your screenshots, I now understand the issue:

| What's Working | What's Broken |
|----------------|---------------|
| The blurred background fill technique IS applied | The poster images themselves have **built-in padding/borders** baked into the file |
| Card sizes are uniform (3:4 aspect ratio) | This internal whitespace shows up as "dead space" even with the blur fill |

The "Learn Cinematography" poster in the first image has significant padding within the image file itself. The blur layer fills the container, but the sharp foreground poster still shows its own internal borders.

## Solution: Smart Poster Cropping

We'll add CSS techniques to **crop inward** on the foreground poster, effectively trimming the empty borders while keeping the blurred background filling the entire card.

### Approach: Scale + Clip the Foreground

Instead of showing the poster at 100% size with `object-contain`, we'll:
1. **Slightly scale up** the foreground poster to eliminate edge padding
2. **Clip the overflow** so borders are cut off
3. **Keep the blurred background** as the seamless fill behind it

```text
Current:                        After (auto-trim):
┌───────────────────┐          ┌───────────────────┐
│ ░░░░░░░░░░░░░░░░░ │          │ ░░░░░░░░░░░░░░░░░ │ 
│ ░░┌───────────┐░░ │          │ ░░░┌─────────┐░░░ │
│ ░░│  border   │░░ │   →      │ ░░░│  MAIN   │░░░ │ ← Cropped/scaled
│ ░░│   MAIN    │░░ │          │ ░░░│ CONTENT │░░░ │    to remove borders
│ ░░│  border   │░░ │          │ ░░░└─────────┘░░░ │
│ ░░└───────────┘░░ │          │ ░░░░░░░░░░░░░░░░░ │
└───────────────────┘          └───────────────────┘
  Poster internal padding        Borders trimmed away
```

---

## Files to Change

### File: `src/components/shared/SimpleEventCard.tsx`

**Change**: Update the foreground image layer to use `object-cover` with a slight scale, instead of `object-contain`. This crops the poster edges while the blurred background seamlessly fills any remaining space.

**Before:**
```tsx
{/* Layer 3: Sharp poster (full image visible) */}
<img
  src={imageUrl}
  alt={title}
  className="relative w-full h-full object-contain z-10"
/>
```

**After:**
```tsx
{/* Layer 3: Sharp poster with auto-trim (edges cropped) */}
<img
  src={imageUrl}
  alt={title}
  className="relative w-full h-full object-cover z-10"
/>
```

### Why This Works

| Layer | Purpose | Fit Mode |
|-------|---------|----------|
| Background (blurred) | Fill entire card, no dead space | `object-cover` |
| Overlay | Subtle darkening | - |
| Foreground (sharp) | Show poster content, trim borders | `object-cover` (crops edges) |

- **Uniform cards**: Still maintains 3:4 aspect ratio
- **No dead space**: Blurred background fills gaps
- **No visible internal borders**: Poster edges get cropped away
- **Smart cropping**: `object-cover` centers on the main content while trimming edges

---

## Alternative: Controlled Crop Percentage

If `object-cover` crops too aggressively for some posters, we can use a hybrid approach with a scale transform:

```tsx
{/* Layer 3: Sharp poster with 5% inward crop */}
<img
  src={imageUrl}
  alt={title}
  className="absolute inset-0 w-full h-full object-contain scale-110 z-10"
/>
```

This scales the image up by 10%, cropping approximately 5% from each edge while still prioritizing `contain` behavior (full image mostly visible).

---

## Summary

Switch the foreground poster from `object-contain` to `object-cover` so that empty borders baked into the poster images are automatically cropped away. The blurred background layer ensures no dead space appears, while the sharp foreground shows the main poster content without distracting edges.




# Seamless Event Cards - Blurred Background Fill

## The Problem

Looking at the screenshot, the issue is clear:
- **Card 1** (horizontal poster): Has empty black space at top and bottom
- **Card 2** (square poster "DECODED"): Has significant empty space
- **Card 3** (vertical poster): Fills nicely

Using `object-contain` preserves the full poster but creates **dead space** when the poster aspect ratio doesn't match the 3:4 card ratio.

## The Solution: Blurred Background Fill

Use a **dual-layer image technique**:
1. **Background layer**: Same image, blurred and scaled to cover the entire card (fills dead space)
2. **Foreground layer**: Same image, sharp and contained (shows full poster)

This is how Netflix, Spotify, and Apple Music display album art and posters with varying aspect ratios.

```text
Before:                          After (with blur fill):
┌───────────────────┐            ┌───────────────────┐
│                   │            │ ░░░░░░░░░░░░░░░░░ │ ← Blurred image (scaled to cover)
│   ┌───────────┐   │            │ ░░┌───────────┐░░ │
│   │   POSTER  │   │     →      │ ░░│   POSTER  │░░ │ ← Sharp image (contained)
│   └───────────┘   │            │ ░░└───────────┘░░ │
│                   │            │ ░░░░░░░░░░░░░░░░░ │
└───────────────────┘            └───────────────────┘
  Empty black space               Seamless premium look
```

---

## File: `src/components/shared/SimpleEventCard.tsx`

### Changes

| Layer | CSS | Purpose |
|-------|-----|---------|
| Background | `object-cover` + `blur-xl` + `scale-110` | Fills entire card, cropped but blurred |
| Foreground | `object-contain` | Full poster visible, sharp |
| Overlay | `bg-black/30` | Subtle darkening between layers |

### New Structure

```tsx
<div className="card-container aspect-[3/4] ...">
  {/* Layer 1: Blurred background (fills dead space) */}
  <img 
    src={imageUrl} 
    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60" 
  />
  
  {/* Layer 2: Subtle dark overlay */}
  <div className="absolute inset-0 bg-black/30" />
  
  {/* Layer 3: Sharp poster (full image visible) */}
  <img 
    src={imageUrl} 
    className="relative w-full h-full object-contain z-10" 
  />
</div>
```

---

## Visual Result

| Poster Type | Before | After |
|-------------|--------|-------|
| Horizontal (16:9) | Empty black bands top/bottom | Blurred fill behind, full poster visible |
| Square (1:1) | Large empty areas | Blurred extension fills gaps seamlessly |
| Vertical (3:4) | Perfect fit | Same perfect fit |

---

## Benefits

- ✅ **Uniform card sizes**: All cards maintain fixed 3:4 aspect ratio
- ✅ **No cropping**: Full poster is always visible in the foreground
- ✅ **No dead space**: Blurred background fills empty areas
- ✅ **Premium aesthetic**: Matches industry-standard streaming app design
- ✅ **Performance**: Same image cached, no extra network requests

---

## Summary

A dual-layer image approach (blurred background + sharp foreground) eliminates the dead space problem while keeping uniform card sizes and showing the complete poster - all three requirements met.


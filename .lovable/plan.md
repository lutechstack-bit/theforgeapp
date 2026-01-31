

# Optimize Loading for Mentor Photos & Alumni Testimonial Videos

## Summary
Reduce cognitive load and improve perceived performance on page load by implementing lazy loading, skeleton states, and optimized video preloading for the Mentors and Alumni Spotlight carousels on both mobile and web.

---

## Current Issues

1. **Mentor photos** load immediately without `loading="lazy"`, blocking initial render
2. **Testimonial videos** start downloading immediately via `<video src={...}>` without `preload="none"`
3. **No skeleton/loading state** - users see empty space or layout shift while images load
4. **All carousel items load at once** - even off-screen items

---

## Optimization Strategy

### 1. Lazy Load Mentor Images (`FlipMentorCard.tsx`)

Add native lazy loading and a shimmer skeleton placeholder:

```tsx
// Before: Image loads immediately
<img src={mentor.imageUrl} alt={mentor.name} className="..." />

// After: Lazy load with skeleton fallback
<img
  src={mentor.imageUrl}
  alt={mentor.name}
  loading="lazy"
  className="..."
  onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
  style={{ transition: 'opacity 0.3s ease-in' }}
/>
```

### 2. Optimize Video Preloading (`TestimonialVideoCard.tsx`)

Prevent videos from downloading until user interaction:

```tsx
// Before: Video downloads immediately
<video src={videoUrl} poster={thumbnailUrl} ... />

// After: No preload, uses poster as placeholder
<video
  src={videoUrl}
  poster={thumbnailUrl}
  preload="none"  // ← Prevents immediate download
  ...
/>
```

### 3. Add Image Loading State with Skeleton

Wrap images in a loading container that shows a premium shimmer skeleton:

```tsx
const [imageLoaded, setImageLoaded] = useState(false);

return (
  <div className="relative">
    {/* Skeleton shown while loading */}
    {!imageLoaded && (
      <div className="absolute inset-0 skeleton-premium rounded-2xl" />
    )}
    <img
      src={mentor.imageUrl}
      alt={mentor.name}
      loading="lazy"
      onLoad={() => setImageLoaded(true)}
      className={cn(
        "transition-opacity duration-300",
        imageLoaded ? "opacity-100" : "opacity-0"
      )}
    />
  </div>
);
```

### 4. Add Loading State to MentorVideoCard (if used elsewhere)

Apply the same pattern to `MentorVideoCard.tsx` for consistency.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/shared/FlipMentorCard.tsx` | Add `loading="lazy"`, skeleton state, fade-in on load |
| `src/components/shared/TestimonialVideoCard.tsx` | Add `preload="none"`, skeleton for poster, fade-in |
| `src/components/shared/MentorVideoCard.tsx` | Add `loading="lazy"`, skeleton state, fade-in on load |

---

## Technical Details

### FlipMentorCard Changes (lines 59-71)
- Add `useState` for `imageLoaded`
- Add skeleton overlay using `skeleton-premium` class (already in CSS)
- Add `loading="lazy"` and `onLoad` handler
- Add opacity transition for smooth fade-in

### TestimonialVideoCard Changes (lines 72-82)
- Add `preload="none"` to prevent auto-download
- Add skeleton state for poster image
- Optionally generate poster from first frame if no thumbnail provided

### MentorVideoCard Changes (lines 37-46)
- Same pattern as FlipMentorCard

---

## Visual Result

**Before (Page Load):**
```text
[Page Opens]
   ↓
[Empty cards / layout shift]
   ↓
[Images pop in suddenly]
   ↓
[Videos start downloading in background]
```

**After (Page Load):**
```text
[Page Opens]
   ↓
[Elegant shimmer skeletons visible]
   ↓
[Images fade in smoothly as they load]
   ↓
[Videos only download when user taps play]
```

---

## Performance Benefits

| Metric | Before | After |
|--------|--------|-------|
| Initial bandwidth | High (all images + videos) | Low (only visible images) |
| Time to Interactive | Slower | Faster |
| Perceived load time | Jarring | Smooth |
| Mobile data usage | Wasteful | Optimized |

This applies to both mobile and web views consistently.


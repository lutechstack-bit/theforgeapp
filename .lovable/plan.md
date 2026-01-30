

# Fix Fullscreen Button Visibility on Mobile

## Summary

The "full view" (fullscreen) button in the Learn section video player is not accessible on mobile devices because it only appears on hover, which doesn't work on touchscreens.

---

## Problem

| Platform | Current Behavior |
|----------|-----------------|
| **Desktop** | Fullscreen button appears on hover over video |
| **Mobile** | Button is invisible and inaccessible (no hover on touch) |

The button in `SecureVideoPlayer.tsx` uses:
```css
opacity-0 group-hover:opacity-100
```

This CSS pattern only works with mouse hover - mobile users cannot see or tap this button.

---

## Solution

Make the fullscreen button **always visible on mobile** while keeping the hover behavior on desktop.

**Updated CSS approach:**
```css
opacity-100 md:opacity-0 md:group-hover:opacity-100
```

This means:
- **Mobile (default)**: Button is always visible (`opacity-100`)
- **Desktop (md and up)**: Button appears on hover only (`opacity-0` → `opacity-100` on hover)

---

## Technical Changes

### File: `src/components/learn/SecureVideoPlayer.tsx`

**Lines 500-505 - Vimeo fullscreen button:**

```text
Before:
className="absolute bottom-4 right-4 p-2 bg-black/60 hover:bg-black/80 
           rounded-lg text-white opacity-0 group-hover:opacity-100 
           transition-opacity z-10"

After:
className="absolute bottom-4 right-4 p-2 bg-black/60 hover:bg-black/80 
           rounded-lg text-white opacity-100 md:opacity-0 
           md:group-hover:opacity-100 transition-opacity z-10"
```

This single change ensures:
- Mobile users can always see and tap the fullscreen button
- Desktop users retain the clean hover-to-reveal behavior

---

## Additional Enhancement (Optional)

To improve the mobile experience further, we can also:

1. **Add a touch-friendly tap zone**: Make the button slightly larger on mobile for easier tapping
2. **Add subtle styling on mobile**: A slight background to indicate interactivity

```tsx
className="absolute bottom-4 right-4 p-2 md:p-2 p-2.5 bg-black/50 md:bg-black/60 
           hover:bg-black/80 rounded-lg text-white 
           opacity-100 md:opacity-0 md:group-hover:opacity-100 
           transition-opacity z-10"
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/learn/SecureVideoPlayer.tsx` | Update fullscreen button class (line ~501) to include `opacity-100 md:opacity-0 md:group-hover:opacity-100` |

---

## Summary

A single CSS class modification will fix the fullscreen button visibility on mobile while preserving the hover behavior on desktop.


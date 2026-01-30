

# Remove Sticky Behavior from Navigation Pills

## Problem

The navigation pills (Journey, Prep, Equipment, Rules) currently have `sticky top-16` styling, which makes them float and stay fixed at the top of the viewport while scrolling. You want them to scroll normally with the page content on both mobile and web.

---

## Solution

Remove the `sticky` positioning class from the QuickActionsBar component so the navigation scrolls naturally with the rest of the content.

---

## Technical Changes

### File: `src/components/roadmap/QuickActionsBar.tsx`

**Change line 39 from:**
```tsx
<div className="sticky top-16 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-6 glass-nav">
```

**To:**
```tsx
<div className="-mx-3 sm:-mx-4 px-3 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-6">
```

**Classes removed:**
- `sticky` - removes fixed positioning behavior
- `top-16` - no longer needed without sticky
- `z-30` - no longer needed without sticky
- `glass-nav` - no longer needed since it won't overlap content

---

## Behavior After Fix

| Before | After |
|--------|-------|
| Pills stick to top while scrolling | Pills scroll with page content |
| Overlays content below when scrolling | Stays in its natural position |
| Has glass/blur background effect | Clean, no overlay effect needed |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/roadmap/QuickActionsBar.tsx` | Remove `sticky top-16 z-30 glass-nav` classes |


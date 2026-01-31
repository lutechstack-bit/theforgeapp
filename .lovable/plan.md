
# Fix Modal Header Counter Overlap

## Summary
Remove the "2/4" counter from the `RoadmapHighlightsModal` header to eliminate the overlap with the close (X) button.

## Scope

| Modal Type | File | Has Counter Overlap? |
|------------|------|---------------------|
| Past Moments | `RoadmapHighlightsModal.tsx` | Yes - needs fix |
| Student Work | `RoadmapHighlightsModal.tsx` | Yes - needs fix (same component) |
| Stay Location | `StayLocationDetailModal.tsx` | No - already clean |

**One file change fixes both Past Moments and Student Work** since they share the same modal component.

---

## Change Required

**File:** `src/components/home/RoadmapHighlightsModal.tsx`

**Remove lines 151-153:**
```tsx
<span className="text-sm text-muted-foreground font-normal ml-auto">
  {currentIndex + 1} / {items.length}
</span>
```

The dot navigation at the bottom (lines 188-205) already provides position context, making the header counter redundant.

---

## Visual Result

**Before:**
```
┌────────────────────────────────────────┐
│ [📷] Past Moments           2/4   [X] │  ← Overlapping
└────────────────────────────────────────┘
```

**After:**
```
┌────────────────────────────────────────┐
│ [📷] Past Moments                 [X] │  ← Clean
│              ● ○ ○ ○                   │  ← Dots show position
└────────────────────────────────────────┘
```

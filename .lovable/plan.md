

# Remove Sticky Progress Bar

## What Needs to Be Removed

The yellow/gold horizontal progress bar that appears fixed at the top of the screen when scrolling, showing the stage name and completion count (e.g., "3/5").

## Current Implementation

In `JourneyBentoHero.tsx` (lines 226-234):
```typescript
{/* Sticky Progress Bar (appears when scrolling) */}
{currentStage && (
  <StickyProgressBar
    stageName={currentStage.title}
    completed={currentStageStats.completed}
    total={currentStageStats.total}
    observeRef={heroRef}
  />
)}
```

---

## Changes Required

### File: `src/components/journey/JourneyBentoHero.tsx`

**Remove the StickyProgressBar usage:**
1. Remove the import statement for `StickyProgressBar` (line 17)
2. Remove the `currentStageStats` variable calculation (line 207) - unless used elsewhere
3. Remove the entire JSX block rendering `StickyProgressBar` (lines 226-234)

---

## Summary

| Action | File |
|--------|------|
| Remove import | `JourneyBentoHero.tsx` line 17 |
| Remove JSX | `JourneyBentoHero.tsx` lines 226-234 |
| Keep file | `StickyProgressBar.tsx` - not deleted, may be used later |

This removes the fixed sticky progress bar from both mobile and web views immediately.


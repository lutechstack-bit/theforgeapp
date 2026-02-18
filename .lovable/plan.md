

# KY Form UI: Gold Outline Card with No-Scroll Fit

## What Changes

Two main structural changes to match the reference wireframe exactly:

1. **Progress bar moves inside the card** -- currently it sits between the top bar and the card. In the reference, it's at the very top inside the card border.
2. **Card fills the viewport without scrolling** -- the card should stretch to fill the space between the top bar and the bottom navigation. Content fits inside without needing to scroll.
3. **Bottom nav becomes compact centered buttons** -- "< Back" text and "Next >" pill are centered together, not full-width stretched.

## File Changes

### 1. `src/pages/KYSectionForm.tsx`
- Remove the standalone progress bar section (lines 281-284) from between the top bar and card area
- Pass `currentStep` and `totalSteps` to `KYFormCard` so the progress bar renders inside each card
- Change card container from `overflow-y-auto pb-28` to `flex-1 flex` so the card fills available space vertically without scrolling. Use `overflow-y-auto hide-scrollbar` on the card content inner area only if needed for dense steps
- Bottom nav: change from `flex-1` full-width Next button to a compact auto-width pill button, centered with Back text

### 2. `src/components/kyform/KYFormCard.tsx`
- Accept optional `currentStep` and `totalSteps` props
- When provided, render `KYFormProgressBar` at the top of the card, inside the border, above the children content
- Card itself uses `flex flex-col h-full` to fill available space, with children in a scrollable area if content overflows

### 3. `src/components/kyform/KYFormProgressBar.tsx`
- No structural changes needed -- already segmented. Just ensure it works well inside the card padding.

## Visual Layout (top to bottom)

```text
+----------------------------------+
| [<-]   Section Title       [X]  |  <- Top bar (unchanged)
|                                  |
| +------------------------------+ |
| | ■■ ■■ □□ □□ □□ □□            | |  <- Progress bar INSIDE card
| |                              | |
| | Step Title                   | |
| |                              | |
| | Field 1 label                | |
| | [____________]               | |
| |                              | |
| | Field 2 label                | |
| | [____________]               | |
| |                              | |
| +------------------------------+ |
|                                  |
|       < Back    [Next >]        |  <- Compact centered nav
+----------------------------------+
```

## Files Modified

| File | Change |
|------|--------|
| `src/pages/KYSectionForm.tsx` | Move progress bar into card, fix layout to fill viewport, compact bottom nav |
| `src/components/kyform/KYFormCard.tsx` | Accept and render progress bar inside, use flex layout for filling |


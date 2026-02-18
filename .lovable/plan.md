

# Fix KY Form Card to Fit Viewport with Internal Scrolling

## Problem

The card and its content overflow below the screen. The `KYFormCardStack` component doesn't fill the available height, so cards extend past the viewport and get clipped by the bottom navigation. Users cannot scroll to see hidden fields.

## Root Cause

The height chain is broken:
- Parent container (`flex-1 flex min-h-0`) correctly offers space
- But `KYFormCardStack` uses `className="relative"` without `h-full`, breaking the flex height chain
- Cards inside the stack also lack height constraints
- Result: cards render at their natural content height, which overflows

## Fix (3 files)

### 1. `src/components/kyform/KYFormCardStack.tsx`
- Change outer wrapper from `relative` to `relative h-full w-full`
- Change inner card containers from `relative` to `relative h-full`
- Ensure the current card wrapper and animation wrappers all use `h-full`

### 2. `src/components/kyform/KYFormCard.tsx`
- Add `h-full` to the card root so it stretches to fill the stack
- The internal `overflow-y-auto hide-scrollbar` area already exists and will now properly scroll when content overflows

### 3. `src/components/kyform/KYSectionFields.tsx` and `KYSectionIntro.tsx` -- compact sizing
- Reduce field spacing from `space-y-3` to `space-y-2.5`
- Reduce input heights from `h-12` to `h-10`
- Reduce label font from `text-sm` to `text-[13px]`
- Reduce step title from `text-xl` to `text-lg`
- Reduce intro icon from `w-16 h-16` to `w-14 h-14`, title from `text-xl md:text-2xl` to `text-lg md:text-xl`
- Reduce Keep Handy item padding from `px-3 py-2` to `px-2.5 py-1.5`
- These reductions help content fit on smaller screens without scrolling, while still allowing internal scroll when needed

## How It Works After Fix

```text
+----------------------------------+  <- h-[100dvh]
| Top bar (fixed height)           |
|                                  |
| +------------------------------+ |  <- flex-1, min-h-0
| | Card (h-full, flex col)      | |
| | [progress bar]               | |
| | [scrollable content area]    | |  <- overflow-y-auto
| +------------------------------+ |
|                                  |
| [< Back]  [Next >]              |  <- fixed bottom
+----------------------------------+
```

The key insight: `min-h-0` on the flex parent + `h-full` down the chain + `overflow-y-auto` on the content area = card fits viewport, content scrolls internally.

## Files Modified

| File | Change |
|------|--------|
| `src/components/kyform/KYFormCardStack.tsx` | Add `h-full w-full` to all container levels |
| `src/components/kyform/KYFormCard.tsx` | Add `h-full` to card root |
| `src/components/kyform/KYSectionFields.tsx` | Compact field sizes (h-10 inputs, tighter spacing) |
| `src/components/kyform/KYSectionIntro.tsx` | Compact intro sizes (smaller icon, tighter spacing) |


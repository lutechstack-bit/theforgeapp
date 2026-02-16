

# Make Form Pages Fit Within Viewport (No Scroll)

## Problem
Form pages currently extend beyond the viewport, requiring the user to scroll. The "Understanding You" page is fine being scrollable (it has many fields), but all other steps should fit neatly within the visible area without any scrollbar.

## Root Cause
The page layout uses `min-h-[100dvh]` with no height constraint on the card area. The `pb-32` padding pushes content down and the card stack just grows as tall as its content, causing overflow on steps with several fields.

## Fix

### KYSectionForm.tsx - Constrain layout to viewport height
- Change the outer container from `min-h-[100dvh]` to `h-[100dvh] flex flex-col` so everything is constrained to the viewport
- Make the card area use `flex-1 overflow-y-auto` instead of a static `pb-32`, so content scrolls only within the card zone if needed (Understanding page) while shorter pages just fit
- Remove the `pb-32` and replace with a bottom padding that accounts for the fixed bottom nav (~`pb-28`)

### KYSectionFields.tsx - Compact spacing for non-understanding steps
- Reduce the vertical spacing between fields from `space-y-7` / `space-y-6` to `space-y-5` / `space-y-4` to help content fit tighter in the viewport

### KYFormCard.tsx - Reduce card padding on mobile
- Tighten the card padding from `p-6 md:p-7` to `p-4 md:p-7` on mobile to reclaim vertical space

## Files Changed

| File | Change |
|------|--------|
| `src/pages/KYSectionForm.tsx` | Flex column layout, constrain to `h-[100dvh]`, card area becomes `flex-1 overflow-y-auto`, remove `pb-32` |
| `src/components/kyform/KYSectionFields.tsx` | Reduce `space-y-7` to `space-y-5`, `space-y-6` to `space-y-4` |
| `src/components/kyform/KYFormCard.tsx` | Reduce mobile padding from `p-6` to `p-4` |


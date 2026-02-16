

# Remove Scrollbar -- Fit Form Cards Within Viewport

## Problem
The `overflow-y-auto` added to the card container is showing an ugly scrollbar. The form content should simply fit within the available viewport space without any scrolling.

## Fix

### KYSectionForm.tsx
- Remove `overflow-y-auto` from the card stack container
- Keep the `h-[100dvh] flex flex-col` viewport constraint
- The card area stays as `flex-1` but without scroll -- content must fit naturally

### KYFormCard.tsx
- Reduce padding further on mobile: `p-3 md:p-7` to give more room to content

### KYSectionFields.tsx
- Compact the step header: reduce title from `text-2xl` to `text-xl` and tighten header spacing
- Reduce field spacing from `space-y-4` to `space-y-3`

### KYSectionIntro.tsx
- Compact the intro card content (reduce icon size, spacing, font sizes) so the intro step fits without scroll

## Files Changed

| File | Change |
|------|--------|
| `src/pages/KYSectionForm.tsx` | Remove `overflow-y-auto` from card container |
| `src/components/kyform/KYFormCard.tsx` | Mobile padding `p-3 md:p-7` |
| `src/components/kyform/KYSectionFields.tsx` | Smaller title (`text-xl`), tighter spacing (`space-y-3`) |
| `src/components/kyform/KYSectionIntro.tsx` | Compact intro layout to fit viewport |


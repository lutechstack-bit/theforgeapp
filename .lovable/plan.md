

# Fix KY Form Card Sizing, Padding, and Empty Space Issues

## Problems (from screenshots)

1. **Content overflows requiring scroll** -- Dense steps like "Food & Merch" (4 fields including meal-preference and tshirt-size) still clip at the bottom
2. **Cards stretch to fill full height** -- Steps with fewer fields (like "Your Address" with 3 fields) show a large empty gap at the bottom
3. **Header + bottom nav eat too much vertical space** -- Combined with generous internal padding (`md:p-7` = 28px), content gets squeezed

## Root Cause

- `KYFormCard` uses `h-full` forcing all cards to stretch to the full container height regardless of content
- Internal padding (`p-3 md:p-7`) and progress bar padding (`px-3 pt-3 md:px-7 md:pt-5`) are too generous
- `KYFormCardStack` wraps cards with `h-full` propagating the stretch
- `KYSectionForm` card area uses `pb-20` (80px) for bottom nav clearance -- too much
- `KYSectionFields` step header has `space-y-1` wrapper adding unnecessary vertical space

## Changes

### 1. `src/components/kyform/KYFormCard.tsx`
- Change `h-full` to `max-h-full` so cards shrink to fit content
- Reduce content padding from `p-3 md:p-7` to `p-3 md:p-5`
- Reduce progress bar padding from `px-3 pt-3 md:px-7 md:pt-5` to `px-3 pt-3 md:px-5 md:pt-4`

### 2. `src/components/kyform/KYFormCardStack.tsx`
- Add `items-center` to the stack container so cards center vertically instead of stretching top-to-bottom
- Change current card and incoming card wrappers from `h-full` to `h-auto max-h-full`

### 3. `src/pages/KYSectionForm.tsx`
- Add `items-center` to the card area flex container so the card sits centered vertically
- Reduce `pb-20` to `pb-16` to reclaim 16px of vertical space

### 4. `src/components/kyform/KYSectionFields.tsx`
- Replace the step header `space-y-1` wrapper with `mb-2` for tighter spacing
- Reduce the gold accent line's visual gap

### 5. `src/components/kyform/KYSectionConfig.ts` -- Further split "Food & Merch"
The "Food & Merch" step has 4 fields including meal-preference (tall 2-column buttons) and tshirt-size (wrapped pill row), which together still overflow. Split into:
- **"Food & Dietary"**: meal_preference + food_allergies + medication_support (3 fields)
- **"Merch"**: tshirt_size only (1 field -- but pairs naturally with the next "Emergency & Terms" step, so merge tshirt into that step instead)

Final hospitality layout for ALL three cohorts:
- Step 1: "Food & Dietary" -- meal_preference, food_allergies, medication_support
- Step 2: "Merch & Emergency" -- tshirt_size, emergency_contact (inline), terms_accepted

This keeps each step at 3-4 fields max.

## Files Modified

| File | Change |
|------|--------|
| `src/components/kyform/KYFormCard.tsx` | `h-full` to `max-h-full`, reduce padding |
| `src/components/kyform/KYFormCardStack.tsx` | Add `items-center`, card wrappers to `h-auto max-h-full` |
| `src/pages/KYSectionForm.tsx` | Add `items-center`, reduce `pb-20` to `pb-16` |
| `src/components/kyform/KYSectionFields.tsx` | Tighten header spacing |
| `src/components/kyform/KYSectionConfig.ts` | Re-split hospitality steps for all 3 cohorts (KYF, KYC, KYW) |


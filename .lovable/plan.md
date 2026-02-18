

# Fix All KY Form Steps to Fit Within Viewport

## Problem Audit

Every form step across all three cohorts (FORGE, FORGE_CREATORS, FORGE_WRITING) has components that are too tall, causing content to overflow below the visible card area. Here is a step-by-step audit of what overflows and why:

### FORGE (KYF) -- 3 sections, 6 steps
| Step | Fields | Overflow Cause |
|------|--------|----------------|
| General Details | 7 fields (5 text inputs + DOB picker + country-state/pincode inline) | Too many stacked inputs with generous spacing |
| Proficiency | Grid table (4 skills x 5 levels) + laptop radio | Proficiency grid rows have large padding (p-2 to p-4) |
| Understanding | Tags + MBTI (16 buttons) + Chronotype (3 radios) + Intent (7 radios) + text | MOST PROBLEMATIC -- 5 components, MBTI alone is 16 buttons with py-2 each |
| Casting Call | Multi-select + text + gender radio | Moderate, but radio buttons have p-3 padding |
| Pictures | 5 photo uploads at 128x128px stacked | 5 x 128px = 640px for photos alone |
| Hospitality | Meal pref + 2 text + tshirt + emergency inline + checkbox | Meal cards have p-4 padding, tshirt has 7 buttons |

### FORGE_CREATORS (KYC) -- 2 sections, 4 steps
| Step | Overflow Cause |
|------|----------------|
| General Details | 6 fields including 2 radio groups with p-3 per option |
| Proficiency | 3 proficiency fields, each with 3-4 stacked options at p-3 per option |
| Understanding | Same as KYF -- tags + MBTI + chronotype + intent |
| Hospitality | Same as KYF |

### FORGE_WRITERS (KYW) -- 2 sections, 4 steps
| Step | Overflow Cause |
|------|----------------|
| General Details | 5 fields + multi-select -- moderate |
| Proficiency | 2 proficiency fields -- moderate but still tight |
| Understanding | Same pattern as KYF |
| Hospitality | Same as KYF |

## Root Causes (Component Level)

1. **RadioSelectField** -- `space-y-3` gap + `p-3` per option button = too tall
2. **ProficiencyField** -- `space-y-3` gap + `p-3` per option + radio circle = too tall
3. **ProficiencyGrid** -- `p-2 md:p-4` cell padding, generous header = too tall
4. **PhotoUploadField** -- `w-32 h-32` (128px) boxes stacked vertically
5. **MBTI buttons** -- `py-2` + `gap-2.5` grid = 16 buttons take ~200px
6. **Meal preference** -- `p-4` cards with `text-2xl` emoji
7. **KYSectionFields** -- `space-y-2.5` between all fields, `space-y-1` for step header

## Solution: Compact Every Component

### 1. `src/components/onboarding/RadioSelectField.tsx`
- Reduce label gap: `space-y-3` to `space-y-1.5`
- Reduce option padding: `p-3` to `p-2`
- Reduce font: `text-sm` to `text-[13px]`

### 2. `src/components/onboarding/ProficiencyField.tsx`
- Reduce label gap: `space-y-3` to `space-y-1.5`
- Reduce option gap: `space-y-2` to `space-y-1.5`
- Reduce option padding: `p-3` to `p-2`
- Reduce radio circle: `w-6 h-6` to `w-5 h-5`

### 3. `src/components/onboarding/ProficiencyGrid.tsx`
- Reduce cell padding: `p-2 md:p-4` to `p-1.5 md:p-2.5`
- Reduce header padding: `p-1.5 md:p-3` to `p-1 md:p-2`
- Reduce label gap: `space-y-3` to `space-y-1.5`

### 4. `src/components/onboarding/PhotoUploadField.tsx`
- Reduce box size: `w-32 h-32` (128px) to `w-20 h-20` (80px)

### 5. `src/components/kyform/KYSectionFields.tsx`
- Photos: Detect consecutive photo fields and render in `grid grid-cols-3 gap-2` instead of stacking vertically (5 photos in 2 rows instead of 5 rows)
- MBTI: Reduce `gap-2.5` to `gap-1.5`, `py-2` to `py-1.5`
- Meal preference: Reduce `p-4` to `p-2.5`, emoji from `text-2xl` to `text-lg`
- T-shirt: Reduce `px-4 py-2` to `px-3 py-1.5`
- Checkbox: Reduce `p-4` to `p-3`
- Reduce step header title from `text-lg` to `text-base`

### 6. `src/pages/KYSectionForm.tsx`
- Reduce bottom nav padding from `pb-24` to `pb-20` in card container
- Reduce bottom nav area from `pt-6 pb-6` to `pt-4 pb-5`

## Space Savings Summary

| Component | Before | After | Savings per instance |
|-----------|--------|-------|---------------------|
| Radio option | p-3 (12px each side) | p-2 (8px) | ~8px per option |
| Proficiency option | p-3 + w-6 circle | p-2 + w-5 circle | ~10px per option |
| Photo box | 128x128 stacked | 80x80 in 3-col grid | ~340px total (5 photos) |
| MBTI grid | py-2, gap-2.5 | py-1.5, gap-1.5 | ~30px total |
| Meal cards | p-4, text-2xl | p-2.5, text-lg | ~20px total |
| Bottom nav | pt-6 pb-6 | pt-4 pb-5 | ~12px |

## Files Modified

| File | Change |
|------|--------|
| `src/components/onboarding/RadioSelectField.tsx` | Tighter spacing and padding |
| `src/components/onboarding/ProficiencyField.tsx` | Compact options and circles |
| `src/components/onboarding/ProficiencyGrid.tsx` | Tighter cell padding |
| `src/components/onboarding/PhotoUploadField.tsx` | Smaller upload boxes (80px) |
| `src/components/kyform/KYSectionFields.tsx` | Photo grid layout, compact MBTI/meal/tshirt/checkbox |
| `src/pages/KYSectionForm.tsx` | Tighter bottom nav spacing |


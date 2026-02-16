

# Restructure All Form Sections to Fit Viewport

## Overview
Apply the same wireframe-matching restructure across ALL three KYF sections (Filmmaker Profile, Casting Form, Hospitality) -- merge dense steps, add side-by-side field layout, and enable hidden-scrollbar internal scrolling so content looks clean even on longer steps.

## Changes

### 1. KYSectionConfig.ts -- Merge Steps Across All Sections

**Filmmaker Profile** (already discussed):
- Merge `general` (3 fields) + `personal` (5 fields) into one "General Details" step
- State + Pincode get an `inline` property to render side-by-side
- Result: Intro + 3 steps (General Details, Proficiency, Understanding You)

**Casting Form**:
- Keep `casting_call` (languages, height, gender) as one step -- fits fine
- Keep `pictures` (5 photos) as one step -- these are compact upload tiles
- No merge needed, but fields are already tight enough

**Hospitality** (all 3 cohorts: KYF, KYC, KYW):
- Merge `preferences` (meal pref, allergies, medication) + `final_details` (tshirt, emergency name, emergency number, terms) into ONE step called "Hospitality Details"
- This matches the wireframe showing all hospitality fields on a single screen
- Result: Intro + 1 step (all 7 fields together)

### 2. KYSectionFields.tsx -- Add Inline Field Rendering
- Add `inline?: string` optional property to `SectionStepField` type
- Fields sharing the same `inline` key render in a 2-column grid row
- Used for: State + Pincode in Filmmaker Profile, Emergency Name + Number in Hospitality

### 3. KYSectionForm.tsx -- Hidden Scrollbar
- Change `overflow-hidden` back to `overflow-y-auto` so longer merged steps can scroll
- Add `hide-scrollbar` CSS class to keep it visually clean (no visible scrollbar)

### 4. src/index.css -- Add Hide Scrollbar Utility
```css
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
```

### 5. Apply to Creator (KYC) and Writer (KYW) Cohorts
- KYC Hospitality: same merge (preferences + final_details into one step)
- KYW Hospitality: same merge (preferences + final_details into one step)
- KYC/KYW Profile sections: merge general + personal where applicable

## Result Per Section (Filmmaker)

```text
Filmmaker Profile:  Intro -> General Details (8 fields, scrollable) -> Proficiency -> Understanding You
Casting Form:       Intro -> Casting Call (3 fields) -> Your Pictures (5 photos)
Hospitality:        Intro -> Hospitality Details (7 fields, with inline pairs)
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/kyform/KYSectionConfig.ts` | Merge general+personal for all profiles; merge hospitality steps for all cohorts; add `inline` property to paired fields |
| `src/components/kyform/KYSectionConfig.ts` (types) | Add `inline?: string` to `SectionStepField` |
| `src/components/kyform/KYSectionFields.tsx` | Group fields with matching `inline` keys into 2-column grid rows |
| `src/pages/KYSectionForm.tsx` | Change `overflow-hidden` to `overflow-y-auto hide-scrollbar` |
| `src/index.css` | Add `.hide-scrollbar` utility |


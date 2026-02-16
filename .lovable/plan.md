

# Premium KY Form UI Overhaul -- Complete Fix

## Issues to Fix

1. **Duplicate heading**: `KYFormCard` renders `stepTitle` (line 55-58) AND `KYSectionFields` renders `step.title` (line 37) -- causing double headings like "Proficiency Level" shown twice
2. **Progress bar looks odd**: Multi-colored segmented bar cycling orange/gold/yellow feels jarring -- replace with single smooth gold fill bar
3. **Proficiency grid too tight**: Needs more padding, bigger radio buttons, better spacing on mobile
4. **Old KY form routes still in App.tsx**: `/kyf-form`, `/kyc-form`, `/kyw-form`, `/kyf` routes + `KYFRedirect` component still exist (lines 100-120, 244-271) -- users can still land on old forms
5. **Date picker**: Replace plain `<input type="date">` with Shadcn Calendar popover; age calculation should use `Math.max(0, age)` to prevent negative values
6. **Country + State dropdowns**: Replace text-based `state` fields with `CountryStateSelector` component using existing `countryStateData.ts`
7. **Welcome animation**: Currently shows after ProfileSetup completion which is correct, but old form routes could confuse the flow -- removing them cleans this up
8. **Overall premium polish**: Deeper glassmorphism, better typography hierarchy, refined spacing across all field types

## Changes

### 1. Fix Duplicate Heading -- KYFormCard.tsx
Remove `stepTitle` rendering (lines 54-58) and `questionNumber` rendering (lines 46-52) from `KYFormCard` since `KYSectionFields` already renders the step title with subtitle and gold accent line. Also remove `stepTitle` prop from KYSectionForm.tsx where cards are created (line 309).

### 2. New Premium Progress Bar -- KYFormProgressBar.tsx
Replace multi-colored segments with a single smooth gold gradient fill bar:
- One continuous rounded bar with `bg-gradient-to-r from-forge-gold to-forge-orange` fill
- Smooth width transition (`transition-all duration-500`)
- Percentage-based fill: `width = (currentStep / totalSteps) * 100%`
- Subtle background track with `bg-muted/20`

### 3. Fix Proficiency Grid Spacing -- ProficiencyGrid.tsx
- Increase row padding: `p-3 md:p-4` (from `p-2 md:p-3`)
- Larger radio buttons: `w-7 h-7 md:w-8 md:h-8` (from `w-6 h-6 md:w-7 md:h-7`)
- Larger inner dot: `w-2.5 h-2.5 md:w-3 md:h-3`
- Header labels: slightly larger text `text-[11px] md:text-xs`
- Skill label column: `minmax(110px, 1.3fr)` for more breathing room
- Add `overflow-x-auto` for graceful horizontal scroll on very small screens

### 4. Remove Old Form Routes -- App.tsx
- Delete `KYFRedirect` component (lines 100-120)
- Remove routes: `/kyf` (lines 244-250), `/kyf-form` (251-257), `/kyc-form` (258-264), `/kyw-form` (265-271)
- Remove imports: `KYFForm`, `KYCForm`, `KYWForm` (lines 25-27)

### 5. Calendar Date Picker -- KYSectionFields.tsx
Replace the `case 'date'` block (lines 69-94) with a Shadcn Popover + Calendar:
- A button showing formatted date or "Pick your date of birth" placeholder
- CalendarIcon on the button
- Calendar opens in popover, allows selecting dates from 1900 to today
- Age display uses `Math.max(0, calculatedAge)` for non-negative values
- Premium styling: gold focus ring, rounded-xl, backdrop-blur

### 6. Country + State Field Type -- KYSectionConfig.ts + KYSectionFields.tsx
- Add `'country-state'` to the `SectionStepField` type union
- Add a `countryKey` optional property to `SectionStepField` for mapping the country value
- Replace `state` text fields in all cohort configs (KYF line 162, KYC line 321, KYW -- add state field) with `type: 'country-state'`
- In `KYSectionFields.tsx`, add a `case 'country-state'` that renders the existing `CountryStateSelector` component with premium gold styling

### 7. Premium UI Polish Across Fields -- KYSectionFields.tsx
- Text inputs: add `shadow-[0_0_0_1px_hsl(var(--forge-gold)/0.05)]` for subtle depth
- Step header: increase title to `text-2xl font-bold`, subtitle to `text-sm`, gold accent line wider
- MBTI grid: slightly larger buttons with better gap
- Meal preference & T-shirt buttons: slightly more padding, smoother transitions
- Checkbox/terms: gold accent border

### 8. KYSectionForm.tsx Minor Cleanup
- Remove `questionNumber` and `stepTitle` props from KYFormCard step rendering (line 299-309)
- Keep clean card rendering without duplicate headings

## Files Changed

| File | Change |
|------|--------|
| `src/components/kyform/KYFormCard.tsx` | Remove `stepTitle` and `questionNumber` rendering |
| `src/components/kyform/KYFormProgressBar.tsx` | Replace with single smooth gold fill bar |
| `src/components/onboarding/ProficiencyGrid.tsx` | Fix spacing, increase sizes, add overflow handling |
| `src/App.tsx` | Remove old KY form routes + KYFRedirect + imports |
| `src/components/kyform/KYSectionFields.tsx` | Calendar date picker, country-state handler, premium polish |
| `src/components/kyform/KYSectionConfig.ts` | Add `country-state` type, update state fields across all cohorts |
| `src/pages/KYSectionForm.tsx` | Remove stepTitle/questionNumber from card props |

## Technical Notes
- No database changes needed -- existing columns support all values
- `CountryStateSelector` and `countryStateData.ts` already exist with full country/state data
- Shadcn Calendar component is already installed (`react-day-picker`, `date-fns`)
- Age calculation: `Math.max(0, age)` prevents negative display
- Calendar: `captionLayout="dropdown-buttons"` with `fromYear={1900} toYear={currentYear}` for easy year navigation


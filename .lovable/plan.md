

# Redesign KY Forms into Section-Based Multi-Step System

## Overview

Transform the monolithic KY forms (KYF/KYC/KYW) into a section-based system matching the provided screenshots. Each cohort's form is split into 2-3 themed sections displayed on the homepage as a "Complete Your Profile" card with sequential locking. Each section opens as a bottom-sheet (mobile) or dialog (desktop) with its own intro screen, multi-step flow, and segmented progress bar.

## Section Breakdown by Cohort

### KYF (Filmmakers) -- 3 Sections

| # | Section | Steps Inside | Key Fields |
|---|---------|-------------|------------|
| 1 | Filmmaker Profile | Intro > General Details > Personal Details > Proficiency > Understanding You | certificate_name, occupation, instagram, DOB, address, state, pincode, proficiencies (screenwriting/direction/cinematography/editing), laptop question, top 3 movies, MBTI, chronotype, forge intent |
| 2 | Casting Form | Intro > Casting Call > Your Pictures | languages, height, gender, 5 photo uploads |
| 3 | Hospitality Details | Intro > Preferences > Final Details | meal preference, food allergies, medication, t-shirt size, emergency contact name/number, terms |

### KYC (Creators) -- 2 Sections

| # | Section | Steps Inside | Key Fields |
|---|---------|-------------|------------|
| 1 | Creator Profile | Intro > General Details > Personal Details > Proficiency > Understanding You | certificate_name, status, instagram, DOB, state, platform, proficiencies, top 3 creators, MBTI, chronotype, forge intent |
| 2 | Hospitality Details | Intro > Preferences > Final Details | meal preference, emergency contact, terms |

### KYW (Writers) -- 2 Sections

| # | Section | Steps Inside | Key Fields |
|---|---------|-------------|------------|
| 1 | Writer Profile | Intro > General Details > Personal Details > Proficiency > Understanding You | certificate_name, occupation, DOB, primary language, writing types, proficiencies, top 3 writers/books, MBTI, chronotype, forge intent |
| 2 | Hospitality Details | Intro > Emergency & Terms | emergency contact, terms |

## Database Changes

Add a JSONB column `ky_section_progress` to the `profiles` table:

```text
profiles.ky_section_progress jsonb DEFAULT '{}'::jsonb
```

Example value: `{ "filmmaker_profile": true, "casting_form": false, "hospitality": false }`

The existing `ky_form_completed` flag is set to `true` only when ALL sections are completed.

## New Files

### 1. `src/components/kyform/KYSectionConfig.ts`
Central configuration defining sections per cohort:
- Section key, title, subtitle, icon name, "keep handy" items, time estimate
- Step definitions within each section (title, subtitle, field keys)
- Maps cohort_type to sections array

### 2. `src/components/kyform/KYSectionIntro.tsx`
The intro screen (Step 1 of each section) matching the screenshots:
- Gold icon at top (coffee cup, camera, utensils depending on section)
- Bold title ("Almost there! Final details")
- Description text
- "KEEP HANDY" numbered list with gold number badges in rounded cards
- Time estimate with clock icon
- Renders inside the section sheet as the first step

### 3. `src/components/kyform/KYSectionSheet.tsx`
The responsive modal container for each section's multi-step flow:
- Mobile: renders as a `Drawer` (bottom sheet) -- full height
- Desktop (md+): renders as a `Dialog` (centered modal, max-w-lg)
- Header: Section name label, "Step X of N" bold text, back arrow (left), close X (right)
- Segmented gold progress bar below header (reuses `KYFormProgressBar`)
- Scrollable content area for form fields
- Sticky bottom CTA button: "Let's go >" (intro) / "Next >" (middle steps) / "Complete >" (last step)
- Button styled as full-width rounded pill, `bg-forge-orange` matching screenshots
- Saves progress on each "Next" and on close/exit
- On "Complete", saves to the cohort response table and updates `ky_section_progress` in profiles

### 4. `src/components/kyform/KYSectionFields.tsx`
Renders the form fields for a given section + step, reusing existing field components:
- `Input`, `Label`, `RadioSelectField`, `MultiSelectField`, `ProficiencyField`, `PhotoUploadField`, `CountryStateSelector`, `PhoneInput`, `TagInput`, `TermsModal`
- Uses the existing `KYFormCard` styling (gold border glow, backdrop blur) for each step's content wrapper
- Meal preference rendered as two large emoji cards side-by-side (Vegetarian/Non-Veg) matching screenshots
- Select dropdowns for t-shirt size matching the screenshot style

### 5. `src/components/home/KYProfileCard.tsx`
The homepage "Complete Your Profile" card matching the screenshots:
- Title: "Complete Your Profile" with "X of N" counter (top-right)
- Subtitle: "Required before bootcamp"
- Segmented progress bar (gold for completed, muted for remaining)
- Section rows, each showing:
  - Section number + gold title (e.g., "1. Filmmaker Profile")
  - Subtitle in muted text (e.g., "Your filmmaking journey")
  - Completed: gold checkmark circle on right, gold-tinted background
  - Active (unlocked, not completed): "Start now >" or "Continue >" CTA text
  - Locked: muted/40% opacity with lock icon
- Clicking an active section opens `KYSectionSheet`
- Card uses `border border-forge-gold/30` styling consistent with `KYFormCard`

## Modified Files

### `src/components/home/OnboardingStepsSection.tsx`
- Replace the current single "Complete your KY Form" step with the new `KYProfileCard` component
- Keep "Set up your profile" and "Add profile photo" steps as-is
- When `ky_form_completed` is true, the KY card is hidden (all sections done)

### `src/contexts/AuthContext.tsx`
- Add `ky_section_progress` to the `Profile` interface (type: `Record<string, boolean> | null`)
- Include it in `fetchProfile` select and cache operations
- Expose it so components can read section completion state

### `src/pages/KYFForm.tsx`, `src/pages/KYCForm.tsx`, `src/pages/KYWForm.tsx`
- Keep as fallback full-page routes (accessible via direct URL `/kyf`, `/kyc`, `/kyw`)
- No major changes needed -- they continue to work as before for users who navigate directly

### `src/components/kyform/index.ts`
- Export new components: `KYSectionSheet`, `KYSectionIntro`, `KYSectionConfig`, `KYSectionFields`, `KYProfileCard` (from home)

## User Flow

```text
Homepage
  |
  v
"Complete Your Profile" card (KYProfileCard)
  |
  |-- Section 1: [Start now >]
  |     |-- Opens KYSectionSheet (Drawer on mobile / Dialog on desktop)
  |     |-- Step 1: Intro ("Let's build your filmmaker profile", KEEP HANDY list)
  |     |-- Step 2-N: Form fields grouped by topic
  |     |-- Last step: [Complete >]
  |     |-- Saves to kyf_responses + sets ky_section_progress.filmmaker_profile = true
  |     --> Returns to homepage, section 1 shows gold checkmark
  |
  |-- Section 2: [Continue >] (unlocked after section 1 complete)
  |     |-- Same pattern...
  |
  |-- Section 3 (KYF only): [Continue >] (unlocked after section 2)
        |-- Last step includes Terms checkbox
        |-- On complete: sets ky_form_completed = true
        --> Shows completion toast, card disappears
```

## Desktop vs Mobile

- Mobile: `KYSectionSheet` renders as a full-height `Drawer` (bottom sheet with drag handle)
- Desktop (md+): renders as a centered `Dialog` with `max-w-lg`, same internal layout but with more padding
- The homepage `KYProfileCard` is full-width on mobile, constrained within `max-w-3xl` on desktop (follows existing homepage layout)

## Files Summary

| File | Action |
|------|--------|
| DB Migration | ADD `ky_section_progress` JSONB column to `profiles` |
| `src/components/kyform/KYSectionConfig.ts` | CREATE -- Section definitions per cohort |
| `src/components/kyform/KYSectionIntro.tsx` | CREATE -- Intro screen with KEEP HANDY list |
| `src/components/kyform/KYSectionFields.tsx` | CREATE -- Form field renderer per section/step |
| `src/components/kyform/KYSectionSheet.tsx` | CREATE -- Drawer/Dialog container with multi-step nav |
| `src/components/home/KYProfileCard.tsx` | CREATE -- Homepage "Complete Your Profile" card |
| `src/components/home/OnboardingStepsSection.tsx` | UPDATE -- Integrate KYProfileCard |
| `src/contexts/AuthContext.tsx` | UPDATE -- Add ky_section_progress to Profile interface |
| `src/components/kyform/index.ts` | UPDATE -- Export new components |




# Restructure KY Form Steps to Eliminate Scrolling

## Problem
Multiple form steps across all three cohorts (KYF, KYC, KYW) pack too many fields into a single step, forcing users to scroll within the card to reach all inputs and the bottom of the form. The screenshot clearly shows the "General Details" step with 7 fields overflowing.

## Root Cause
The step definitions in `KYSectionConfig.ts` group too many fields into single steps. Since the card is constrained to viewport height, dense steps overflow.

## Solution
Split every overflowing step into smaller sub-steps (3-4 fields max per step) so all content fits within the viewport without any scrolling. This only requires changes to `KYSectionConfig.ts` -- no UI component changes needed since the step rendering, progress bar, and navigation already work dynamically based on the config.

## Audit of Every Step (All Cohorts)

### KYF -- Filmmaker Profile

| Step | Fields | Overflows? | Action |
|------|--------|-----------|--------|
| general_details | 7 fields (name, occupation, instagram, DOB, address, country/state+pincode) | YES | Split into 2: "General Details" (4 fields) + "Your Address" (3 fields) |
| proficiency | proficiency-grid + laptop radio | Borderline | Keep as-is (grid is compact) |
| understanding | tags + MBTI(16 buttons) + chronotype + forge_intent + other | YES | Split into 2: "Favorites & Personality" (tags + MBTI) + "Your Vibe" (chronotype + intent + other) |

### KYF -- Casting Form

| Step | Fields | Overflows? | Action |
|------|--------|-----------|--------|
| casting_call | languages + height + gender | OK | Keep as-is |
| pictures | 5 photo uploads (grid-cols-3) | OK | Keep as-is |

### KYF -- Hospitality Details

| Step | Fields | Overflows? | Action |
|------|--------|-----------|--------|
| hospitality_details | meal + allergies + medication + tshirt + emergency(inline) + terms | YES | Split into 2: "Food & Merch" (meal, allergies, medication, tshirt) + "Emergency & Terms" (emergency inline + terms) |

### KYC -- Creator Profile

| Step | Fields | Overflows? | Action |
|------|--------|-----------|--------|
| general_details | 6 fields (name, status radio, instagram, DOB, country/state, platform radio) | YES | Split into 2: "General Details" (name, status, instagram, DOB) + "Location & Platform" (country/state, platform) |
| proficiency | 3 proficiency selectors | Borderline | Keep as-is |
| understanding | tags + MBTI + chronotype + intent + other | YES | Split into 2 (same as KYF) |

### KYC -- Hospitality Details

| Step | Fields | Overflows? | Action |
|------|--------|-----------|--------|
| hospitality_details | same 7 fields as KYF | YES | Split into 2 (same pattern as KYF) |

### KYW -- Writer Profile

| Step | Fields | Overflows? | Action |
|------|--------|-----------|--------|
| general_details | 5 fields (name, occupation, DOB, country/state, writing_types multi-select) | YES | Split into 2: "General Details" (name, occupation, DOB) + "Location & Writing" (country/state, writing_types) |
| proficiency | 2 proficiency selectors | OK | Keep as-is |
| understanding | tags + MBTI + chronotype + intent + other | YES | Split into 2 (same pattern) |

### KYW -- Hospitality Details

| Step | Fields | Overflows? | Action |
|------|--------|-----------|--------|
| hospitality_details | same 7 fields | YES | Split into 2 (same pattern) |

## Summary of Changes

**Only one file modified:** `src/components/kyform/KYSectionConfig.ts`

Total step splits across all cohorts:
- KYF: 3 steps split into 6 (general, understanding, hospitality)
- KYC: 3 steps split into 6 (general, understanding, hospitality)
- KYW: 3 steps split into 6 (general, understanding, hospitality)

Progress bars, navigation, and step counting all update automatically since they derive from `section.steps.length`.

No changes needed to `KYSectionFields.tsx`, `KYFormCard.tsx`, `KYFormCardStack.tsx`, or `KYSectionForm.tsx` -- the rendering logic is already fully dynamic.


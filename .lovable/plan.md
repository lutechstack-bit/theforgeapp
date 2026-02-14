
# Consolidated KY Form Content Overhaul + Hospitality Section

## Overview

Rewrite all three KY section configs (KYF, KYC, KYW) to match the exact fields from the uploaded wireframes across all 13 screenshots. The Hospitality section (shared across all cohorts) is split into 3 steps matching the new wireframes. The existing premium UI (`KYFormCardStack`, `KYSectionIntro`, `KYSectionFields`) stays -- only the data in `KYSectionConfig.ts` changes, plus the Hospitality section is restructured from 1 step to 3 steps.

## Section-by-Section Field Mapping

### SECTION 1: Filmmaker Profile (KYF) -- 4 Steps

**Step 1: "General Details"** (subtitle: "The basics about you")
- `certificate_name` -- text, required, placeholder "Your full legal name"
- `current_occupation` -- text, required, placeholder "e.g. Student, Freelancer"
- `instagram_id` -- text, required, placeholder "@yourhandle"
- `date_of_birth` -- date, required
- `address_line_1` -- text, required, placeholder "Street address"
- `address_line_2` -- text, placeholder "Apartment, suite, etc."
- `state` -- text, required
- `pincode` -- text, required, placeholder "6-digit pincode"

**Step 2: "Proficiency Level"** (subtitle: "How experienced are you?")
- `proficiency_screenwriting` -- proficiency (existing options)
- `proficiency_direction` -- proficiency (existing options)
- `proficiency_cinematography` -- proficiency (existing options)
- `proficiency_editing` -- proficiency (existing options)
- `has_editing_laptop` -- radio (Yes/No), columns: 2

**Step 3: "Understanding You"** (subtitle: "Help us know you better")
- `top_3_movies` -- tags, max 3, required
- `mbti_type` -- mbti grid, required
- `chronotype` -- radio (Early Bird / Night Owl / In between), required
- `forge_intent` -- radio, required (existing film options)
- `forge_intent_other` -- text, conditional

**Step 4 removed** -- General + Personal are merged into one step (Step 1), so it goes from 4 steps to 3 steps total.

Wait -- the wireframes show 4 screens for Section 1. Let me re-check: General Details, Personal Details (separate), Proficiency, Understanding You. So keeping 4 steps as-is.

### SECTION 2: Casting Form (KYF) -- 2 Steps (unchanged structure)

**Step 1: "Casting Call"** (subtitle: "Basic casting information")
- `languages_known` -- multi-select chips (English, Hindi, Tamil, Telugu, Malayalam, Kannada), required
- `height_ft` -- text, required
- `gender` -- radio (Male / Female / Non-Binary / Prefer not to say), columns: 2, required

**Step 2: "Your Pictures"** (subtitle: "Upload your casting photos")
- `headshot_front_url` -- photo, required
- `headshot_left_url` -- photo
- `headshot_right_url` -- photo
- `full_body_url` -- photo, required
- `photo_favorite_url` -- photo, required

### SECTION 3: Hospitality Details (ALL cohorts) -- NOW 3 Steps

This is the key change. Currently 1 step with all fields crammed in. Now split into 3 steps per wireframes:

**Intro screen**: "Almost there! Final details" with keep-handy items:
1. Emergency contact number
2. Your T-shirt size
3. Any dietary restrictions or allergies
Time: ~2 minutes

**Step 1: "Preferences"** (subtitle: "Help us plan your stay")
- `meal_preference` -- meal-preference (Vegetarian / Non-Veg emoji cards), required
- `food_allergies` -- text, required, placeholder "None"
- `medication_support` -- text, required, placeholder "None"

**Step 2: "Final Details"** (subtitle: "Emergency contact and merch")
- `tshirt_size` -- tshirt-size (size pills), required
- `emergency_contact_name` -- text, required, placeholder "Parent / Guardian name"
- `emergency_contact_number` -- phone, required

**Step 3: "Terms"**
- `terms_accepted` -- checkbox, required

Actually, looking at the wireframes more carefully: Step 2 is "Preferences" (meal, allergies, medication) and Step 3 is "Final Details" (t-shirt, emergency contact name, emergency contact number). There's no separate terms step shown. So:

**Step 1: "Preferences"** (subtitle: "Help us plan your stay")
- `meal_preference` -- meal-preference, required
- `food_allergies` -- text, required, placeholder "None"
- `medication_support` -- text, required, placeholder "None"

**Step 2: "Final Details"** (subtitle: "Emergency contact and merch")
- `tshirt_size` -- tshirt-size, required
- `emergency_contact_name` -- text, required, placeholder "Parent / Guardian name"
- `emergency_contact_number` -- phone, required
- `terms_accepted` -- checkbox, required (kept on last step)

### Creator Profile (KYC) Sections

Same structure but adapted:
- Section 1: Creator Profile (General, Personal with platform, Proficiency for content/storytelling/video, Understanding You with top 3 creators)
- Section 2: Hospitality Details (same 2-step structure as above, no casting form for creators)

### Writer Profile (KYW) Sections

- Section 1: Writer Profile (General with writing language, Writing Practice types, Proficiency for writing/voice, Understanding You with top 3 writers)
- Section 2: Hospitality Details (same 2-step structure, no casting form for writers)

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/components/kyform/KYSectionConfig.ts` | Restructure Hospitality from 1 step to 2 steps for all 3 cohorts (KYF, KYC, KYW). Update intro keepHandy items. Merge KYF general+personal into combined step OR keep as-is per wireframe count. Ensure field keys match existing DB columns. |

### What stays the same
- `KYSectionFields.tsx` -- already handles all field types (meal-preference, tshirt-size, phone, photo, etc.)
- `KYSectionIntro.tsx` -- already renders keepHandy items and intro text
- `KYSectionForm.tsx` -- already handles multi-step navigation, progress bar, card stack
- `KYFormCardStack.tsx` -- animation system unchanged
- All existing field rendering components (RadioSelectField, MultiSelectField, ProficiencyField, etc.)

### What changes
- Only the data definitions in `KYSectionConfig.ts`:
  - KYF Hospitality: 1 step -> 2 steps (Preferences + Final Details)
  - KYC Hospitality: 1 step -> 2 steps
  - KYW Hospitality: 1 step -> 2 steps
  - Update `keepHandy` items for Hospitality to match wireframe (emergency contact, t-shirt size, dietary restrictions)
  - Update `introDescription` for Hospitality: "We want to make sure your stay is comfortable. This helps us plan meals, rooms, and emergencies."
  - Ensure field order matches wireframes exactly

### No database changes needed
All field keys (`meal_preference`, `food_allergies`, `medication_support`, `tshirt_size`, `emergency_contact_name`, `emergency_contact_number`, `terms_accepted`) already exist in the response tables.

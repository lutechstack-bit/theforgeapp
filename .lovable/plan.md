

# Premium KY Form UI Overhaul

## Overview
A comprehensive visual and UX upgrade to all KY form components, making them feel more premium, polished, and seamless across mobile and desktop. This includes a new **proficiency matrix grid** for Filmmakers (matching the uploaded screenshot) and elevated styling for every form field type.

## Changes

### 1. New Proficiency Grid Component (Filmmakers only)
Create `src/components/onboarding/ProficiencyGrid.tsx` -- a matrix-style table matching the uploaded screenshot:

```text
+-------------------+----------+---------+----+------+-----+
|                   | Beginner | Amateur | Ok | Good | Pro |
+-------------------+----------+---------+----+------+-----+
| Screenwriting     |    O     |    O    | O  |  O   |  O  |
| Direction         |    O     |    O    | O  |  O   |  O  |
| Cinematography    |    O     |    O    | O  |  O   |  O  |
| Editing           |    O     |    O    | O  |  O   |  O  |
+-------------------+----------+---------+----+------+-----+
```

- Gold-filled radio dots on selection with scale animation
- Premium card container with subtle gold border
- Responsive: on mobile, columns compress with smaller text; on desktop, full table layout
- Each skill maps to its own database column (e.g. `proficiency_screenwriting`)
- Values: `beginner`, `amateur`, `ok`, `good`, `pro`

### 2. Config Update for Filmmakers
Update `KYSectionConfig.ts` to add a new field type `proficiency-grid` for the FORGE proficiency step. This replaces the 4 individual `proficiency` fields with one grid field that contains all 4 skills and 5 levels. The `has_editing_laptop` radio field stays as-is below the grid.

Creators and Writers keep their current descriptive `proficiency` fields (different option counts per skill make a uniform grid unsuitable).

### 3. Premium UI Polish for All Field Components

**KYFormCard** (`KYFormCard.tsx`):
- Add a subtle animated shimmer line along the top edge
- Deeper glassmorphism: `bg-card/60 backdrop-blur-md`
- Enhanced gold glow shadow

**KYSectionIntro** (`KYSectionIntro.tsx`):
- Larger icon container with gold gradient ring
- Bolder, more spacious typography
- "Keep Handy" items get gold emoji backgrounds instead of numbered circles

**KYSectionFields** (`KYSectionFields.tsx`):
- Handle the new `proficiency-grid` field type
- All text inputs: gold focus ring (`focus:ring-forge-gold/30`), deeper background
- Step header: larger title with gold accent line underneath
- Better spacing between fields (`space-y-6`)

**ProficiencyField** (`ProficiencyField.tsx` -- for Creators/Writers):
- Gold radio dot on selection (matching brand colors)
- Card hover glow effect
- Smoother scale transition on select

**RadioSelectField** (`RadioSelectField.tsx`):
- Gold border and background tint on selection
- Subtle gold glow shadow on selected option
- Press animation (`active:scale-[0.98]`)

**MultiSelectField** (`MultiSelectField.tsx`):
- Gold pill styling on selection (matching TagInput's gold pills)
- Checkmark icon in gold

**PhotoUploadField** (`PhotoUploadField.tsx`):
- Gold dashed border on hover
- Upload icon with gold tint
- Image preview with gold border ring

**PhoneInput** (`PhoneInput.tsx`):
- Gold focus ring on both inputs
- Consistent `bg-card/60` background

**MealPreference / T-shirt / MBTI buttons** (in `KYSectionFields.tsx`):
- Gold border + glow on selection instead of primary
- Press feedback animation

### 4. Bottom Navigation Bar (`KYSectionForm.tsx`)
- "Next" button: gold gradient background (`bg-gradient-to-r from-forge-gold to-forge-orange`) with stronger glow shadow
- "Back" button: subtle gold border accent
- Larger touch targets (48px height)
- Stronger press feedback animation

### 5. Top Bar and Progress (`KYSectionForm.tsx`)
- Section title in gold accent color
- Back/close buttons with gold border hover state

## Files Changed

| File | Action |
|------|--------|
| `src/components/onboarding/ProficiencyGrid.tsx` | **New** |
| `src/components/kyform/KYSectionConfig.ts` | Add `proficiency-grid` type, update FORGE proficiency step |
| `src/components/kyform/KYSectionFields.tsx` | Handle `proficiency-grid`, polish all field styles |
| `src/components/kyform/KYFormCard.tsx` | Enhanced glassmorphism + shimmer |
| `src/components/kyform/KYSectionIntro.tsx` | Premium typography + gold accents |
| `src/components/onboarding/ProficiencyField.tsx` | Gold radio styling |
| `src/components/onboarding/RadioSelectField.tsx` | Gold selection + press animation |
| `src/components/onboarding/MultiSelectField.tsx` | Gold pill styling |
| `src/components/onboarding/PhotoUploadField.tsx` | Gold border accents |
| `src/components/onboarding/PhoneInput.tsx` | Gold focus rings |
| `src/pages/KYSectionForm.tsx` | Premium nav bar + top bar polish |

## Technical Notes
- No database changes needed -- existing columns already support the new proficiency values
- The `proficiency-grid` field type stores each skill individually (same DB columns as before), just with simpler 5-level values instead of descriptive strings
- All styling uses existing Tailwind config colors (`forge-gold`, `forge-orange`, `forge-yellow`) and animation utilities
- Fully responsive: grid compresses gracefully on mobile with horizontal scroll or smaller cells


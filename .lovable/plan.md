

# Fix Profile Editing — Add KY Form Fields to ProfileEditSheet

## Problem
When clicking edit (✎) on any profile tile (About, General, Personality, Proficiency, Influences, Practice, Personal), they all open the same `ProfileEditSheet` which only has basic profile fields (name, bio, tagline, city, phone, social handles). The KY form data (MBTI, occupation, proficiency levels, top movies, chronotype, etc.) is not editable from the profile page at all.

The `scrollToSection` only supports `photo` and `instagram` refs — sections like `about`, `general`, `personality`, `proficiency`, `influences`, `practice`, `personal` are passed but ignored.

## Solution
Enhance `ProfileEditSheet` to include KY form fields organized by section, with proper scroll-to support.

### File: `src/components/profile/ProfileEditSheet.tsx`

**Add KY form data loading**: Accept `profileData` (or `cohortType`, `kyfResponse`, `kywResponse`, `kycResponse`) as props from Profile.tsx. Load KY fields into a separate `kyFormData` state.

**Add section refs** for: `about`, `general`, `proficiency`, `personality`, `influences`, `practice`, `personal` — and wire them into the `scrollToSection` effect.

**Add new form sections** (after existing Basic Info and Contact Info):

1. **General Details** (`general` ref) — Certificate Name, Current Occupation
2. **Personality** (`personality` ref) — MBTI Type (dropdown with 16 types)
3. **Proficiency** (`proficiency` ref) — Proficiency levels per cohort type (dropdowns: Beginner/Developing/Intermediate/Advanced/Expert)
4. **Influences** (`influences` ref) — Top 3 Movies/Writers (tag input), Chronotype (dropdown)
5. **Practice** (`practice` ref) — Writing Types (multi-select for FORGE_WRITING), Emergency Contact fields
6. **Personal Details** (`personal` ref) — Date of Birth, Primary Language

**Save logic**: On save, update both `profiles` table (existing fields) AND the appropriate KY response table (`kyf_responses`/`kyw_responses`/`kyc_responses`) via upsert.

### File: `src/pages/Profile.tsx`

Pass `profileData` to `ProfileEditSheet` so it has access to KY response data and cohort type. Add a `refetchProfile` call for KY data after save.

### File: `src/pages/admin/AdminUsers.tsx`

No changes needed — the admin edit fields were already expanded in the previous update.

## Technical Details

- KY fields are conditionally rendered based on `cohortType` (FORGE shows filmmaking proficiency, FORGE_WRITING shows writing proficiency, etc.)
- MBTI is a `<Select>` with all 16 types
- Proficiency fields use `<Select>` with 5 levels
- Top 3 movies/writers uses a simple comma-separated input or the existing TagInput component
- The sheet becomes scrollable with all sections, and `scrollToSection` scrolls to the correct ref
- Upsert to KY response table uses `onConflict: 'user_id'`


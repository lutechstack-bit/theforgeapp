

# Fix: Make Creative Profile Required + Fix Form Access

## Problems

1. **Creative Profile is marked optional** — user wants it mandatory as the final KY section
2. **Can't access the Creative Profile form** — after completing the 3rd required section, `ky_form_completed` is set to `true` which may cause the KY card to behave unexpectedly, and the "isLastRequiredSection" logic explicitly excludes community_profile

## Changes

### 1. `src/components/kyform/KYSectionConfig.ts`
- Remove `isOptional: true` from `COMMUNITY_PROFILE_SECTION`
- Update `introDescription` to remove "This is optional but recommended!"

### 2. `src/pages/KYSectionForm.tsx`
- Remove the `!isCommunityProfile &&` guard from `isLastRequiredSection` — now the community_profile IS the last required section, so completing it should set `ky_form_completed = true`
- Keep all the special rendering and save logic for community_profile (custom steps, collaborator_profiles upsert)

### 3. `src/components/home/KYProfileCard.tsx`
- Remove the optional/required split — all sections are now required
- Remove the `optionalSections` rendering block and the "Optional" badge
- Remove the `Sparkles` import (no longer needed)
- Show all sections in a single unified list with sequential numbering and locking

### 4. `src/components/kyform/KYSectionConfig.ts` — `getRequiredSections`
- This function filters out optional sections. With `isOptional` removed, it will naturally include community_profile — no code change needed here.

### Files Modified
| File | Change |
|------|--------|
| `src/components/kyform/KYSectionConfig.ts` | Remove `isOptional: true`, update intro text |
| `src/pages/KYSectionForm.tsx` | Remove `!isCommunityProfile` guard on `isLastRequiredSection` |
| `src/components/home/KYProfileCard.tsx` | Remove optional/required split, unified list |

No database changes needed.


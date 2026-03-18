

# Add Community Profile as KY Form Section (After Hospitality/Last Section)

## Summary
Move the Community Profile form into the KY form flow as a new section appearing **after Hospitality** for all three cohorts. Remove it from the Community page and the standalone `/community-profile` route.

## Approach

The community profile has custom UI (OccupationPillSelector, Switch toggles, portfolio type pills) that don't fit existing KY field types. Instead of adding many new field types, I'll handle `community_profile` as a **special section key** in `KYSectionForm.tsx` that renders the `CommunityProfileForm` steps inline, with its own save logic writing to `collaborator_profiles`.

## Changes

### 1. `src/components/kyform/KYSectionConfig.ts`
- Extend `responseTable` type union to include `'collaborator_profiles'`
- Add a new `community_profile` KYSection to each cohort array (KYF, KYC, KYW) — appended **after** their last section (hospitality)
- Section config: 3 steps matching the existing CommunityProfileForm (Basics, Professional Soul, Connect & Share)
- Fields can be placeholder definitions since the actual rendering is custom
- Mark this section as optional (no required fields that block KY completion)

### 2. `src/pages/KYSectionForm.tsx`
- Detect when `section.key === 'community_profile'` — render the 3 custom step cards from `CommunityProfileForm` instead of generic `KYSectionFields`
- Override `buildUpsertPayload` and save logic to write to `collaborator_profiles` instead of the KY response table
- Mark this section's completion as **not blocking** `ky_form_completed` / `kyf_completed` — the "isLastSection" check should look at the section *before* community_profile for form completion status
- On complete, upsert to `collaborator_profiles` with `is_published: true`

### 3. `src/pages/KYSectionForm.tsx` — completion logic
- When completing the community_profile section, do NOT set `ky_form_completed = true` (that should have been set when hospitaliy was completed)
- The hospitality section remains the "last required" section — community_profile is a bonus

### 4. `src/components/home/KYProfileCard.tsx`
- The community_profile section should appear in the section list but with an "Optional" badge
- It should not count toward the "X of Y" completion requirement

### 5. Remove standalone route & CTA
- **`src/App.tsx`**: Remove the `/community-profile` route
- **`src/pages/Community.tsx`**: Remove `onSetupProfile` prop from `CreativesDirectory` — replace with navigation to `/ky-section/community_profile`
- **`src/components/community/CreativesDirectory.tsx`**: Update `onSetupProfile` usage to navigate to `/ky-section/community_profile`

### 6. `src/components/community/CommunityProfileForm.tsx`
- Refactor into a set of **exported step components** (`CommunityProfileStep1`, `CommunityProfileStep2`, `CommunityProfileStep3`) that accept `formData` and `updateField` props — so they can be embedded inside the KYSectionForm's card stack
- Keep the standalone page wrapper as a thin shell that can be removed

### Files Modified
| File | Action |
|------|--------|
| `src/components/kyform/KYSectionConfig.ts` | Add `community_profile` section to all 3 cohort arrays |
| `src/pages/KYSectionForm.tsx` | Handle special rendering + save for `community_profile` |
| `src/components/community/CommunityProfileForm.tsx` | Refactor into reusable step components |
| `src/App.tsx` | Remove `/community-profile` route |
| `src/pages/Community.tsx` | Update profile setup navigation |
| `src/components/community/CreativesDirectory.tsx` | Update onSetupProfile to use KY route |

No database changes needed.




# Make KY Forms Cohort-Switcher Aware

## Problem
The KY form components (`KYProfileCard`, `KYSectionForm`, `MyKYForm`, `useProfileData`) all read `edition?.cohort_type` directly from `useAuth()`. When an admin switches cohorts via the Cohort Switcher, the KY forms still show the admin's real cohort — not the simulated one.

## Changes

### 1. `src/components/home/KYProfileCard.tsx`
- Replace `useAuth()` edition with `useEffectiveCohort()` for `cohortType`
- Use `effectiveCohortType` instead of `edition?.cohort_type`

### 2. `src/pages/KYSectionForm.tsx`
- Import and use `useEffectiveCohort()` for `cohortType` (line 38)
- Replace `edition?.cohort_type` with `effectiveCohortType`

### 3. `src/pages/MyKYForm.tsx`
- Import and use `useEffectiveCohort()` for `cohortType` (line 22)
- Replace `edition?.cohort_type` with `effectiveCohortType`

### 4. `src/components/home/OnboardingStepsSection.tsx`
- Currently hides the KY card when `ky_form_completed` is true — this is correct behavior but means after a reset, the card should reappear. No changes needed here (the reset already clears that flag).

All four changes follow the same pattern already used in `Home.tsx` and `UpcomingSessionsSection.tsx`: import `useEffectiveCohort`, destructure `effectiveCohortType`, and use it wherever `edition?.cohort_type` was hardcoded.


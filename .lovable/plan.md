
# Replace Section Sheets with Full-Page Premium Form UI + Remove KY Form Gate

## Overview

Two key changes:
1. **Remove the KY form gate** -- new signups will no longer be blocked from accessing the app. The "Complete Your Profile" card on the homepage is the voluntary entry point.
2. **Replace the drawer/dialog (KYSectionSheet)** with a **full-page form experience** using the existing premium KYFormCard UI (gold glowing card, Q.XX numbering, card stack animations, segmented progress bar, Back/Next pill buttons).

## What Changes

### 1. Remove KY Form Gate from App Routes

The `KYFormCheck` wrapper currently forces users to `/kyf` if `ky_form_completed` is false. This will be removed so new signups land directly on the homepage after profile setup. The "Complete Your Profile" card on the homepage becomes the sole entry point for KY forms.

### 2. New Full-Page Section Form (`src/pages/KYSectionForm.tsx`)

A new page component that renders the old premium KYFormCard UI but is driven by `KYSectionConfig` data for a single section. Features:

- Full-screen centered layout with gold blur background effects
- `KYFormCardStack` with card-stack depth animation
- Each step rendered inside a `KYFormCard` with:
  - Segmented multi-color progress bar (orange, gold, yellow)
  - `Q.XX` question number label
  - Bold step title
  - Form fields using existing field components
- Step 0 = Section intro (KYSectionIntro rendered inside a KYFormCard)
- Navigation: Ghost "Back" button + solid rounded "Next/Complete" pill button
- Saves progress on each "Next", saves + updates `ky_section_progress` on "Complete"
- Exit dialog with "Save & Leave" option
- Route: `/ky-section/:sectionKey` (e.g., `/ky-section/filmmaker_profile`)

### 3. Update KYProfileCard Navigation

Instead of opening a `KYSectionSheet` (drawer/dialog), clicking a section navigates to `/ky-section/:sectionKey`. The `KYSectionSheet` import and state management are removed from this component.

### 4. Route Changes in App.tsx

- Remove `KYFormCheck` wrapper from the main app routes
- Remove the `/kyf` redirect route (no longer needed since there's no gate)
- Add new route: `/ky-section/:sectionKey`
- Keep old `/kyf-form`, `/kyc-form`, `/kyw-form` routes as legacy fallbacks

## Technical Details

### Files to Create

| File | Description |
|------|-------------|
| `src/pages/KYSectionForm.tsx` | Full-page form using KYFormCard UI, driven by KYSectionConfig |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Remove KYFormCheck wrapper, remove /kyf redirect, add /ky-section/:sectionKey route |
| `src/components/home/KYProfileCard.tsx` | Navigate to /ky-section/:key instead of opening KYSectionSheet |

### User Flow After Changes

```text
New Signup --> Auth --> Profile Setup --> Homepage (no KY gate!)
                                           |
                                           v
                                  "Complete Your Profile" card
                                           |
                                  Click "Start now >" on Section 1
                                           |
                                           v
                                  /ky-section/filmmaker_profile
                                  (Full-page premium card form)
                                  Q.01 General Details
                                  Q.02 Personal Details
                                  Q.03 Proficiency Level
                                  Q.04 Understanding You
                                           |
                                  [Complete] --> saves + navigates home
                                           |
                                  Section 1 shows checkmark, Section 2 unlocks
                                           |
                                  Click "Continue >" on Section 2
                                           |
                                           v
                                  /ky-section/casting_form
                                  (Same premium card UI)
                                  ...and so on
```

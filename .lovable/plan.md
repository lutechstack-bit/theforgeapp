

# Fix Post-Login Flow: Remove KY Form Gate + Add Welcome Animation

## Problem
After completing Profile Setup, users are being redirected to the old KY forms (`/kyf-form`, `/kyc-form`, `/kyw-form`) instead of going straight to the homepage. The user wants:
1. Profile Setup completion leads to the "Welcome to Forge" celebration animation
2. After the animation, users land on the homepage
3. KY forms are accessed voluntarily from the homepage card, not forced

## Changes

### 1. ProfileSetup.tsx -- Navigate to Welcome page instead of KY forms
After successful profile save, navigate to `/welcome` instead of the cohort-specific KY form routes. Remove the entire cohort switch block.

**Before:**
```
switch (selectedEdition?.cohort_type) {
  case 'FORGE': navigate('/kyf-form'); break;
  case 'FORGE_CREATORS': navigate('/kyc-form'); break;
  case 'FORGE_WRITING': navigate('/kyw-form'); break;
  default: navigate('/');
}
```

**After:**
```
navigate('/welcome');
```

### 2. Welcome.tsx -- Replace simple Welcome with the KYFormCompletion celebration
Replace the current plain Welcome page content with the existing `KYFormCompletion` component (confetti, glow, "Welcome to The Forge!" message). This reuses the premium celebration animation that was already built.

The Welcome page will:
- Show the confetti celebration with "Welcome to The Forge!"
- Display two buttons: "View Your Profile" and "Explore Dashboard"
- Use the cohort-aware label (The Forge / The Forge Writing / The Forge Creators)

### 3. App.tsx -- Remove dead KYFormCheck code
Delete the unused `KYFormCheck` component (lines 170-213) since it's defined but never used in routes. Clean up dead code.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ProfileSetup.tsx` | Navigate to `/welcome` instead of KY form routes |
| `src/pages/Welcome.tsx` | Use `KYFormCompletion` animation instead of plain welcome UI |
| `src/App.tsx` | Remove unused `KYFormCheck` component |

## Technical Notes
- No database changes needed
- The KYFormCompletion component already exists with confetti, gold glow, and cohort-aware labels
- KY forms remain accessible voluntarily via the "Complete Your Profile" card on the homepage
- The Welcome route is already protected with `ProfileSetupCheck`, so only users with completed profile setup can see it

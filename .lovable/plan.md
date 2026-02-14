

# Replace Old Onboarding Card with KYProfileCard Only

## Problem

The current homepage shows TWO separate components:
1. An old "Complete Your Onboarding" card with "Set up your profile" and "Add your profile photo" steps
2. The new `KYProfileCard` rendered below it

The screenshot reference shows only ONE card: "Complete Your Profile" with just the KY sections (Filmmaker Profile, Casting Form, Hospitality Details). The old profile setup/photo steps should not appear.

## Solution

Replace `OnboardingStepsSection` to simply render the `KYProfileCard` directly, removing the old steps entirely.

## Technical Details

### `src/components/home/OnboardingStepsSection.tsx` (UPDATE)

Strip out all the old onboarding steps logic (profile setup, profile photo, the accordion header, the progress bar). The component becomes a thin wrapper that:

1. Checks if `ky_form_completed` is true -- if so, returns `null`
2. Checks if `profile_setup_completed` is true -- KY card only shows after profile setup is done
3. Otherwise renders `<KYProfileCard />` directly (no wrapper card, no extra steps)

The component keeps accepting `title`/`subtitle` props for compatibility with the homepage sections system, but the KYProfileCard uses its own "Complete Your Profile" title internally.

This means:
- No more "Set up your profile" step row
- No more "Add your profile photo" step row  
- No more collapsible accordion header
- Just the clean KYProfileCard matching the screenshot

| File | Action |
|------|--------|
| `src/components/home/OnboardingStepsSection.tsx` | UPDATE -- Replace with thin wrapper that renders KYProfileCard only |


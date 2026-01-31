

# Auto-Set Profile Avatar from KY Form Headshot Photo

## Summary
Automatically use the front-facing headshot photo uploaded during the KY Form (KYF) as the user's profile avatar. This eliminates the need for users to upload a separate profile photo if they've already provided their headshot in the form.

---

## Current Flow

1. User signs up and completes Profile Setup (may or may not upload avatar)
2. User fills out KYF Form and uploads front headshot (`headshot_front_url`)
3. Profile avatar and KYF headshot remain separate - user has to manually sync them

## New Flow

1. User signs up and completes Profile Setup
2. User fills out KYF Form and uploads front headshot
3. On KYF Form submission, the front headshot automatically becomes the profile avatar (if no avatar already exists, or always sync it)

---

## Implementation Details

### File: `src/pages/KYFForm.tsx`

**Location:** `handleSubmit` function (around line 314-375)

**Change:** After saving KYF responses, also update the profile's `avatar_url` with the `headshot_front_url`:

```tsx
// Inside handleSubmit, after upserting kyf_responses
const { error: profileError } = await supabase
  .from('profiles')
  .update({ 
    ky_form_completed: true, 
    kyf_completed: true,
    // Auto-set avatar from headshot if headshot exists
    ...(formData.headshot_front_url && { avatar_url: formData.headshot_front_url })
  })
  .eq('id', user.id);
```

This will:
- Set the avatar to the front headshot if one was uploaded
- Only update avatar if `headshot_front_url` exists (won't overwrite with null)

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/KYFForm.tsx` | In `handleSubmit`, add `avatar_url: formData.headshot_front_url` to the profile update |

---

## Behavior

| Scenario | Result |
|----------|--------|
| User uploads headshot in KYF | Avatar auto-set to headshot |
| User already had avatar from Profile Setup | Avatar overwritten with headshot (newer photo) |
| User later updates avatar in Profile | Works as before, no interference |
| KYW/KYC forms (no photos) | No change - avatar remains as-is |

---

## Technical Notes

- Only applies to FORGE cohort (Filmmakers) since they're the only ones with photo uploads in their form
- KYW (Writers) and KYC (Creators) forms don't collect photos, so no changes needed there
- The headshot is already being uploaded to storage via `PhotoUploadField`, so we're just reusing the URL


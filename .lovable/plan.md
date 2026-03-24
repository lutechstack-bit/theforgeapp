

# Add Change Password to Profile Edit Sheet

## What
Add a "Change Password" section at the bottom of the ProfileEditSheet, before the Save/Cancel buttons. Uses Supabase's `updateUser({ password })` — no database changes needed.

## Changes — `src/components/profile/ProfileEditSheet.tsx`

1. **Add state**: `currentPassword`, `newPassword`, `confirmPassword`, `showPasswordSection` (toggle), `changingPassword`
2. **Add collapsible section** before the Actions div (~line 593):
   - A button/link "Change Password" that toggles `showPasswordSection`
   - When expanded: current password field (optional, for UX confidence), new password + confirm password fields with show/hide toggles
   - "Update Password" button that calls `supabase.auth.updateUser({ password: newPassword })`
   - Validation: min 6 chars, passwords must match
   - Success toast + collapse section on success
3. **Styling**: Uses existing `FloatingInput`, `Button`, icons (`Lock`, `Eye`, `EyeOff`) — consistent with the auth page pattern

### No database changes, no new files
All within the existing ProfileEditSheet component using `supabase.auth.updateUser()`.


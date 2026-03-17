

# Fix Profile Edit/Settings & Admin User Edit

## Issues Identified

1. **Profile Edit and Settings both open the same sheet**: The pencil icon on the profile hero calls `onEdit` which opens `ProfileEditSheet`. The "Settings" dropdown item navigates to `/profile?action=edit`, which also opens the same `ProfileEditSheet`. Both paths lead to the identical form — this is by design currently, but you want them differentiated.

2. **Admin page fields editable**: The `EditUserDialog` in AdminUsers already has editable fields (name, phone, city, edition, specialty, payment status), but it's missing several useful fields. I'll add more editable fields to make it more comprehensive.

## Plan

### 1. Differentiate "Edit" vs "Settings" on Profile Page

Currently both open `ProfileEditSheet`. I'll keep the pencil icon on the avatar opening the edit sheet (for quick profile edits like photo/name/bio), and change "Settings" in the dropdown to navigate directly to `/profile` (the profile page itself) instead of opening the edit sheet — OR more usefully, make "Settings" open the edit sheet scrolled to the contact/social section.

**Recommended approach**: Keep both opening the edit sheet but rename "Settings" to "Edit Profile" in the dropdown so it's clear they do the same thing. This avoids confusion without requiring a separate settings page.

### 2. Enhance Admin EditUserDialog with More Editable Fields

Add these missing fields to the `EditUserDialog`:
- **Email** (display only, already there)
- **Bio** (new, editable textarea)
- **Tagline** (new, editable)
- **Instagram Handle** (new, editable)
- **Twitter Handle** (new, editable)
- **Profile Setup Completed** toggle
- **KY Form Completed** toggle

| File | Change |
|------|--------|
| `src/components/layout/TopProfileDropdown.tsx` | Rename "Settings" to "Edit Profile" with Edit icon instead of Settings icon, to make it clear it opens the profile editor |
| `src/pages/admin/AdminUsers.tsx` | Add more editable fields to `EditUserDialog`: bio, tagline, instagram_handle, twitter_handle, profile_setup_completed, ky_form_completed. Include them in formData state and the update mutation. Make dialog scrollable for the extra fields. |


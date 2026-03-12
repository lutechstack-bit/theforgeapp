

# Reset KY Forms for Admin Account

## What needs to be reset

The admin account (`admin@admin.in`, ID: `69ada39f-cbd8-4d02-b653-d60355ca9764`) currently has:
- `ky_form_completed: true`
- `ky_section_progress: {casting_form: true, filmmaker_profile: true, hospitality: true}`
- Existing KYF response (1 row)
- Existing KYC response (1 row)
- No KYW response

## Plan

Create a small edge function `reset-ky-forms` (admin-only) that:

1. **Resets the profile flags** — sets `ky_form_completed = false` and `ky_section_progress = {}` for the calling admin user
2. **Deletes all KY responses** — removes rows from `kyf_responses`, `kyc_responses`, and `kyw_responses` for that user
3. Returns a success message

Then call it immediately to perform the reset.

## File
- `supabase/functions/reset-ky-forms/index.ts` — new edge function (deploy + call)

After the reset, you can use the Cohort Switcher to change cohorts and test each form (KYF for Filmmaking, KYC for Creators, KYW for Writing).


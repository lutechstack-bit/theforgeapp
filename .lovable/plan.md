

# Reset Onboarding Profile for All Users

## What will be reset

Run a single database update on the `profiles` table for **all 138 users** to clear:

| Field | Current | After Reset |
|-------|---------|-------------|
| `profile_setup_completed` | `true` (27 users) | `false` |
| `ky_form_completed` | `true` (19 users) | `false` |
| `kyf_completed` | `true` (19 users) | `false` |
| `ky_section_progress` | `{}` or filled | `{}` (empty JSON) |

After this, every user will see the Profile Setup flow on login, followed by the new section-based KY form experience.

## Technical Details

- Single SQL migration:
```sql
UPDATE profiles
SET profile_setup_completed = false,
    ky_form_completed = false,
    kyf_completed = false,
    ky_section_progress = '{}'::jsonb;
```
- No schema changes needed
- No code changes needed -- the existing auth flow already redirects users to Profile Setup when `profile_setup_completed = false`
- Users currently logged in will see the change on their next page load (auth context re-fetches profile)


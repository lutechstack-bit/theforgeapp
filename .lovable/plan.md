

# Reset KY Forms for All Users

## What This Does
Runs a database migration to reset all users' KY form progress, forcing everyone to go through the updated premium form flow again.

## SQL Migration

```sql
UPDATE public.profiles
SET
  ky_form_completed = false,
  kyf_completed = false,
  ky_section_progress = '{}'::jsonb;
```

This sets three columns for every row in `profiles`:
- `ky_form_completed` → `false`
- `kyf_completed` → `false`
- `ky_section_progress` → empty JSON object `{}`

## Impact
- All users will see the "Complete Your Profile" KYProfileCard on their homepage again
- Section progress resets so every section shows as incomplete and must be filled from scratch
- No structural/schema changes -- just a data update

## Files Changed
None -- this is a data-only migration executed via the database migration tool.


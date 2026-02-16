

# Fix "Start Now" Routing to New KY Forms

## Problem
The "Today's Focus" card on the homepage has a "Start Now" button that navigates to the **old** KY form routes (`/kyf-form`, `/kyc-form`, `/kyw-form`). These need to point to the **new** section-based KY flow instead.

## Root Cause
The `today_focus_cards` database table stores the route for each focus card. The current values are:

| Cohort | Current Route (old) | New Route |
|--------|-------------------|-----------|
| FORGE | `/kyf-form` | `/ky-section/filmmaker_profile` |
| FORGE_CREATORS | `/kyc-form` | `/ky-section/creator_profile` |
| FORGE_WRITING | `/kyw-form` | `/ky-section/writer_profile` |

## Fix
Run 3 SQL updates on the `today_focus_cards` table to change the `cta_route` for each cohort's focus card to point to the first section of the new KY flow.

No code changes needed -- only database updates.

## Technical Details

```sql
UPDATE today_focus_cards SET cta_route = '/ky-section/filmmaker_profile' WHERE id = '7be40ffe-0dcc-4978-84ba-0e71562d52a0';
UPDATE today_focus_cards SET cta_route = '/ky-section/creator_profile' WHERE id = '466f555d-cb6c-41a8-a625-1bccf75886a7';
UPDATE today_focus_cards SET cta_route = '/ky-section/writer_profile' WHERE id = '0d727730-daf3-495b-9812-810a03263a07';
```

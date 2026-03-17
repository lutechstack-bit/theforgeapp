

# Fix: Delete User Failing Due to Missing `payment_config` Cleanup

## Problem
The `delete-user` edge function returns 400 because the new `payment_config` table has a foreign key referencing `profiles(id)`. The function tries to delete the profile row, but `payment_config` still has a row pointing to it.

## Fix
Add `payment_config` to the `tablesToClean` array in `supabase/functions/delete-user/index.ts`, **before** the `profiles` entry.

Also add it to `supabase/functions/bulk-delete-users/index.ts` if it has a similar cleanup list.

| File | Change |
|------|--------|
| `supabase/functions/delete-user/index.ts` | Add `{ table: 'payment_config', column: 'user_id' }` before `user_roles` |
| `supabase/functions/bulk-delete-users/index.ts` | Same addition if applicable |

One-line fix per file. No database migration needed.


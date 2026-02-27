

# Full Application Audit: Backend + Frontend Integration

## Summary

The application is a cohort-based learning platform (LevelUp/Forge) with 56 database tables, 6 edge functions, ~25 pages, and extensive admin tooling. Overall architecture is solid. Below are all issues found, categorized by severity.

---

## CRITICAL Issues (Must Fix)

### 1. Edge Function `calendar-event` Not Deployed — Returns 404
- **Backend**: The function exists in code (`supabase/functions/calendar-event/index.ts`) but is NOT registered in `supabase/config.toml` and has never been deployed (no logs, curl returns 404).
- **Frontend impact**: Apple Calendar button across 5 components generates a `webcal://` URL pointing to this non-existent endpoint. Clicking "Apple Calendar" anywhere in the app does nothing or errors silently.
- **Fix**: Add `[functions.calendar-event]` with `verify_jwt = false` to `config.toml`. Also remove the `Content-Disposition: attachment` header from the function — it forces download even via `webcal://`.

### 2. Edge Functions `delete-user` and `bulk-delete-users` Not Registered in config.toml
- **Backend**: These functions exist in code and are invoked from `AdminUsers.tsx` via `supabase.functions.invoke()`, but `config.toml` only registers `create-user`, `bootstrap-admin`, and `setup-test-data`.
- **Frontend impact**: Admin user deletion may fail with auth errors since JWT verification defaults aren't properly configured.
- **Fix**: Add both to `config.toml` with `verify_jwt = false` (they validate auth in code).

### 3. CORS Headers Incomplete on All Edge Functions
- All 6 edge functions use a minimal CORS header set:
  ```
  'authorization, x-client-info, apikey, content-type'
  ```
- Missing required headers: `x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version`
- **Impact**: Functions may fail on certain browsers/clients that send these extra headers.
- **Fix**: Update CORS headers in all 6 functions to the full set.

---

## HIGH Priority Issues

### 4. `notifications` Table: `user_id` Column Is Nullable
- The `user_id` column on `notifications` is `nullable: YES`, but RLS policies use `auth.uid() = user_id`. If `user_id` is NULL, the policy comparison fails unpredictably.
- **Fix**: Add a NOT NULL constraint via migration, or handle NULL user_id rows as global notifications only.

### 5. `app_changelog` Table Has No SELECT Policy for Non-Admins
- Only has an `ALL` policy for admins. Regular users and the public cannot read changelog entries.
- **Frontend**: If the Updates page queries this table, authenticated non-admin users see nothing.
- **Fix**: Add a public SELECT policy if changelog should be visible to users.

### 6. Edge Function `setup-test-data` Has No Auth Check
- The function creates users and writes data but has `verify_jwt = false` and no authorization check in code.
- **Security risk**: Anyone can call this endpoint and create test users/data in production.
- **Fix**: Add admin auth check in code, or remove/disable the function in production.

### 7. Edge Function `bootstrap-admin` Has No Rate Limiting
- `verify_jwt = false` and accessible publicly. While it checks for existing admins, the `force: true` flag bypasses that check.
- **Security risk**: Anyone who knows the endpoint can create an admin account with `force: true`.
- **Fix**: Remove `force` flag support, or add a secret-based guard.

---

## MEDIUM Priority Issues

### 8. `cohort_groups` Table — Only 1 RLS Policy (SELECT Only)
- No INSERT/UPDATE/DELETE policies. Admin management of cohort groups will fail silently.
- The table has a trigger (`create_cohort_group_for_edition`) that auto-inserts via SECURITY DEFINER, so auto-creation works, but manual admin edits won't.

### 9. Deprecated `serve()` Import in Edge Functions
- All edge functions use `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"` — an older pattern.
- The `calendar-event` function uses the newer `Deno.serve()` pattern. Mixing patterns is fine but the older functions should be updated when possible.

### 10. `CalendarSyncModal` Only Syncs First Event
- The modal says "Add all upcoming events (N events)" but `getFirstEvent()` only adds the first one. Google/Apple/Outlook/Yahoo all get just one event.
- **Fix**: Either update copy to say "Add next upcoming event" or implement multi-event add.

### 11. Profile `tagline` Column Not Exposed in AuthContext Profile Type
- The `profiles` table has a `tagline` column, but the `Profile` interface in `AuthContext.tsx` doesn't include it. Profile page may not be able to display/edit tagline.

---

## LOW Priority / Informational

### 12. `downloadICSFile` and `openICSFile` Are Now Unused Exports
- No component imports either function anymore (all switched to URL redirects). These are dead code in `calendarUtils.ts`.

### 13. `generateICSContent`, `generateICSFeed`, `downloadAllEventsICS` — Dead Code
- Same situation — these ICS generation functions are no longer used by any component.

### 14. Edge Function Logs Are Empty
- No recent logs for any edge function, suggesting they haven't been called recently (or aren't deployed). Could be normal if the app is in development.

### 15. All RLS Tables Have RLS Enabled
- Confirmed: zero tables with RLS disabled. This is good security posture.

---

## Recommended Fix Order

1. Register `calendar-event`, `delete-user`, `bulk-delete-users` in `config.toml` and deploy
2. Fix CORS headers across all edge functions
3. Remove `Content-Disposition: attachment` from `calendar-event`
4. Add SELECT policy for `app_changelog`
5. Make `notifications.user_id` NOT NULL
6. Secure `setup-test-data` and `bootstrap-admin` endpoints
7. Clean up dead code in `calendarUtils.ts`


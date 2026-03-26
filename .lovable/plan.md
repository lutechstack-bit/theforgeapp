

# Fix Misleading "Logins" KPI — Track Session Restores

## Problem
The "Logins" KPI only counts explicit `signInWithPassword` calls. Users like Nilesh and Priyadarshan who return to the app with a persisted session (auto-refreshed token) are never counted as "logged in" — even though they actively used the app. This makes the Logins card misleading.

## Root Cause
`logLoginEvent()` is only called inside `signIn()` in AuthContext. When a user opens the app and their session is automatically restored by Supabase, no login event is recorded.

## Fix — `src/contexts/AuthContext.tsx`

Log a `session_start` event when a user's session is successfully restored on app initialization (inside `initializeAuth`). This captures returning users who didn't explicitly sign in.

- After the existing session is detected and user data is loaded, call `logLoginEvent(session.user.id)` (or a new `logSessionStart` variant)
- This fires once per app open, not on every tab focus

## Fix — `src/hooks/useActivityTracker.ts`

Add a `logSessionStart` export that logs event_type `login` with a metadata flag `{ type: 'session_restore' }` to distinguish from explicit logins if needed.

## Fix — `src/pages/admin/AdminActivity.tsx`

No changes needed — `session_restore` events use `event_type: 'login'` so the existing KPI card and popup will automatically include them.

## Result
The Logins KPI will now show all users who opened the app in a given period, whether they typed their password or had a restored session.


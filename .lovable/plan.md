
## What’s happening (in plain language)

On refresh, the app is not “remembering” that you’re logged in. That’s why:
- You first see the branded **Loading…** screen for a long time, and then
- If you go to **/auth**, you see the **login form** (meaning the app currently thinks you are logged out).

This is not just a UI problem. It’s the login session restore path on refresh being unreliable/slow, and in your case it fails every time.

## What I found in the codebase that can cause exactly this

### 1) A component is forcing a slow “who is the user?” backend call on every page load
`src/components/feedback/MarkerProvider.tsx` calls:

- `supabase.auth.getUser()` on mount (this is a network request), and
- it also subscribes to `onAuthStateChange` again (separate from `AuthContext`),
- and it fetches `profiles.full_name` with `.single()` without any timeout wrapper.

Your backend auth logs show very slow auth endpoints (tens of seconds). That makes `getUser()` a risky call during startup and can interfere with session restore/refresh flows.

### 2) Session + User-data gating can keep you on Loading too long
`src/App.tsx` shows the full-screen `LoadingScreen` in multiple guards when:
- `loading` (session init) is true, or
- `userDataLoading && !profile` is true.

There is currently **no “user data gate failsafe UI”** at the route-guard level (only HomeJourneySection has a retry UI). So if profile loading is slow/retrying, the whole app can look stuck.

### 3) The backend is sometimes slow on `/user` and `/token`
Your auth logs show `/user` taking ~25 seconds in some cases, and `/token` taking ~51 seconds in a recent sample.
Even if the backend is fine most of the time, this means the app must be designed to:
- restore from local session instantly, and
- avoid network-based auth calls during boot, and
- never block the whole app indefinitely.

## Goals of the fix
1) Refresh should **keep users logged in**.
2) If the backend is slow, the app should **still render** and show a clear “Retry” / “Reconnect” UI, not hang.
3) Remove “extra auth calls” during boot so 1000+ users aren’t all hitting auth endpoints unnecessarily.

---

## Implementation plan (what I will change)

### A) Make startup “local-first”: restore session instantly, validate in background
**Files:** `src/contexts/AuthContext.tsx`

Changes:
1) Add a small helper to read the stored session from browser storage immediately (local-first).
2) On app start:
   - hydrate `session`/`user` from stored session immediately (so refresh stays logged in)
   - then call `supabase.auth.getSession()` in the background to confirm/refresh
3) Ensure that if a slow refresh completes later, the app can “recover” without being stuck in a previous timed-out state.

Outcome:
- Even if backend auth endpoints are slow, refresh won’t dump users back to login.

### B) Remove the startup auth network call from MarkerProvider (major)
**File:** `src/components/feedback/MarkerProvider.tsx`

Changes:
1) Stop calling `supabase.auth.getUser()` on mount (this is the slow network call).
2) Stop creating an independent auth subscription here.
3) Instead, use the already-centralized auth state from `useAuth()`:
   - `user` from AuthContext
   - `profile.full_name` from AuthContext (or fetch it via AuthContext once, with timeouts)
4) If Marker needs extra fields and they are missing, fetch them with:
   - `promiseWithTimeout` / `promiseWithSoftTimeout`
   - `.maybeSingle()` (avoid `.single()` which throws and can create noisy failure paths)

Outcome:
- Less backend load.
- Less chance of session restore / token refresh race conditions.
- Much faster and more stable refresh.

### C) Add an app-level “User Data Recovery” screen for route guards (no more infinite Loading)
**File:** `src/App.tsx` (and optionally a small reusable component like `UserDataRecovery`)

Changes:
1) For guards that currently do:
   - `if (userDataLoading && !profile) return <LoadingScreen />;`
2) Replace with:
   - Show `LoadingScreen` only for a short, defined window (example: 8–12 seconds)
   - If it exceeds that window OR if `userDataTimedOut` / `userDataError` is present:
     - show a recovery UI with buttons:
       - “Try Again” (calls `retryUserData`)
       - “Clear Cache & Reload” (calls the existing safe clear/reload flow)
       - “Go to Login” (optional, if session really is invalid)
3) This ensures the app *always* lands in one of:
   - The app
   - Login
   - A recovery screen (with actions)

Outcome:
- No more “stuck on Loading for 60+ seconds” with no explanation.

### D) Cache minimal profile/edition locally to improve refresh UX under slow backend
**File:** `src/contexts/AuthContext.tsx`

Changes:
1) Store a minimal snapshot in localStorage keyed by user id:
   - `profile_setup_completed`, `ky_form_completed`, `edition_id`, `full_name`, `avatar_url`, `unlock_level`, etc.
   - `edition.cohort_type`, `forge_start_date`, `forge_end_date`
2) On refresh, if session exists but backend profile fetch is slow:
   - hydrate UI from cache
   - refresh in background and reconcile

Outcome:
- Even with backend slowness, users see the real UI immediately after refresh.

### E) Ensure timeouts are used everywhere we still do critical boot-time reads
**Files:** 
- `src/components/feedback/MarkerProvider.tsx` (after refactor)
- Any other “always-on” boot components that query backend (RoadmapSidebar, etc.)

Changes:
- Wrap critical reads with `promiseWithTimeout` / `promiseWithSoftTimeout`
- Avoid `.single()` where missing rows are possible; prefer `.maybeSingle()`

Outcome:
- No indefinite pending requests that keep the UI in limbo.

---

## Backend checks (to confirm there isn’t a deeper backend misconfiguration)
Even though the main issue is client resilience, I’ll also do these checks:
1) Run backend linter/security scan to ensure there isn’t an RLS policy or auth config causing unpredictable reads.
2) Validate `profiles` access path:
   - users must be able to read their own profile quickly and reliably
3) If we find “missing profile rows” as a real issue for some users:
   - add a safe “ensure profile exists” step on login (implemented in client or via a backend function)
   - without touching reserved auth schemas

---

## Testing plan (so we’re confident for 1000+ users)

### 1) Manual end-to-end tests (highest priority)
- Login → land on Home
- Refresh 10 times:
  - should stay logged in every time
  - should never get stuck on Loading > 12 seconds
- Test on:
  - Safari Mac
  - Chrome/Edge desktop
  - Mobile Safari + Chrome (real device)
- Simulate slow network:
  - confirm the app shows recovery UI with Retry
  - retry works without needing a full reinstall/clear

### 2) Automated tests (lightweight but valuable)
Add a test setup (Vitest + Testing Library) and create:
- Auth boot test: “hydrates session from storage → renders app”
- Auth slow backend test: “network auth call delayed → app still shows recovery UI / stays logged”
- Route guard test: “userDataLoading long → recovery UI appears”

---

## Notes about the deployment error you saw (429)
The `PutObject 429 Reduce your concurrent request rate` is a hosting upload rate-limit issue. It can cause publishes to fail temporarily. Once we fix the refresh/login behavior, if you still see publish failures we’ll re-run publish after a short wait. This is separate from the session/refresh bug.

---

## Deliverable outcome
After implementing the above:
- Refresh will keep users signed in.
- If backend is slow, users will see either the app (from cache) or a clear recovery screen, never an endless Loading.
- Startup will make fewer auth calls, improving reliability under high traffic.

## Technical appendix (for reference)
Key files involved:
- `src/contexts/AuthContext.tsx` (session restore logic, user/profile/edition fetch, retries)
- `src/components/feedback/MarkerProvider.tsx` (remove `auth.getUser()` network call at boot; use AuthContext instead)
- `src/App.tsx` (route guards: replace indefinite LoadingScreen with timed recovery UI)
- Existing timeout utilities already in use: `src/lib/promiseTimeout.ts`

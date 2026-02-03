
## What’s actually happening (based on codebase research)

On the production domain, you’re seeing the **full-screen Forge LoadingScreen** and it **never resolves**. That screen is rendered whenever `useAuth().loading` is `true` (see `src/App.tsx`: `ProtectedRoute`, `ProfileSetupCheck`, `KYFormCheck`, `AppRoutes`).

Even though we added a watchdog (`AUTH_INIT_TIMEOUT_MS = 8000`) in `src/contexts/AuthContext.tsx`, you are not reaching the recovery UI—meaning that **in production, auth initialization can still get stuck with `loading=true`**.

In the current AuthProvider flow, `loading` is tied to “auth + profile/edition fetch”. If any part of that chain stalls in production (session restore, profile fetch, edition fetch, storage issues, network hangs), the UI stays gated behind `LoadingScreen`.

This is exactly the failure mode you’re describing: refresh → auth init starts → the app waits forever → you never reach routes/content.

## Fix approach (make “infinite LoadingScreen” impossible)

We will **separate “auth session initialization” from “user data (profile/edition) loading”**, and add **hard timeouts** around session restore + user data fetch so the app always progresses.

Key idea:
- `loading` should represent only “do we know if there is a signed-in session?”
- profile/edition fetch should **never** block the entire application from rendering indefinitely
- if profile/edition takes too long, we show the app (or show a targeted message), not a permanent global loader

## Planned changes (code)

### 1) AuthContext: split loading into two phases + add session timeout
**File:** `src/contexts/AuthContext.tsx`

**Add:**
- `authLoading` (or keep `loading` but redefine it strictly as “session init”)
- `userDataLoading` (new boolean for profile/edition fetch)
- `initStage` (optional string for diagnostics: `"boot" | "session" | "userData" | "ready" | "timedOut"`)

**Change flow:**
- Start `authLoading=true` on mount.
- Wrap `supabase.auth.getSession()` in `withTimeout(...)` as well (right now only profile/edition are protected).
- As soon as we determine session state (session exists or not), set:
  - `authLoading=false` (this unblocks routing)
- Then fetch profile/edition **in the background**:
  - set `userDataLoading=true`
  - call `fetchUserDataWithTimeout(user.id)` without blocking route rendering
  - finally set `userDataLoading=false`

**Important:** In `onAuthStateChange`, do **not** `await fetchUserDataWithTimeout(...)` before flipping the auth init state. Awaiting in production is a common cause of “stuck forever” if the fetch never resolves.

### 2) App route guards: use the right loading state
**File:** `src/App.tsx`

Update wrappers:
- `ProtectedRoute` should block only on `authLoading` (session init)
- `ProfileSetupCheck` and `KYFormCheck` should consider `userDataLoading`
  - But also must have a timeout fallback: if user data didn’t load, don’t block forever

Recommended behavior:
- If `authLoading` → show `<LoadingScreen />`
- If no user → redirect to `/auth`
- If user exists and `userDataLoading` → show `<LoadingScreen />` **for a short bounded window only** (or show a lighter inline loader)
- If user exists and userData failed/timed out (profile is null after timeout) → render app but show a non-blocking banner/toast: “We couldn’t load your profile, tap to retry”

This prevents the “forever global loader” while still preserving onboarding gating when data is available.

### 3) Make single-row reads safer in user boot path
**File:** `src/contexts/AuthContext.tsx`

Change `.single()` to `.maybeSingle()` for:
- profile fetch
- edition fetch

Reason: `.single()` can throw/produce errors when no row exists, and the boot path should never be brittle. We’ll handle “no profile row yet” gracefully and not block the app.

### 4) Add an app-level failsafe (redundant safety net)
**File:** `src/App.tsx` (or a small new component like `StartupGuard`)

Implement a second failsafe:
- If `authLoading` stays true beyond N seconds (e.g. 10s), render `AuthRecovery` instead of `LoadingScreen`.

This is intentionally redundant: even if something goes wrong inside AuthContext in production, the UI will never be stuck on LoadingScreen forever.

### 5) Improve “recovery” to fix production PWA/cache edge cases
**File:** `src/components/auth/AuthRecovery.tsx` (and reuse existing `clearSessionAndReload`)

Enhance copy + button to explicitly:
- clear session storage + local storage
- unregister service workers
- reload to `/auth`

This is important on the production domain if a stale PWA/service worker/cache creates a loop where session restore never resolves.

## Verification plan (production-focused)

After implementing the above:

1) On production domain, signed-in user:
   - Hard refresh 5–10 times
   - Expected: you should never be stuck on the LoadingScreen indefinitely
   - Worst case: within ~10 seconds you’ll see the recovery UI with a clear action

2) Slow network simulation:
   - Confirm that if profile/edition is slow, the app still becomes usable and does not remain blocked indefinitely

3) Onboarding correctness:
   - Confirm profile setup + KY form redirects still happen once profile loads
   - If profile fails to load, confirm user is not trapped; instead they see an actionable “retry profile load” UI

## Files involved

- `src/contexts/AuthContext.tsx` (primary fix: split loading phases, timeouts, non-blocking user data fetch)
- `src/App.tsx` (use new loading states in guards + add global failsafe)
- `src/components/auth/AuthRecovery.tsx` (stronger recovery messaging/actions)

## Expected outcome

- Refresh on **production domain** will no longer result in an infinite full-screen LoadingScreen.
- If backend/session restore is unhealthy, the user will see a clear recovery screen and can self-repair without getting stuck.
- Normal users will reach content faster because session init will not wait on profile/edition calls.


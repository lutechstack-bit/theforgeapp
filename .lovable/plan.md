
## Goal
Fix the “stuck on Loading…” issue that happens after a hard refresh/reload, where the app never renders routes/content.

## What I found (root cause)
The global loading screen you’re seeing is driven by `useAuth().loading` (from `src/contexts/AuthContext.tsx`), which is used in multiple wrappers in `src/App.tsx`.

In `AuthContext`, the “startup watchdog” timeout (8s) is intended to prevent infinite loading, but it’s currently being cleared too early:

- `onAuthStateChange` clears the watchdog timer immediately (before fetching profile/edition).
- Then it `await`s `fetchUserData()` (profile + edition queries).
- If `fetchUserData()` stalls (slow network, request hang, cached client weirdness), the code never reaches `setLoading(false)`.
- Since the watchdog was already cleared, nothing forces loading to resolve anymore → infinite “Loading…” on refresh.

This explains why you can keep reloading and it stays stuck: the app is waiting for profile/edition fetch to finish, with no fail-safe.

## Fix strategy (high confidence)
1. Keep the watchdog alive until initialization is actually complete (or replace it with a safer “overall init” timeout that cannot be cleared prematurely).
2. Add a separate timeout around profile/edition fetching so it can’t block the whole app forever.
3. Ensure `setLoading(false)` is executed in a `finally` block so loading always resolves (success, error, or timeout).
4. (Optional but recommended) Add lightweight debug logs to pinpoint which step is stalling in production-like conditions.

---

## Implementation details

### A) Update auth initialization flow (AuthContext)
**File:** `src/contexts/AuthContext.tsx`

#### 1) Introduce a “safe init completion” helper
Create a small helper function inside the effect to finish initialization consistently:
- sets `loading` to `false`
- sets `loadingRef.current` to `false`
- clears watchdog timer
- resets `authTimedOut` when appropriate

This avoids missing `setLoading(false)` due to early returns.

#### 2) Do not clear the watchdog at the start of `onAuthStateChange`
Move the watchdog `clearTimeout()` to the end of the init process (when we are sure we’re done), or rely on `loadingRef.current` to make the watchdog harmless if it fires after completion.

#### 3) Add a timeout wrapper for profile/edition fetch
Add a helper like:
- `withTimeout(promise, ms)` implemented via `Promise.race`
- Use it specifically for `fetchUserData(userId)` (or split into `fetchProfile` and `fetchEdition` with independent timeouts)

Behavior:
- If it completes in time: set profile/edition normally.
- If it times out: log a warning and continue (do not block rendering forever).

Recommended timeout values:
- `AUTH_INIT_TIMEOUT_MS` (overall): keep at 8000ms (existing)
- `USER_DATA_TIMEOUT_MS` (profile/edition): 4000–6000ms

#### 4) Prevent duplicate competing initializations
Right now the effect does:
- subscribe to `onAuthStateChange`
- then calls `getSession()`

Both can attempt initialization and both can fetch user data.

Implement a `hasInitializedRef` (boolean) to ensure the “finish init” path runs once:
- First one wins, sets loading false.
- Subsequent auth events should update session/user/profile normally, but shouldn’t re-trigger the init watchdog logic.

#### 5) Ensure `setLoading(false)` runs even if anything throws
Wrap the “init path” in:
- `try { ... } catch { ... } finally { completeInit(); }`

This guarantees the UI can render (or show recovery) instead of freezing forever.

---

### B) Make the user-facing loading screen consistent (optional UX improvement)
This does not fix the infinite loading by itself, but it improves perceived quality.

**Files:**
- `src/components/shared/LoadingScreen.tsx` (new)
- `src/App.tsx` (replace the repeated `Loading...` blocks with `<LoadingScreen />`)

This ensures every place that shows loading uses the same branded UI (logo + “Loading…”).

---

## Testing / Acceptance criteria
1. Log in, land on `/`.
2. Hard refresh (Cmd/Ctrl+Shift+R) multiple times:
   - App should always resolve to content or to the recovery UI (never infinite “Loading…”).
3. Test slow network (browser devtools throttling):
   - If profile/edition fetch is slow, app should still render within the max timeout.
4. Confirm onboarding redirects still work after the changes:
   - `profile_setup_completed` redirect to `/profile-setup`
   - `ky_form_completed` redirect to `/kyf`
5. Verify that the Marker widget change did not regress app boot:
   - It may still 403 until allowed domains are set, but it must not block app rendering.

---

## Risks & mitigations
- **Risk:** If we stop blocking rendering on profile load, some routes might briefly render before redirects.
  - **Mitigation:** Keep blocking behavior but enforce timeout + recovery, or introduce a separate `profileLoading` state if needed later. For now, the timeout + guaranteed completion is the safest minimal change.

---

## Deliverables (what will change)
1. `src/contexts/AuthContext.tsx`
   - Restructured initialization to avoid clearing the watchdog too early
   - Timeout-protected profile/edition fetch
   - Guaranteed `loading` resolution via `finally`
   - Optional debug logs for init steps
2. (Optional) `src/components/shared/LoadingScreen.tsx` + `src/App.tsx`
   - Consistent branded loading UI across all wrappers

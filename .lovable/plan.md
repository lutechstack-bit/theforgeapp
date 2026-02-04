
## Re-stating the problem (what you’re seeing)
- You log in and the app works.
- As soon as you refresh, you either:
  - get stuck on the branded loading screen for 60s+, and/or
  - end up effectively logged out (going to `/auth` shows the login form), and/or
  - see “glitchy” placeholder blocks on Home that never resolve (Journey section skeleton blocks).

This is severe because it means the app is not reliably restoring the logged-in session and/or is getting stuck during boot-time data loading.

## What I found in the codebase (evidence)
### Evidence A — Auth boot keeps repeating (should never happen)
Your console logs show this pattern repeating many times within the same page load:
- `[Auth] Hydrating session from localStorage (local-first)`
- `[Auth] Starting initial session check`
- `[Auth] Auth state change: INITIAL_SESSION`
- `[Auth] Initial session check timed out after 3000ms`

This repetition strongly indicates the AuthProvider “boot” effect is re-running multiple times.

### Evidence B — AuthProvider boot effect is accidentally re-running
In `src/contexts/AuthContext.tsx`, the “boot” `useEffect` depends on `fetchUserDataInBackground`.

But `fetchUserDataInBackground` currently depends on `hydratedFromCache` (a React state value).  
Inside `fetchUserDataInBackground`, it eventually calls `setHydratedFromCache(false)` after a successful fetch.

That creates a loop:
1) boot effect runs → hydrates cache → triggers background fetch  
2) background fetch succeeds → sets `hydratedFromCache=false`  
3) `fetchUserDataInBackground` function identity changes  
4) boot effect dependency changes → boot effect runs again  
5) boot timers/subscriptions keep resetting → failsafes may never fire → app appears “stuck”

This also explains the repeated network calls (like repeated `user_roles` checks).

### Evidence C — Home “glitch” blocks are the Journey skeleton stuck
The screenshots show 2–3 large rounded placeholder blocks above “Meet Your Mentors.”  
That layout exactly matches `HomeJourneySection`’s skeleton branch:

- In `src/components/home/HomeJourneySection.tsx`, it shows skeleton when:
  - `userDataLoading || isLoadingDays`

So even if the rest of Home renders, Journey can look “stuck/glitchy” if `roadmap-days` keeps retrying or hangs.

## Do I know what the issue is?
Yes.

The primary root cause of the “refresh stuck / doesn’t restore login reliably” is:
- **AuthContext boot effect re-running repeatedly due to unstable dependencies** (caused by `hydratedFromCache` state being in the dependency chain), which:
  - re-registers auth listeners and restarts boot logic,
  - repeatedly resets failsafe timers,
  - amplifies backend calls and lock contention,
  - leads to long loading and/or session clearing behavior on refresh.

The secondary issue causing the “glitchy stuck blocks” on Home is:
- **Roadmap/Journey loading can remain in “loading+retries” for too long without a Journey-specific timeout UI**, and
- **some always-on sidebar queries are missing request timeouts**, allowing indefinite “pending” fetches in real-world device/network conditions.

---

## Implementation approach (what I will change)

### Phase 1 — Make auth boot deterministic (run once, never loop)
**Target file:** `src/contexts/AuthContext.tsx`

#### 1.1 Stabilize the boot `useEffect` (no dependency-driven reboots)
- Refactor so the “boot” effect runs exactly once (or behaves like once):
  - Avoid including callbacks that change identity in the dependency array.
  - Move stateful flags to refs to prevent callback identity churn.

Concrete changes:
- Replace `hydratedFromCache` state dependency usage inside `fetchUserDataInBackground` with:
  - `hydratedFromCacheRef = useRef(false)`
- Keep any UI-facing “hydrated” display as optional state, but do not use it in dependencies that control initialization.

#### 1.2 Prevent stale/overlapping boot work from racing
- Add a `bootIdRef` or `requestIdRef` and only apply results from the most recent boot/user-data fetch.
- Ensure we never have multiple profile fetch retries running at the same time:
  - before scheduling a retry, clear any existing retry timer (you already do this partially; we’ll ensure it’s airtight).

#### 1.3 Stop resetting global failsafes unintentionally
- Ensure `failsafeTimerRef` is started once and not cleared/restarted by unrelated state changes.
- Keep `hasInitializedRef` strictly tied to session init completion (not affected by user-data hydration toggles).

#### 1.4 Make stored-session hydration more robust
Right now the code assumes the backend client uses a specific localStorage key:
```ts
const SUPABASE_AUTH_STORAGE_KEY = 'sb-tprvyhzpecopryylxznm-auth-token';
```
This is brittle across environments and can break silently if the key format changes.

Change:
- Implement a safer discovery method:
  - Prefer the known key if present
  - Otherwise scan localStorage keys that match `sb-*-auth-token` and choose the one containing a valid session object.
- Add minimal boot diagnostics logs:
  - whether the key existed
  - whether parsing succeeded
  - whether it was considered expired
  - whether the backend client later emitted INITIAL_SESSION / SIGNED_OUT

This will make refresh behavior consistent and debuggable across devices.

#### 1.5 Remove the slow/hanging boot call path if it’s not needed
Today you do both:
- `onAuthStateChange(INITIAL_SESSION...)` (good)
- plus an explicit `getSession()` with a timeout (can hang under lock contention)

Refactor to rely on:
- `onAuthStateChange` as the primary source of truth for the initial session,
- and only run `getSession()` as a delayed “verification” step after boot is stable (or skip it if it’s not providing value).

This reduces the chance of boot-time deadlocks/hangs in real devices.

---

### Phase 2 — Fix the Home “glitch” (Journey skeleton stuck too long)
**Target files:**
- `src/hooks/useRoadmapData.ts`
- `src/components/home/HomeJourneySection.tsx`

#### 2.1 Stop endless “retry cycles” on timeout-like failures
In `useRoadmapData`’s `roadmap-days` query:
- Update `retry` behavior:
  - If error is a timeout (`isTimeoutError`), do **not** auto-retry 2 more times (that extends the skeleton by 30–60s).
  - Instead: fail fast and show the Journey error UI with a Retry button.

#### 2.2 Add Journey-specific loading timeout UI
Even with request timeouts, a query can remain in “pending/retrying” for longer than expected.

Add a simple timer in `HomeJourneySection`:
- If `isLoadingDays` stays true for > 12–15 seconds (and userDataLoading is false):
  - switch from skeleton to a friendly error card:
    - “Couldn’t load your journey yet”
    - “Try again” triggers `invalidateQueries(['roadmap-days', ...])`

This removes the “glitchy stuck blocks” perception.

---

### Phase 3 — Add missing timeouts to always-on sidebar queries (prevent hidden hangs)
**Target file:** `src/components/roadmap/RoadmapSidebar.tsx`

RoadmapSidebar runs multiple queries and currently does not wrap them with `promiseWithTimeout`.

Changes:
- Wrap each backend read with `promiseWithTimeout(..., 12000, 'label')`.
- Add reasonable `staleTime` (some of these “mapping ids” queries can be cached for minutes or even Infinity).
- Ensure queries are `enabled` only when they have the required inputs (editionId where needed).

Outcome:
- Side components can never silently hang and degrade the whole UX on slower devices.

---

### Phase 4 — Reduce unnecessary repeat backend calls (load less, break less)
**Target file:** `src/hooks/useAdminCheck.ts`

Current `useAdminCheck` runs a direct request each time user/authLoading changes.

Refactor:
- Switch to React Query with a stable key like `['admin-check', user?.id]`
- Use `staleTime: 5-10 minutes` to avoid re-checking repeatedly during the same session.
- Add a timeout wrapper.

Outcome:
- Fewer calls during refresh and fewer chances of startup congestion.

---

## Backend verification (answering “is there any backend issue?”)
I’ll validate the backend side in two ways:

1) **Data sanity checks (already partially done)**
- Profile exists and has an edition_id
- Edition exists
- Roadmap shared template exists
This indicates the core data is present.

2) **Operational reality**
Even when backend is healthy, real devices can have:
- slow auth token refresh,
- transient network stalls,
- service worker caching edge-cases.

So we make the app resilient so it remains usable even when some calls are slow:
- local-first hydration
- strict timeouts
- no infinite skeletons
- explicit recovery UI

---

## Files that will be changed
1) `src/contexts/AuthContext.tsx`
   - Remove boot effect re-run loop (refactor hydratedFromCache usage to refs)
   - Stabilize boot effect to run once
   - Prevent overlapping boot/userData fetch races
   - Improve stored-session key robustness + add boot diagnostics
   - Reduce reliance on boot-time `getSession()` where it causes hangs

2) `src/hooks/useRoadmapData.ts`
   - Update retry strategy (no long retry loops on timeouts)
   - Ensure query enabling remains correct

3) `src/components/home/HomeJourneySection.tsx`
   - Add Journey-specific timeout -> error card with retry
   - Ensure “loading vs error vs true empty” states remain correct

4) `src/components/roadmap/RoadmapSidebar.tsx`
   - Add timeouts + better caching + safer enabled flags

5) `src/hooks/useAdminCheck.ts`
   - Convert to React Query + timeouts + caching

(If needed based on findings) small adjustments in:
- `src/pages/Home.tsx` to surface Journey load failures more clearly (optional)

---

## Testing plan (practical, thorough, and repeatable)
### A) End-to-end manual tests (must pass)
1) Login → land on Home.
2) Refresh 10 times in a row:
   - Must stay logged in
   - Must not get stuck in branded Loading > 10s
3) While logged in, open `/auth`:
   - Must redirect to `/` (never show login form)
4) Throttle network (Slow 3G):
   - App should still boot (from cache) or show recovery UI
   - No infinite skeletons; Journey should show a Retry card if it can’t load
5) Test on:
   - Desktop Chrome/Edge
   - Desktop Safari
   - Mobile Safari
   - Mobile Chrome

### B) Instrumentation-based verification
- Use a debug flag (example: `?bootDebug=1`) to print a compact boot state:
  - “Stored session found: yes/no”
  - “Auth event sequence: INITIAL_SESSION → …”
  - “Profile fetch status: success/timeout/retries”
This is the fastest way to confirm we truly fixed refresh loops across devices.

### C) Automated tests (focused, high ROI)
If you want, I’ll add a small test harness (unit-level) for:
- Auth boot state machine (no repeated initialization; stable outcomes)
- Route guard behavior when session is present vs missing
- Roadmap timeout UI logic

---

## Expected outcome after implementing
- Refresh works reliably: users stay signed in.
- No more “boot loops” or repeated auth initialization logs.
- If backend/network is slow, users see either:
  - the app (from cache), or
  - a clear recovery UI with Retry
  - never an infinite loading screen
- Home “glitch” placeholders for Journey are replaced with deterministic timeout+retry behavior.

---
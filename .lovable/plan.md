
## What’s actually happening (root cause)
Right now the app **only calls `window.Marker.show()` when a user is authenticated**:

- On the login/public pages, `user === null`
- The current logic runs `window.Marker.hide()`
- So even if Marker is correctly installed + allowed on the domain, the widget will remain hidden on `/auth` and other public routes

Your screenshot is from the login page, which matches this behavior.

## Goal
Make Marker.io visible:
- on **all pages**, including **login/public pages**
- while still identifying the reporter when the user is signed in

## Proposed changes (code)
### 1) Show Marker.io for everyone (remove auth gating for visibility)
Update `src/components/feedback/MarkerProvider.tsx` so that:
- It calls `window.Marker.show()` as soon as Marker is available (or stubbed) — regardless of auth state.
- It no longer calls `window.Marker.hide()` when `user` is null.

### 2) Keep reporter identification when signed in, clear when signed out
Still use auth/profile data, but only for reporter metadata:
- If `user` exists:
  - `setReporter({ email, fullName })`
  - `setCustomData({ userId, isAuthenticated: true, ... })`
- If `user` is null:
  - `clearReporter()` (if available)
  - `setCustomData({ isAuthenticated: false, ... })`

This avoids accidental “sticky” reporter identity across sessions.

### 3) Fix a subtle bug: profile name won’t update on sign-in
Currently `profileName` is fetched only in the initial `getUser()` call. If a user logs in after that, the `onAuthStateChange` handler sets `user` but doesn’t fetch the profile name.
Refactor to a helper like `loadProfileName(userId)` and call it:
- after initial `getUser()`
- whenever auth changes to a logged-in user

### 4) Add a safe fallback loader (optional but recommended for reliability)
If Marker’s snippet ever isn’t present on a particular deployment/domain:
- detect missing `window.Marker`
- inject the shim script `https://edge.marker.io/latest/shim.js`
- set `window.markerConfig` if missing

This makes the widget resilient across deployments/custom domains.

## Proposed file edits
- `src/components/feedback/MarkerProvider.tsx`
  - Change visibility rule: always show
  - Split concerns:
    - effect A: ensure Marker is loaded / ready
    - effect B: always call `Marker.show()`
    - effect C: sync reporter/customData based on auth state
  - Fetch profile name on sign-in events
  - Extend the TS typing for `window.Marker` to include `clearReporter?: () => void` (and optionally `isVisible`, `capture`, etc.)

## Marker.io settings to double-check (non-code)
Even after the code fix, Marker can still hide itself if settings are restrictive. Please ensure:
- Allowed domains includes:
  - `app.forgebylevelup.com` (and `www.` version if used)
  - any preview domains you test on
- Widget/Button targeting is set to “everyone” (or equivalent)
- The widget button is enabled (not configured as “no button / custom trigger only”)

## How we’ll verify (end-to-end)
1. Open `app.forgebylevelup.com/auth` in an incognito window
2. Confirm the Marker button appears (bottom corner)
3. Log in, then submit a Marker report
4. Confirm the report includes:
   - reporter email/name (for signed-in users)
   - customData fields (environment/app/userId when signed in; isAuthenticated false when not)

## If it still doesn’t show after this
We’ll add a temporary debug mode (dev only) that logs:
- whether `window.Marker` exists
- whether the shim script request succeeds
- whether Marker API calls are returning `403` (domain restriction) or being blocked by an ad blocker/CSP
Then we can pinpoint whether it’s still a Marker-side restriction vs. script-blocking.


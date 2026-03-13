

# Fix: Infinite Reload Loop + Form Reset During Filling

## Root Cause Identified

**There are two bugs, and the first one causes the second.**

### Bug 1: Infinite page reload loop in `src/main.tsx`
```js
const APP_VERSION = '__APP_VERSION_' + Date.now() + '__';
```
`Date.now()` produces a **new value on every page load**. The flow:
1. Load 1: stored = null → set stored = "v_1000", continue normally
2. Load 2 (or HMR): stored = "v_1000", APP_VERSION = "v_2000" → **mismatch** → clears caches, sets stored = "v_2000", calls `window.location.reload()`
3. Reload: stored = "v_2000", APP_VERSION = "v_3000" → **mismatch again** → reload
4. **Infinite loop.**

The session replay confirms: the page reloads every ~8 seconds.

### Bug 2: Form resets to step 0
This is a consequence of Bug 1. Each reload destroys React state (`currentStep`, `formData`), so the form re-renders at step 0 (intro screen). The user perceives being "redirected back to the first page."

## Fix

### File: `src/main.tsx`
Replace the dynamic `Date.now()` version with a **static build-time hash**. Use `import.meta.env.MODE + import.meta.env.BASE_URL` as a stable version identifier that only changes on actual deployments, not on every page load.

```ts
// Before (broken):
const APP_VERSION = '__APP_VERSION_' + Date.now() + '__';

// After (fixed):
const APP_VERSION = '__APP_V2__'; // Static string; bump manually or tie to build hash
```

This ensures the version check only triggers once per actual deployment, not on every reload.

No other files need changes. The form redirect issue resolves automatically once the reload loop stops.


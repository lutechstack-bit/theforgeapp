

# Add 2-Second Branded Splash Animation on Login

## What
After every login (explicit or session restore), show a full-screen cinematic splash animation for 2 seconds — dark background, Forge logo centered, "Where **Dreamers** Become **Doers**" tagline below, then fade out into the app.

## Design
- Full-screen dark overlay (`bg-[#1a1a1a]`)
- Forge logo (`forge-logo.png`) fades + scales in
- Tagline fades in with slight delay — "Where" and "Become" in white, "Dreamers" and "Doers" in primary/amber
- After 2s, the entire screen fades out and unmounts
- Uses CSS keyframe animations (no extra libraries)

## Changes

### 1. New component: `src/components/shared/SplashScreen.tsx`
- Full-screen fixed overlay with z-50
- Logo + tagline with staggered fade-in animations
- After 2s, triggers fade-out animation, then calls `onComplete` callback
- Self-contained, no external state needed

### 2. `src/App.tsx` — Show splash after login
- Add `showSplash` state to `AppRoutes`
- Listen for auth state: when user transitions from `null` to authenticated, set `showSplash = true`
- Render `<SplashScreen onComplete={() => setShowSplash(false)} />` on top of everything
- Splash plays for 2s then disappears, revealing the app underneath

### 3. Skip on page refresh with existing session
- Use a sessionStorage flag `forge-splash-shown` so the splash only plays once per browser session (not on every tab refresh)
- On explicit `signIn()`, clear the flag so it plays again

No database changes needed.




# Fix Broken Logo/Image Display

## Root Cause
Two issues are causing broken images:

### Issue 1: Incorrect Asset Paths in ThemeContext
`src/contexts/ThemeContext.tsx` uses raw file paths like `/src/assets/forge-logo.png` instead of proper ES module imports. These paths work in development but **break in production** because Vite doesn't serve `/src/` files directly -- it bundles them with hashed filenames.

### Issue 2: PWA Service Worker Stale Cache
The PWA `CacheFirst` strategy for `.png` files can serve stale cached responses. When Vite rebuilds and image filenames change (hashed), the old service worker may still try to serve from an outdated cache entry, resulting in broken images.

## Fix

### File 1: `src/contexts/ThemeContext.tsx`
- Replace raw string paths with proper ES module imports
- Import logo assets at the top of the file and reference them in the cohort config

```
Before:  logo: '/src/assets/forge-logo.png'
After:   logo: forgeLogoImg  (imported at top)
```

### File 2: `vite.config.ts`
- Change the PWA image caching strategy from `CacheFirst` to `StaleWhileRevalidate`
- This ensures the browser always fetches a fresh version in the background while serving the cached version, preventing permanently stale images

| File | Change |
|------|--------|
| `src/contexts/ThemeContext.tsx` | Add 3 logo imports at top; replace string paths with imported references |
| `vite.config.ts` | Change image runtime caching handler from `CacheFirst` to `StaleWhileRevalidate` |


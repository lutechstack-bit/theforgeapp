
# Add Homepage Navigation to Desktop Sidebar Logo

## Current State

| Component | Logo Clickable? | Status |
|-----------|-----------------|--------|
| **TopBar.tsx** (Mobile) | ✅ Yes - wrapped in `<Link to="/">` | Already works |
| **SideNav.tsx** (Desktop) | ❌ No - just an `<img>` tag | Needs fix |

---

## The Fix

### File: `src/components/layout/SideNav.tsx`

**Current code (lines 110-118):**
```tsx
<div className="flex items-center justify-center overflow-hidden">
  <img 
    src={collapsed ? forgeIcon : forgeLogo} 
    alt="Forge" 
    className={cn(
      "shrink-0 transition-all duration-300 object-contain",
      collapsed ? "h-8 w-8" : "h-10 max-w-[180px]"
    )}
  />
</div>
```

**Updated code:**
```tsx
<Link to="/" className="flex items-center justify-center overflow-hidden">
  <img 
    src={collapsed ? forgeIcon : forgeLogo} 
    alt="Forge" 
    className={cn(
      "shrink-0 transition-all duration-300 object-contain cursor-pointer",
      collapsed ? "h-8 w-8" : "h-10 max-w-[180px]"
    )}
  />
</Link>
```

---

## Changes Summary

1. Import `Link` from `react-router-dom` (already imported as it's used for `NavLink`)
2. Replace the `<div>` wrapper around the logo with `<Link to="/">`
3. Add `cursor-pointer` class for better UX indication

---

## Behavior After Fix

- **Desktop (sidebar visible)**: Clicking the Forge logo navigates to `/` (homepage)
- **Mobile (TopBar visible)**: Already works - clicking logo navigates to `/`
- Both collapsed and expanded sidebar states will work correctly

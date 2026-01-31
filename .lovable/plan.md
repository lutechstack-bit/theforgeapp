
# Scroll to Top When Logo Clicked on Homepage

## The Issue

When you're already on the homepage (`/`) and click the logo:
- The `<Link to="/">` doesn't trigger navigation (same route)
- The `ScrollToTop` component only fires on route **changes**
- Result: Nothing happens

## The Solution

Add an `onClick` handler to the logo links that scrolls to top when on the homepage.

---

## Files to Modify

### 1. `src/components/layout/SideNav.tsx`

**Change:** Add onClick handler to the logo Link

```tsx
<Link 
  to="/" 
  className="flex items-center justify-center overflow-hidden"
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
>
```

### 2. `src/components/layout/TopBar.tsx`

**Change:** Add onClick handler to the mobile logo Link

```tsx
<Link 
  to="/" 
  className="flex items-center gap-2 md:hidden"
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
>
```

---

## Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Click logo on homepage | Nothing happens | Smooth scroll to top |
| Click logo on other page | Navigates to `/` | Navigates to `/` + scroll to top |

---

## Implementation Details

- Uses `behavior: 'smooth'` for a polished scroll animation
- Works on both mobile (TopBar) and desktop (SideNav)
- No additional imports needed - `window.scrollTo` is native

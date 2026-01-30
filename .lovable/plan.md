

# Fix Profile Button in Sidebar - Make it Clickable

## Problem

The user avatar/admin display at the bottom of the sidebar (showing "Admin" with avatar) is not clickable. When you click on it, nothing happens because it's currently implemented as a static `<div>` element without any navigation.

---

## Solution

Convert the user display section from a static `<div>` to a clickable element that navigates to `/profile` when clicked, matching the expected behavior.

---

## Technical Changes

### File: `src/components/layout/SideNav.tsx`

**1. Import `useNavigate` hook** (already have NavLink imported, but we need `useNavigate` for programmatic navigation, or we can wrap with NavLink)

**2. Wrap the user display in a clickable NavLink:**

Convert the non-navigable `<div>` (lines 157-192) into a clickable `<NavLink>` that navigates to `/profile`.

**Before (non-clickable div):**
```tsx
{/* User Display - Non-navigable */}
<div className={cn(
  "flex items-center gap-3 pt-3 border-t border-sidebar-border mt-3",
  collapsed ? "justify-center" : "px-2"
)}>
  {/* avatar content */}
</div>
```

**After (clickable NavLink):**
```tsx
{/* User Display - Navigates to Profile */}
<NavLink
  to="/profile"
  className={cn(
    "flex items-center gap-3 pt-3 border-t border-sidebar-border mt-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-sidebar-accent/60",
    collapsed ? "justify-center" : "px-2",
    location.pathname === '/profile' && "bg-primary/10"
  )}
>
  {/* avatar content */}
</NavLink>
```

**3. Update tooltip content** to indicate it's clickable:
- Change tooltip text to "Go to Profile" or keep user name

---

## Visual Behavior After Fix

| Element | Before | After |
|---------|--------|-------|
| Avatar at bottom | Static, no click response | Clickable, navigates to /profile |
| Hover state | None | Shows hover background |
| Active state | None | Subtle highlight when on /profile |
| Cursor | Default | Pointer cursor |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/layout/SideNav.tsx` | Convert user display div to clickable NavLink with hover/active states |


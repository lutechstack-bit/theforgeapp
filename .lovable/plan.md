
# Add Admin Button to Side Navigation

## Problem Identified

The side navigation (`SideNav.tsx`) and mobile menu (`MobileMenuSheet.tsx`) do not include an Admin button. This means admin users cannot access the admin panel from the navigation - they would have to manually type `/admin` in the URL. This affects ALL cohorts (Filmmakers, Writers, and Creators) equally since the button simply doesn't exist.

## Solution

Add a conditional Admin link that only appears for users with the admin role. The admin check will use the existing `useAdminCheck` hook which correctly queries the `user_roles` table.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/SideNav.tsx` | Add admin nav item with Shield icon, conditionally rendered for admins |
| `src/components/layout/MobileMenuSheet.tsx` | Add admin nav item in the mobile menu for admin users |

---

## Implementation Details

### 1. Update `src/components/layout/SideNav.tsx`

**Add Imports:**
```tsx
import { Shield } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
```

**Add Hook in Component:**
```tsx
const { isAdmin } = useAdminCheck();
```

**Add Admin Navigation Item (after bottom items, before user section):**
```tsx
{/* Admin Link - Only visible to admins */}
{isAdmin && (
  <NavItem 
    to="/admin" 
    icon={Shield} 
    label="Admin" 
    isActive={location.pathname.startsWith('/admin')} 
  />
)}
```

The admin button will appear in the bottom section of the SideNav, just above the user profile card.

---

### 2. Update `src/components/layout/MobileMenuSheet.tsx`

**Add Imports:**
```tsx
import { Shield } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
```

**Add Hook in Component:**
```tsx
const { isAdmin } = useAdminCheck();
```

**Add Admin Navigation Link (in the navigation section):**
```tsx
{/* Admin Link - Only visible to admins */}
{isAdmin && (
  <NavLink
    to="/admin"
    onClick={onClose}
    className={({ isActive }) => cn(
      "flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-200",
      isActive 
        ? "bg-primary/10 text-primary" 
        : "text-foreground hover:bg-muted/50"
    )}
  >
    {({ isActive }) => (
      <>
        <span className="flex items-center gap-3.5">
          <Shield className={cn(
            "h-5 w-5",
            isActive ? "text-primary" : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-[15px]",
            isActive && "font-medium"
          )}>Admin Panel</span>
        </span>
        <ChevronRight className={cn(
          "h-4 w-4",
          isActive ? "text-primary" : "text-muted-foreground/50"
        )} />
      </>
    )}
  </NavLink>
)}
```

---

## Visual Placement

**Desktop SideNav:**
```text
┌─────────────────────┐
│ [Logo]    [Toggle]  │
├─────────────────────┤
│ Home                │
│ Roadmap             │
│ Perks               │
│ Learn               │
│ Events              │
│ Community           │
│ Profile             │
├─────────────────────┤
│ About Forge         │
│ 🛡️ Admin  ← NEW     │  (only for admins)
├─────────────────────┤
│ [User Avatar] User  │
└─────────────────────┘
```

**Mobile Menu:**
```text
┌─────────────────────┐
│ Hi, John! 👋    [X] │
├─────────────────────┤
│ [Profile Card]      │
├─────────────────────┤
│ Perks               │
│ Roadmap             │
│ Learn               │
│ Events              │
│ Community           │
│ About Forge         │
│ 🛡️ Admin Panel ← NEW│ (only for admins)
├─────────────────────┤
│ Settings            │
│ Sign Out            │
└─────────────────────┘
```

---

## How the Admin Check Works

The `useAdminCheck` hook queries the `user_roles` table:
```tsx
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .eq('role', 'admin')
  .maybeSingle();
```

This is cohort-independent - it checks if the user has the `admin` role in the `user_roles` table, regardless of whether they are a Filmmaker, Writer, or Creator.

---

## Why This Affects All Cohorts

The admin button was never implemented in either navigation component. The cohort type (FORGE, FORGE_WRITING, FORGE_CREATORS) has no impact on admin access - admin status is determined purely by the `user_roles` table.

---

## Summary

| What | Change |
|------|--------|
| SideNav.tsx | Add `useAdminCheck` hook + conditional Shield icon admin link |
| MobileMenuSheet.tsx | Add `useAdminCheck` hook + conditional admin link in nav |
| Behavior | Admin button appears only for users with admin role |
| Works for | All cohorts (Filmmakers, Writers, Creators) |

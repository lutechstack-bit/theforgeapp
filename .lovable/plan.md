

# Move Profile to Top-Right Dropdown, Replace with Sign Out in Nav

## Changes

### 1. `src/components/layout/TopProfileDropdown.tsx` (NEW)
- Create a floating top-right avatar button visible on all pages
- On click, show a small dropdown with: "My Profile" link, "Settings" (goes to `/profile?action=edit`), and divider
- Position: `fixed top-4 right-4 z-50` (mobile), adjusted for sidebar offset on desktop
- Avatar with fallback initials, ring styling matching the screenshot's amber ring

### 2. `src/components/layout/AppLayout.tsx`
- Import and render `TopProfileDropdown` when `showNav` is true

### 3. `src/components/layout/BottomNav.tsx`
- Remove the Profile/Sheet trigger (the 5th tab)
- Replace it with a **Sign Out** button (LogOut icon) with confirmation dialog
- Keep 4 nav items + Sign Out as 5th

### 4. `src/components/layout/SideNav.tsx`
- Remove the user profile `NavLink` at the bottom (lines 136-178)
- Replace with a Sign Out button styled similarly, with LogOut icon and confirmation

### 5. `src/pages/Profile.tsx`
- Remove the Sign Out `AlertDialog` section (the button + dialog around lines 196-215)

### 6. `src/components/layout/MobileMenuSheet.tsx`
- Update: remove the Sign Out button from here too since it moves to the bottom nav
- Keep Profile link in the sheet menu as-is (it's a secondary access point)

## Files
| Action | File |
|--------|------|
| Create | `src/components/layout/TopProfileDropdown.tsx` |
| Edit | `src/components/layout/AppLayout.tsx` |
| Edit | `src/components/layout/BottomNav.tsx` |
| Edit | `src/components/layout/SideNav.tsx` |
| Edit | `src/pages/Profile.tsx` |
| Edit | `src/components/layout/MobileMenuSheet.tsx` |


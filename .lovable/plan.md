
# Reconstruct Side Navigation for Mobile & Web

## Summary

Create a modern, user-friendly navigation experience inspired by the reference UI design featuring:
- **Mobile**: A slide-out drawer menu (sheet) triggered from the bottom nav, with personal greeting, profile card, and menu items with chevrons
- **Web**: Enhanced sidebar with cleaner design, better visual hierarchy, and improved user profile section

---

## Current State Analysis

| Component | Current Behavior |
|-----------|-----------------|
| `SideNav` | Desktop-only fixed sidebar with collapsible toggle, hidden on mobile (`hidden md:flex`) |
| `BottomNav` | 5-icon mobile navigation bar (Home, Roadmap, Learn, Events, Profile) |
| No mobile menu drawer | Users must use bottom nav to navigate on mobile |

---

## Reference Design Features to Incorporate

From the uploaded reference image:
1. **Personal Greeting Header** - "Hi, [Name]! 👋" with close button
2. **User Profile Card** - Large avatar with username and link
3. **Menu Items** - Icon + label + chevron arrows (full-width clickable rows)
4. **Hierarchical menu design** - Primary actions with visual distinction
5. **Clean spacing and typography**
6. **Slide-out drawer from right side**

---

## Proposed Design

### Mobile: Profile Menu Drawer

Replace the Profile icon in bottom nav with a trigger that opens a slide-out menu sheet:

```
+----------------------------------+
|  Hi, [User Name]! 👋         X  |
+----------------------------------+
|                                  |
|  [====AVATAR====]  @username     |
|  [   BADGE    ]    theforgeapp   |
|                                  |
+----------------------------------+
|  🎁  Perks                    >  |
|  📍  Roadmap                  >  |
|  📚  Learn                    >  |
|  📅  Events                   >  |
|  👥  Community                >  |
|  ℹ️  About Forge              >  |
+----------------------------------+
|  ⚙️  Settings                 >  |
|  🚪  Sign Out                 >  |
+----------------------------------+
|        FORGE LOGO                |
+----------------------------------+
```

### Web: Enhanced Sidebar

Keep the collapsible sidebar but improve the design:
- Cleaner nav items with subtle hover states
- Better visual separation between sections
- Improved user profile section at bottom
- Consistent with mobile drawer styling

---

## Technical Implementation

### New File: `src/components/layout/MobileMenuSheet.tsx`

A new component for the mobile slide-out menu:
- Uses the existing `Sheet` component from UI library
- Triggered by clicking Profile icon in bottom nav
- Contains personalized greeting, profile card, and navigation links
- Includes sign out action at bottom

### Modify: `src/components/layout/BottomNav.tsx`

- Change Profile icon behavior from navigation to sheet trigger
- Add state management for sheet open/close
- Import and render the `MobileMenuSheet` component

### Modify: `src/components/layout/SideNav.tsx`

- Update nav item styling for cleaner look
- Add chevron arrows to nav items (desktop expanded mode)
- Improve spacing and visual hierarchy
- Enhance user profile section styling

---

## Mobile Menu Sheet Structure

```tsx
<Sheet>
  <SheetTrigger> {/* Profile icon in BottomNav */} </SheetTrigger>
  <SheetContent side="right">
    {/* Header with greeting */}
    <div className="flex items-center justify-between">
      <h2>Hi, {firstName}! 👋</h2>
      <SheetClose />
    </div>
    
    {/* Profile Card */}
    <NavLink to="/profile" className="...">
      <Avatar size="lg" />
      <div>
        <span className="font-semibold">{fullName}</span>
        <span className="text-muted">theforgeapp.com/{slug}</span>
      </div>
    </NavLink>
    
    {/* Navigation Links */}
    <nav className="space-y-1">
      {menuItems.map(item => (
        <NavLink className="flex items-center justify-between py-3">
          <span className="flex items-center gap-3">
            <Icon />
            {label}
          </span>
          <ChevronRight />
        </NavLink>
      ))}
    </nav>
    
    {/* Footer Actions */}
    <div className="mt-auto">
      <Button onClick={signOut}>Sign Out</Button>
    </div>
    
    {/* Brand Footer */}
    <img src={forgeLogo} />
  </SheetContent>
</Sheet>
```

---

## Menu Items for Mobile Drawer

**Primary Navigation:**
1. Perks (Gift icon)
2. Roadmap (Map icon)
3. Learn (BookOpen icon)
4. Events (Calendar icon)
5. Community (Users icon)
6. About Forge (Info icon)

**Secondary Actions:**
- Settings → navigates to `/profile?action=edit`
- Sign Out → calls signOut function

---

## Web Sidebar Enhancements

**Changes to `SideNav.tsx`:**
1. Add `ChevronRight` icon to nav items in expanded mode
2. Improve hover/active state styling
3. Better visual separation for sections
4. Enhanced user profile card with cohort badge

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/layout/MobileMenuSheet.tsx` | Create | New mobile drawer menu component |
| `src/components/layout/BottomNav.tsx` | Modify | Replace Profile nav with sheet trigger |
| `src/components/layout/SideNav.tsx` | Modify | Add chevrons, enhance styling |

---

## Visual Improvements

### Nav Item Row Design (Both Mobile & Web)

```
+----------------------------------------+
| [Icon]   Label Text          [>]       |
+----------------------------------------+
```

- Full-width clickable area
- Icon on left (20-24px)
- Label text in medium weight
- Chevron arrow on right (mobile drawer and desktop expanded)
- Subtle divider or spacing between items

### Active State
- Primary color highlight
- Slightly elevated/glowing effect
- Bold text weight

### Hover State
- Subtle background fill
- Smooth 200ms transition

---

## Technical Details

### MobileMenuSheet Component

```tsx
// Key imports
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Menu configuration
const menuItems = [
  { to: '/perks', icon: Gift, label: 'Perks' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/updates', icon: Info, label: 'About Forge' },
];

// Sheet opens from right side
<SheetContent side="right" className="w-[85%] sm:max-w-md">
```

### BottomNav Changes

```tsx
// Before: NavLink to /profile
// After: Sheet trigger that opens MobileMenuSheet

const [menuOpen, setMenuOpen] = useState(false);

// Profile item becomes trigger
<Sheet open={menuOpen} onOpenChange={setMenuOpen}>
  <SheetTrigger asChild>
    <button className="...">
      <Avatar /> or <User icon />
    </button>
  </SheetTrigger>
  <MobileMenuSheet onClose={() => setMenuOpen(false)} />
</Sheet>
```

---

## Benefits

1. **Better Mobile UX** - Full menu access without leaving current page context
2. **Personalized Experience** - Greeting with user's name creates warmth
3. **Clear Navigation** - All pages visible at a glance with chevrons indicating action
4. **Consistent Branding** - Logo in footer reinforces brand identity
5. **Quick Actions** - Sign out and settings easily accessible
6. **Smooth Animations** - Slide-in/out transitions feel premium

---

## Responsive Behavior

| Screen Size | Navigation |
|-------------|------------|
| Mobile (< 768px) | Bottom nav + Profile triggers slide-out drawer |
| Tablet (768px+) | Desktop sidebar (collapsible) |
| Desktop | Full sidebar with all features |


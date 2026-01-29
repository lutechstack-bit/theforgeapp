

# Rearrange Side Navigation Tabs

## Current Order vs Requested Order

| Current | Requested |
|---------|-----------|
| Home | Home |
| Events | Roadmap |
| Perks | Perks |
| Learn | Learn |
| Roadmap | Events |
| --- (bottom section) --- | Community |
| Community | Profile |
| About Forge | |
| Settings/Profile | |

## Changes Required

### File: `src/components/layout/SideNav.tsx`

**1. Update `navItems` array (Lines 11-17)**

Current:
```tsx
const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/perks', icon: Gift, label: 'Perks' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
];
```

New order:
```tsx
const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/perks', icon: Gift, label: 'Perks' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];
```

**2. Update `bottomItems` array (Lines 19-22)**

Since Community and Profile are now in the main nav, we only keep About Forge in the bottom section:

```tsx
const bottomItems = [
  { to: '/updates', icon: Info, label: 'About Forge' },
];
```

**3. Remove duplicate Profile/Settings NavItem (Lines 152-158)**

The standalone Settings NavItem and the User Profile section at the bottom will be removed since Profile is now in the main navigation.

---

## Visual Result

```
┌──────────────────────┐
│ 🔥 FORGE             │
├──────────────────────┤
│ 🏠 Home              │
│ 🗺️ Roadmap           │
│ 🎁 Perks             │
│ 📖 Learn             │
│ 📅 Events            │
│ 👥 Community         │
│ ⚙️ Profile           │
│                      │
│ ────────────────     │
│ ℹ️ About Forge       │
│ [User Avatar Card]   │
└──────────────────────┘
```

---

## Summary

| File | Change |
|------|--------|
| `src/components/layout/SideNav.tsx` | Reorder nav items, move Community & Profile to main section |


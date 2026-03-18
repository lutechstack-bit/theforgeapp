

# Reorder Navigation Items

Reorder nav items in both `SideNav` and `BottomNav` to: **Home → Community → Roadmap → Learn → Perks**

## Changes

### `src/components/layout/SideNav.tsx` (line ~25)
Reorder the `navItems` array:
```
Home → Community → Roadmap → Learn → Perks
```
(Events stays after Perks if feature-flagged)

### `src/components/layout/BottomNav.tsx` (line ~17)
Reorder the `navItems` array:
```
Home → Community → Roadmap → Learn
```
(BottomNav has 4 items + Sign Out; Perks not shown on mobile bottom nav)


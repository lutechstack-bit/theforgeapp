

# SideNav Overhaul — Clean, Spacious, GrowthX-Inspired

Referencing the uploaded GrowthX sidebar: clean dark background, large spaced-out nav items, no gradients/glows/chevrons, subtle active state, user avatar at bottom with settings icon.

## File: `src/components/layout/SideNav.tsx` — Full restyle

### 1. Icon swaps (more distinctive, less generic)
```
/           Home      → House        (filled feel)
/roadmap    Map       → Compass      (adventurous)
/perks      Gift      → Gift         (keep — matches GrowthX "Perks")
/learn      BookOpen  → BookOpen     (keep — matches reference)
/events     Calendar  → CalendarDays (more detailed)
/community  Users     → Users        (keep)
/profile    Settings  → remove from main nav (profile is bottom user card)
/updates    Info      → Info         (keep)
/admin      Shield    → ShieldCheck
Toggle      PanelLeft → ChevronsLeft/ChevronsRight
```

Remove `/profile` from `navItems` — profile is accessed via the bottom user card (matching reference).

### 2. NavItem restyle — clean and spacious like reference
- Remove `ChevronRight` arrows entirely
- Remove gradient active bg (`bg-gradient-to-r from-primary/20...`) and shadow glows
- Active state: simple `bg-white/[0.08]` with `text-foreground` — flat, clean
- Remove active indicator bar (the glowing left bar)
- Remove `drop-shadow` and `group-hover:scale-110`
- Increase spacing: `space-y-1` → `space-y-2` for breathing room
- Increase padding: `py-3` → `py-3.5`
- Font: `text-[15px]` → `text-base` (16px), `font-medium`
- Inactive: `text-sidebar-foreground/50` — softer
- Icon size: `22px` → `20px` with `strokeWidth` 1.75 (thinner, elegant)
- Active icon `strokeWidth` 2 (not 2.5)
- Rounded: `rounded-xl` → `rounded-2xl`

### 3. Logo area
- Keep logo/icon as-is
- Toggle: swap `PanelLeft`/`PanelLeftClose` → `ChevronsRight`/`ChevronsLeft` (cleaner)
- Toggle button: remove bg color, just icon with hover opacity

### 4. Bottom user section
- Keep avatar + name
- Remove `ChevronRight` from user card
- Add a small settings gear icon (`Settings`) next to user name (like reference shows)
- Cleaner border: `border-sidebar-border/50`
- Remove ring effects on avatar, use simple `border-2 border-border/40`

### 5. Width adjustment
- Expanded: `w-64` → `w-72` (slightly wider for breathing room, matching reference)

### Summary of visual effect
Before: Gradient glows, chevrons, scale transforms, shadows — looks AI-generated
After: Clean, spacious, flat, with generous padding and subtle hover — looks hand-crafted


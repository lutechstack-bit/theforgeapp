
# Add Collapsible Sidebar to Admin Panel

## Overview

Add a collapse/expand toggle button to the admin sidebar, similar to the main app's `SideNav` component. This will allow admins to minimize the sidebar to icon-only view for more screen space.

---

## Current State

The `AdminLayout.tsx` has a fixed 256px (`w-64`) sidebar with no collapse functionality, while the main app's `SideNav.tsx` already implements a collapsible pattern with:
- Toggle button using `PanelLeft`/`PanelLeftClose` icons
- Collapsed width of 72px, expanded width of 256px
- Tooltips on icons when collapsed
- Smooth transitions

---

## Solution

Add local state-based collapse functionality to `AdminLayout.tsx` (no need for context since admin is isolated).

---

## Technical Changes

### File: `src/components/admin/AdminLayout.tsx`

**1. Add imports:**
- `useState` from React
- `PanelLeft`, `PanelLeftClose` icons from lucide-react
- `Tooltip` components from UI library

**2. Add collapse state:**
```tsx
const [collapsed, setCollapsed] = useState(false);
```

**3. Update sidebar styles:**
```tsx
// Dynamic width based on collapsed state
<aside className={cn(
  "border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col transition-all duration-300",
  collapsed ? "w-[72px]" : "w-64"
)}>
```

**4. Add toggle button in header:**
```tsx
<button
  onClick={() => setCollapsed(!collapsed)}
  className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-muted-foreground hover:text-foreground transition-all"
>
  {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
</button>
```

**5. Update nav items for collapsed state:**
- Center icons when collapsed
- Hide text labels when collapsed
- Add tooltips showing label on hover when collapsed

**6. Update "Back to App" button:**
- Show only icon when collapsed
- Add tooltip when collapsed

---

## Visual Preview

### Expanded State (256px)
```
┌─────────────────────────────┐
│ 🛡 Admin Panel        [◀]  │
│    LevelUp Management       │
├─────────────────────────────┤
│ 📊 Dashboard               │
│ 👥 Users                    │
│ 📅 Editions                 │
│ 📋 KY Forms                 │
│ ...                         │
├─────────────────────────────┤
│ ← Back to App               │
└─────────────────────────────┘
```

### Collapsed State (72px)
```
┌─────────┐
│ 🛡 [▶] │
├─────────┤
│   📊   │ ← tooltip: "Dashboard"
│   👥   │ ← tooltip: "Users"
│   📅   │ ← tooltip: "Editions"
│   ...  │
├─────────┤
│   ←    │ ← tooltip: "Back to App"
└─────────┘
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| Toggle button | In header, switches between `PanelLeft`/`PanelLeftClose` icons |
| Smooth animation | 300ms transition on width change |
| Tooltips | Show nav item labels on hover when collapsed |
| Icon-only mode | 72px width with centered icons |
| Persistent scroll | Navigation remains scrollable in both states |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/AdminLayout.tsx` | Add collapse state, toggle button, responsive nav items, tooltips |

---

## Summary

This adds a professional collapse toggle to the admin sidebar matching the existing pattern in the main app's `SideNav`, giving admins more screen real estate when needed while keeping quick access to all navigation items via icon tooltips.

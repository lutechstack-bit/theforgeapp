

# Four-Pill Single Row Layout for Mobile

## Summary

Redesign the navigation tabs to display exactly 4 items in a single horizontal row on mobile, matching the clean style from the reference image (Trending/Following/Events/Insights layout).

---

## Current State vs Target

| Aspect | Current | Target |
|--------|---------|--------|
| Layout | 3-column grid (wraps to 2 rows) | Single row with 4 equal items |
| Icons | Has icons | Text-only (no icons on mobile) |
| Style | Filled primary for active | Bordered pills, bold/filled for active |
| Spacing | Tight gaps | Even spacing across full width |

---

## Design Changes

**Mobile Layout (single row, 4 items):**
```
[Journey] [Prep] [Equipment] [Rules]
```

**Key Style Updates:**
- Remove icons on mobile for cleaner look (keep on desktop)
- Use `flex` with equal spacing instead of grid
- Larger tap targets with more horizontal padding
- Border-style pills with subtle active state
- Active tab: filled background OR bold text with subtle fill

---

## Technical Changes

### File: `src/components/roadmap/QuickActionsBar.tsx`

**1. Change to 4-column flex layout on mobile:**
```tsx
<div className={cn(
  "flex items-center justify-between gap-2",
  "sm:justify-start sm:gap-2"
)}>
```

**2. Hide icons on mobile, show on tablet+:**
```tsx
<Icon className="hidden sm:block h-4 w-4" />
```

**3. Adjust button sizing for single-row fit:**
```tsx
<button
  className={cn(
    "flex-1 sm:flex-none flex items-center justify-center gap-1.5",
    "px-3 py-2.5 rounded-full text-xs sm:text-sm font-medium",
    "border transition-all duration-200",
    active
      ? "bg-primary text-primary-foreground border-primary shadow-sm"
      : "bg-transparent text-foreground border-border hover:bg-secondary/50"
  )}
>
```

**4. Core navigation stays as 4 items (Journey, Prep, Equipment, Rules)**

The conditional tabs (Gallery, Films) will show when available but the base 4 are always visible.

---

## Visual Comparison

**Before (2 rows):**
```
[🗺 Journey] [📄 Prep] [📦 Equipment]
[📖 Rules]
```

**After (1 row, no icons on mobile):**
```
[Journey] [Prep] [Equipment] [Rules]
```

---

## Styling Details

- **Active state**: Primary background with primary-foreground text
- **Inactive state**: Transparent with visible border, standard text color
- **Hover**: Subtle secondary background fill
- **Touch target**: Larger vertical padding (`py-2.5`) for comfortable tapping
- **Width**: Each button takes equal space (`flex-1`) on mobile

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/roadmap/QuickActionsBar.tsx` | Single-row flex layout, hide icons on mobile, adjust sizing |

---

## Result

A clean, single-row navigation that:
- Shows all 4 core tabs without scrolling or wrapping
- Matches the reference design aesthetic
- Has comfortable tap targets
- Looks polished and professional on mobile


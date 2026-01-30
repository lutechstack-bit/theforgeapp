
# No-Scroll Tabs: Two-Row Grid Layout on Mobile

## Problem

The current pill tabs require horizontal scrolling on mobile devices. You want all tabs visible without any scrolling.

---

## Solution: Two-Row Grid Layout

Transform the navigation into a **2-row grid on mobile** that shows all tabs at once, switching to a single horizontal row on larger screens (tablets/desktop).

**Mobile Layout (2 rows × 3 columns):**
```
[Journey] [Prep]   [Equipment]
[Rules]   [Gallery] [Films]
```

**Tablet/Desktop Layout (single row):**
```
[Journey] [Prep] [Equipment] [Rules] [Gallery] [Films]
```

---

## Design Details

- **Mobile (< 640px)**: 3-column grid with 2 rows
- **Tablet+ (≥ 640px)**: Flexbox single row (current behavior)
- Compact padding on mobile (`px-3 py-1.5`) for tighter fit
- Full-width buttons in grid cells for easy tapping
- Same pill styling with primary highlight for active state

---

## Technical Changes

### File: `src/components/roadmap/QuickActionsBar.tsx`

**1. Remove ScrollArea** (no longer needed)

**2. Use responsive grid/flex layout:**

```tsx
<div className={cn(
  "grid grid-cols-3 gap-1.5",           // Mobile: 3-column grid
  "sm:flex sm:flex-wrap sm:gap-2"        // Tablet+: flex row
)}>
  {sections.map((section) => (
    <button
      className={cn(
        // Base styles
        "flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-medium",
        // Active/inactive states
        active ? "bg-primary text-primary-foreground" : "bg-card/60 text-muted-foreground border border-border/50"
      )}
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      {section.label}
    </button>
  ))}
</div>
```

**3. Adjust container padding** for grid layout

---

## Visual Comparison

| Screen Size | Before | After |
|-------------|--------|-------|
| Mobile | Scrollable row (tabs cut off) | 2×3 grid (all visible) |
| Tablet | Single row | Single row (unchanged) |
| Desktop | Single row | Single row (unchanged) |

---

## Benefits

- All tabs visible without scrolling on any device
- Easy tap targets (full grid cell width)
- Clean, organized appearance
- Labels remain readable
- Responsive - adapts to screen size

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/roadmap/QuickActionsBar.tsx` | Replace ScrollArea with responsive grid layout |

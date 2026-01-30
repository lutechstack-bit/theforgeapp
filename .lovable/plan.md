

# Fix Overflowing Tabs on Mobile - Simple & Clean Approach

## Summary

Replace the current button-style tabs with a clean **pill-style scrollable tabs** design that matches the existing patterns in Events and Learn sections. This provides a polished, consistent look with visual scroll cues.

---

## Current Problem

The Roadmap tabs (Journey, Prep, Equipment, Rules, etc.) overflow on mobile screens, cutting off content without any visual indicator that more tabs exist.

---

## Solution: Smooth Pill Tabs with ScrollArea

Transform the navigation into elegant rounded pill tabs (matching `EventTypeTabs` and `ProgramTabs`) with proper horizontal scrolling and visual consistency.

**Visual Preview (mobile):**
```
[●Journey] [Prep] [Equipment] [Rules] [Gallery→ (scroll hint)
```

**Benefits:**
- Consistent with Events and Learn tab patterns already in the app
- Clean pill design with subtle borders
- Active state has primary color fill with shadow glow
- Horizontal scroll is smooth and intuitive
- Works well on all screen sizes

---

## Technical Changes

### File: `src/components/roadmap/QuickActionsBar.tsx`

**1. Import ScrollArea component**
```tsx
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
```

**2. Replace button-based layout with pill tabs**

Transform from `Button` components to styled `button` elements matching the pill pattern:

```tsx
<ScrollArea className="w-full">
  <div className="flex items-center gap-2 pb-2">
    {sections.map((section) => {
      const Icon = section.icon;
      const active = isActive(section.path);
      
      return (
        <button
          key={section.id}
          onClick={() => navigate(section.path)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
            active
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50"
          )}
        >
          <Icon className="h-4 w-4" />
          {section.label}
        </button>
      );
    })}
  </div>
  <ScrollBar orientation="horizontal" className="opacity-0" />
</ScrollArea>
```

**3. Simplify container styling**

Remove the `overflow-x-auto scrollbar-hide` from the inner div since `ScrollArea` handles scrolling.

---

## Design Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Style | Square buttons | Rounded pill tabs |
| Scroll | Hidden overflow | Smooth ScrollArea |
| Active state | Solid primary | Primary + shadow glow |
| Inactive | Ghost button | Card with subtle border |
| Consistency | Unique style | Matches Events/Learn tabs |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/roadmap/QuickActionsBar.tsx` | Convert to pill-style tabs with ScrollArea |

---

## Result

A clean, scrollable tab bar that:
- Fits naturally with the rest of the app's design language
- Works smoothly on all mobile devices
- Shows all tabs are accessible via horizontal swipe
- Looks polished and professional


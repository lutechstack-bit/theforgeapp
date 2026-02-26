

# Fix LevelUp Logo Visibility in Section Divider

## Problem
The LevelUp logo image has excessive internal whitespace/padding, making it nearly invisible even at `h-5`. The "MORE FROM" text dwarfs the logo.

## Changes

**File: `src/pages/Learn.tsx`** (lines 181-189)

Increase the logo size significantly (from `h-5` to `h-10`) so the actual logo content within the padded image becomes visible and proportional to the "MORE FROM" text. Also increase the gap between text and logo.

```tsx
// Before
<div className="mb-8 flex items-center gap-4">
  <div className="flex-1 h-px bg-border/50" />
  <div className="flex items-center gap-2">
    <span className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
      More from
    </span>
    <img src={levelUpLogo} alt="LevelUp" className="h-5 invert opacity-70" />
  </div>
  <div className="flex-1 h-px bg-border/50" />
</div>

// After
<div className="mb-8 flex items-center gap-4">
  <div className="flex-1 h-px bg-border/50" />
  <div className="flex items-center gap-3">
    <span className="text-base font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
      More from
    </span>
    <img src={levelUpLogo} alt="LevelUp" className="h-10 invert opacity-80 object-contain" />
  </div>
  <div className="flex-1 h-px bg-border/50" />
</div>
```

Key changes:
- Logo height: `h-5` → `h-10` (compensates for internal padding in the image)
- Text size: `text-sm` → `text-base` (larger, matching the logo)
- Opacity: `0.70` → `0.80` (more visible)
- Gap: `gap-2` → `gap-3`
- Added `object-contain` for proper scaling


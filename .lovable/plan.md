

# Center the "More from" + LevelUp Logo as a Section Divider

## Change

**File: `src/pages/Learn.tsx`** (lines 178-185)

1. Save `user-uploads://LevelUp_Logo_White.png` to `src/assets/levelup-logo-white.png`
2. Import the logo at the top of the file
3. Replace the left-aligned text header with a centered divider-style layout:
   - A thin horizontal line on each side
   - "More from" text + LevelUp logo centered between the lines
   - Remove the gold underline (the divider lines replace it)

**Before:**
```tsx
<div className="mb-6">
  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
    More from LevelUp
  </p>
  <div className="w-8 h-0.5 bg-primary/30 rounded-full mt-1" />
</div>
```

**After:**
```tsx
<div className="mb-8 flex items-center gap-4">
  <div className="flex-1 h-px bg-border/50" />
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
      More from
    </span>
    <img src={levelUpLogo} alt="LevelUp" className="h-4 opacity-70" />
  </div>
  <div className="flex-1 h-px bg-border/50" />
</div>
```

This creates a centered section break with horizontal rules on both sides — visually distinct from the Forge sections above.


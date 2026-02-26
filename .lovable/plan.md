

# Enhanced "More from LevelUp" Divider

## Changes

**File: `src/pages/Learn.tsx`** (lines ~180-190)

Make the logo much larger and add a gradient underline accent below the divider for visual impact.

```tsx
// Before
<div className="mb-8 flex items-center gap-4">
  <div className="flex-1 h-px bg-border/50" />
  <div className="flex items-center gap-3">
    <span className="text-base font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
      More from
    </span>
    <img src={levelUpLogo} alt="LevelUp" className="h-20 md:h-24 invert opacity-80 object-contain shrink-0" />
  </div>
  <div className="flex-1 h-px bg-border/50" />
</div>

// After
<div className="mb-8 flex flex-col items-center gap-3">
  <div className="flex items-center gap-4 w-full">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />
    <div className="flex items-center gap-3">
      <span className="text-base font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
        More from
      </span>
      <img src={levelUpLogo} alt="LevelUp" className="h-28 md:h-36 invert opacity-90 object-contain shrink-0" />
    </div>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />
  </div>
  <div className="w-32 h-0.5 rounded-full bg-gradient-to-r from-[#FFBF00]/0 via-[#FFBF00]/60 to-[#FFBF00]/0" />
</div>
```

Key changes:
- Logo: `h-20 md:h-24` → `h-28 md:h-36` — dramatically bigger
- Opacity: `0.80` → `0.90` — crisper
- Horizontal rules: plain `bg-border/50` → amber gradient `from-transparent via-[#FFBF00]/40 to-transparent`
- Added a short gradient underline bar below the divider for a premium accent
- Wrapped in flex-col to stack the underline beneath


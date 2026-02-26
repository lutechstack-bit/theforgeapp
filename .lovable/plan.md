

# Fix LevelUp Logo Visibility in "More From" Divider

## Problem
The current white logo (`levelup-logo-white.png`) has massive whitespace/padding around the actual logo content, rendering it invisible at `h-4`. The centered divider text is also too small.

## Changes

**Step 1: Replace logo asset**
- Copy `user-uploads://LevelUp_Logo.png` (the full "LevelUp learning" logo with graph icon) to `src/assets/levelup-logo.png`
- This logo is black on transparent, so we'll apply `invert` filter for the dark background

**Step 2: Update `src/pages/Learn.tsx`**
- Change import from `levelup-logo-white.png` to `levelup-logo.png`
- Increase "MORE FROM" text from `text-[11px]` to `text-sm` (14px) so it's clearly readable
- Increase logo from `h-4` to `h-5` to match the text height
- Add `invert` class to the `<img>` so the black logo renders white on the dark background
- Keep the centered divider layout with horizontal lines on both sides

```tsx
// Before
import levelUpLogo from '@/assets/levelup-logo-white.png';
...
<span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
  More from
</span>
<img src={levelUpLogo} alt="LevelUp" className="h-4 opacity-70" />

// After
import levelUpLogo from '@/assets/levelup-logo.png';
...
<span className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
  More from
</span>
<img src={levelUpLogo} alt="LevelUp" className="h-5 invert opacity-70" />
```


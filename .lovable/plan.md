

# Fix "More from LevelUp" Divider

## Changes in `src/pages/Learn.tsx` (lines ~181-195)

Two issues to fix:

1. **Remove the gradient underline bar** — the `w-32 h-0.5` amber accent line below the divider needs to go.
2. **Fix vertical alignment** — the logo (h-28/h-36) and "More from" text aren't vertically centered. Need `items-center` on the inner flex and adjust the text baseline to align with the logo's visual center using `self-center`.

Updated divider block:

```tsx
<div className="mb-8 flex items-center gap-4 w-full">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />
  <div className="flex items-center gap-3">
    <span className="text-base font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
      More from
    </span>
    <img src={levelUpLogo} alt="LevelUp" className="h-28 md:h-36 invert opacity-90 object-contain shrink-0" />
  </div>
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />
</div>
```

Key changes:
- Remove the outer `flex-col` wrapper and the `w-32 h-0.5` gradient underline `div` entirely
- Flatten back to a single-row flex layout so logo and text share the same baseline alignment


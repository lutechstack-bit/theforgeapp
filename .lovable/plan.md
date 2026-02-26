

# Increase LevelUp Logo Size in Section Divider

## Change

**File: `src/pages/Learn.tsx`** (line 188)

Increase logo from `h-10` to `h-14` so it's clearly larger than the "MORE FROM" text.

```tsx
// Before
<img src={levelUpLogo} alt="LevelUp" className="h-10 invert opacity-80 object-contain" />

// After
<img src={levelUpLogo} alt="LevelUp" className="h-14 invert opacity-80 object-contain" />
```


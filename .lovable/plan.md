

# Robust Fix: CSS Mix-Blend-Mode for Automatic Text Contrast

## Why Current Approach Fails

The current approach uses fixed percentage thresholds (35%, 50%, 68%, 88%) to determine when text should be black or cream. This fails because:

1. **Flexbox layout** - Elements are positioned by content and gaps, not fixed percentages
2. **Fixed-width city section** - Uses pixels (`sm:w-32`), not percentages
3. **Responsive gaps** - `gap-3 sm:gap-4 md:gap-5` changes element spacing
4. **Screen size variations** - A 70% fill covers different elements on different screens

No amount of threshold tuning will work across all scenarios.

## The Correct Solution: CSS Mix-Blend-Mode

Instead of calculating thresholds, use CSS to **automatically** contrast text against its background:

**How it works:**
- `mix-blend-mode: difference` inverts colors based on background
- Text over gold → appears dark
- Text over dark background → appears light
- Works at the **pixel level**, no calculations needed

## Technical Changes

### File: `src/components/home/CompactCountdownTimer.tsx`

**Complete restructure:**

1. **Remove all threshold calculations** (lines 83-106)
2. **Add a text layer with `mix-blend-mode: difference`**
3. **Use white text** that inverts to dark on gold, stays light on dark

### New Structure

```
Container (relative, overflow-hidden)
├── Gold Fill Layer (absolute, z-1)
│   └── Linear gradient 0% to progressPercent%
├── Content Layer (relative, z-2)
│   └── City | Days : Hours : Min : Sec
│       └── All text uses mix-blend-mode: difference
│       └── Base color: white → inverts to black on gold
```

### Simplified Code

```typescript
// TimeUnit - now uses mix-blend-mode for automatic contrast
const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center relative z-10">
    <span className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums text-white mix-blend-difference">
      {value.toString().padStart(2, '0')}
    </span>
    <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest mt-0.5 text-white/80 mix-blend-difference">
      {label}
    </span>
  </div>
);

// Separator - also uses mix-blend-mode
const Separator = () => (
  <span className="text-xl sm:text-2xl font-light text-white/50 mix-blend-difference">:</span>
);
```

**Remove:**
- All `isPassed` props from TimeUnit and Separator
- All position threshold calculations
- All threshold-based color classes

## Why This Works

| Background | White Text + Difference | Result |
|------------|------------------------|--------|
| Gold (light) | Inverts | Dark text |
| Dark BG | Stays | Light text |

The blend mode operates at the **pixel level** - exactly where the gold fill ends, that's where the text color changes. No calculations, no guessing, no threshold tuning.

## Visual Result

```
┌────────────────────────────────────────────────────────────────────┐
│ See you in │   09   :   11   :   45   :   18                       │
│ Goa        │  Days     Hours    Min      Sec                       │
└────────────────────────────────────────────────────────────────────┘
████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
         ↑ pixel-perfect transition ↑
   Dark text here    │    Light text here
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Replace threshold-based color logic with `mix-blend-mode: difference` |

## Benefits

- **Pixel-perfect** - Text color changes exactly where gold fill ends
- **Responsive** - Works on all screen sizes automatically
- **No calculations** - Removes complex threshold logic
- **Smooth transitions** - CSS handles the visual blending
- **Maintainable** - No magic numbers to tune


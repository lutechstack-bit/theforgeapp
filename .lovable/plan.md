

# Mobile Countdown Timer — Compact & Clean Redesign

## Problem
The current countdown timer takes up too much vertical space on mobile devices. The large font sizes, padding, and stacked layout make it feel overwhelming rather than "neat and clear."

## Solution
Make the mobile countdown timer significantly more compact by:
1. Reducing font sizes on mobile
2. Using a single-row layout on mobile (instead of stacking city + timer)
3. Tightening padding and gaps
4. Creating a cleaner, more minimal appearance

## Visual Comparison

**Current (Mobile):**
```text
┌─────────────────────────────────────┐
│ SEE YOU IN                          │
│ Goa                                 │
├─────────────────────────────────────┤
│   08  :  18  :  31  :  44           │
│  DAYS   HOURS  MIN    SEC           │
└─────────────────────────────────────┘
Height: ~120px  |  Font: 24px numbers
```

**Proposed (Mobile):**
```text
┌─────────────────────────────────────┐
│ Goa     08 : 18 : 31 : 44           │
│         Days Hrs  Min  Sec          │
└─────────────────────────────────────┘
Height: ~56px  |  Font: 18px numbers
```

## Technical Changes

### File: `src/components/home/CompactCountdownTimer.tsx`

| Change | Current | New |
|--------|---------|-----|
| Number size (mobile) | `text-2xl` (24px) | `text-lg` (18px) |
| Label size (mobile) | `text-[9px]` | `text-[8px]` |
| Separator size | `text-xl` | `text-base` |
| Container padding | `py-3 px-4` | `py-2 px-3` |
| Timer gaps | `gap-3` | `gap-2` |
| Layout | Stacked on mobile | Single row always |
| City section width | `sm:w-32` | Inline, smaller |

### Specific Code Updates

**1. TimeUnit Component — Smaller on Mobile**
```tsx
// Current
<span className="text-2xl sm:text-3xl md:text-4xl font-bold">

// New
<span className="text-lg sm:text-2xl md:text-3xl font-bold">
```

**2. Labels — Tighter**
```tsx
// Current
<span className="text-[9px] sm:text-[10px] md:text-xs">

// New  
<span className="text-[7px] sm:text-[9px] md:text-xs">
```

**3. Separator — Smaller**
```tsx
// Current
<span className="text-xl sm:text-2xl">:</span>

// New
<span className="text-sm sm:text-lg">:</span>
```

**4. Layout — Always Horizontal**
```tsx
// Current (stacks on mobile)
<div className="flex flex-col sm:flex-row w-full">

// New (always row)
<div className="flex flex-row w-full">
```

**5. Container Padding — Tighter**
```tsx
// Current
"px-4 py-3 sm:py-4"

// New
"px-3 py-2 sm:py-3"
```

**6. Timer Gaps — Tighter**
```tsx
// Current
"gap-3 sm:gap-4 md:gap-5"

// New
"gap-1.5 sm:gap-3 md:gap-4"
```

**7. City Section — Smaller, No Stacking Border**
```tsx
// Current
"border-b sm:border-b-0"

// New (remove bottom border, always inline)
Remove the border-b entirely
```

## Result

- **Height reduction**: ~120px → ~56px (50% smaller)
- **Font reduction**: 24px → 18px numbers
- **Cleaner look**: Single row, tighter spacing
- **Better readability**: Maintains all information in less space

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Reduce sizes, tighten layout |




# Solid Color Progress Timer Redesign

## Design Analysis (from Reference Images)

The user wants a **split-fill progress effect** where:
- The progress fills from left-to-right as a **solid color** (not a gradient wave)
- Numbers that are "passed" by the progress have inverted colors (dark text on light/gold background)
- Numbers that haven't been "passed" remain light text on dark background

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │  SEE YOU IN   09    16  ║  34    11                                    │ │
│ │  Goa         DAYS  HRS  ║  MIN   SEC                                   │ │
│ │                         ║                                               │ │
│ │  ███████████████████████║                                               │ │
│ │  (SOLID GOLD FILL)      ║  (DARK BACKGROUND)                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ← Solid color fills left-to-right based on countdown progress →          │
│   ← Text: BLACK on gold section, CREAM on dark section →                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Changes

### 1. Replace Gradient Wave → Solid Color Fill
- Remove the gradient with multiple color stops
- Use a simple solid gold/amber color that fills from 0% to `progressPercent`%

### 2. Update Text Color Logic
- Numbers **inside** the solid fill area → Black/dark text
- Numbers **outside** the solid fill area → Cream/light text (foreground)
- The transition should be based on each element's position in the layout

### 3. Smooth Transition Effect
- Use `transition-colors duration-300` for smooth color changes
- Sharp edge on the fill (no gradient blur)

---

## Implementation Details

### File: `src/components/home/CompactCountdownTimer.tsx`

**New Progress Background:**

```typescript
{/* Solid color progress fill */}
<div 
  className="absolute inset-0 z-[1] pointer-events-none"
  style={{
    background: `linear-gradient(
      90deg,
      hsl(var(--forge-gold)) 0%,
      hsl(var(--forge-gold)) ${progressPercent}%,
      transparent ${progressPercent}%,
      transparent 100%
    )`,
  }}
/>
```

**Updated TimeUnit Logic:**

The `isInProgress` prop needs to be renamed to `isPassed` to indicate whether the progress has passed that element:

```typescript
const TimeUnit = ({ 
  value, 
  label,
  isPassed  // True if the solid color is behind this element
}: { 
  value: number; 
  label: string;
  isPassed?: boolean;
}) => (
  <div className="flex flex-col items-center relative z-10">
    <span className={cn(
      "text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums transition-colors duration-300",
      isPassed 
        ? "text-black" // Dark text on gold background
        : "text-foreground" // Light text on dark background
    )}>
      {value.toString().padStart(2, '0')}
    </span>
    <span className={cn(
      "text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest mt-0.5 transition-colors duration-300",
      isPassed ? "text-black/70" : "text-muted-foreground"
    )}>
      {label}
    </span>
  </div>
);
```

**Position-based "Passed" Detection:**

Map each element to a percentage position in the layout:
- "See you in / City" section: 0% - 25%
- Days: 25% - 40%
- Hours: 40% - 55%
- Minutes: 55% - 70%
- Seconds: 70% - 85%

```typescript
// Determine if each section is "passed" by the progress
const cityPassed = progressPercent > 10;
const daysPassed = progressPercent > 30;
const hoursPassed = progressPercent > 45;
const minutesPassed = progressPercent > 60;
const secondsPassed = progressPercent > 75;
```

---

## Visual Effect Breakdown

| Progress % | City Text | Days | Hours | Min | Sec |
|------------|-----------|------|-------|-----|-----|
| 0-10%      | Light     | Light| Light | Light | Light |
| 10-30%     | **Dark**  | Light| Light | Light | Light |
| 30-45%     | **Dark**  | **Dark** | Light | Light | Light |
| 45-60%     | **Dark**  | **Dark** | **Dark** | Light | Light |
| 60-75%     | **Dark**  | **Dark** | **Dark** | **Dark** | Light |
| 75-100%    | **Dark**  | **Dark** | **Dark** | **Dark** | **Dark** |

---

## Color Values

| State | Background | Number Text | Label Text |
|-------|------------|-------------|------------|
| Not passed | Dark (card/background) | `text-foreground` (cream) | `text-muted-foreground` |
| Passed | Solid `--forge-gold` | `text-black` | `text-black/70` |

---

## Separator Updates

The colon separators also need color switching:

```typescript
const Separator = ({ isPassed }: { isPassed?: boolean }) => (
  <span className={cn(
    "text-xl sm:text-2xl font-light transition-colors duration-300",
    isPassed ? "text-black/40" : "text-muted-foreground/40"
  )}>:</span>
);
```

---

## Cleanup

- Remove the `countdown-wave` CSS class from index.css if no longer needed
- Remove any shimmer/wave animations that were for the gradient effect

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Replace gradient with solid fill, update text color logic to `isPassed` |
| `src/index.css` | Clean up unused `countdown-wave` and `wave-sweep` animations (optional) |

---

## Expected Result

A clean countdown timer where:
1. A solid gold color fills from left to right based on progress
2. Numbers that are "passed" by the fill show BLACK text on gold
3. Numbers not yet "passed" show CREAM text on dark background
4. Sharp, clean edge between the two sections (no gradient blur)
5. Smooth color transitions as each section gets "passed"


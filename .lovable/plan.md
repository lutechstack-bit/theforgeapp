

# Immersive Progress Countdown Timer

## Design Concept
Based on the reference image, the timer should have a **flowing gradient that sweeps across the entire component** as the countdown progresses. The numbers appear with a glass/transparent effect where the animated gradient passes behind them.

---

## Visual Design

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────┬─────────────────────────────────────────────────────┐   │
│ │                 │                                                     │   │
│ │  SEE YOU IN     │     40      11    ║║ 32      56                    │   │
│ │  GOA            │    DAYS   HOURS   ║║ MIN    SEC                    │   │
│ │                 │                   ║║                                │   │
│ │  (dark section) │  (dark)           ║║  (flowing gradient wave)      │   │
│ └─────────────────┴─────────────────────────────────────────────────────┘   │
│                                                                             │
│   ← The gradient sweeps left-to-right across the entire timer →            │
│   ← Numbers get a "glass" effect when the gradient passes over them →      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Changes

### 1. Replace "See you in" + underline → "See you in {City}"
Show the cohort city (Goa, Hyderabad, etc.) prominently

### 2. Remove Bottom Progress Bar
Delete the separate `h-0.5` progress bar at the bottom

### 3. Add Sweeping Gradient Background
The progress gradient animates across the **entire timer container** as a background layer

### 4. Glass Text Effect
When the gradient passes behind a number, the number appears with a frosted/glass effect (achieved via CSS mix-blend-mode or backdrop effects)

---

## Implementation

### File: `src/components/home/CompactCountdownTimer.tsx`

```typescript
// TimeUnit with glass effect based on progress position
const TimeUnit = ({ 
  value, 
  label,
  isInProgress 
}: { 
  value: number; 
  label: string;
  isInProgress?: boolean;
}) => (
  <div className="flex flex-col items-center relative z-10">
    <span className={cn(
      "text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums transition-colors duration-300",
      isInProgress 
        ? "text-black/80" // Dark text when gradient is behind
        : "text-foreground" // Light text on dark background
    )}>
      {value.toString().padStart(2, '0')}
    </span>
    <span className={cn(
      "text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest mt-0.5",
      isInProgress ? "text-black/60" : "text-muted-foreground"
    )}>
      {label}
    </span>
  </div>
);

export const CompactCountdownTimer = ({ edition }) => {
  // ... existing time state and effect ...

  // Calculate which "section" the progress is in
  // 0 = dark section, 1 = days, 2 = hours, 3 = min, 4 = sec
  const progressPosition = useMemo(() => {
    // Map 0-100% to positions across the timer
    // Left section is ~25%, each time unit is ~18.75%
    const normalized = progressPercent / 100;
    return normalized; // 0 to 1 representing left-to-right position
  }, [progressPercent]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Sweeping gradient background */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-1000 ease-linear"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            transparent ${progressPercent - 5}%,
            hsl(var(--forge-gold)) ${progressPercent}%,
            hsl(var(--forge-yellow)) ${progressPercent + 10}%,
            hsl(var(--forge-orange)) ${progressPercent + 20}%,
            transparent ${progressPercent + 30}%,
            transparent 100%
          )`,
        }}
      />
      
      {/* Base dark background */}
      <div className="relative z-0 flex flex-col sm:flex-row">
        {/* Left: Message section */}
        <div className="flex-shrink-0 sm:w-36 bg-gradient-to-br from-forge-charcoal to-card/90 
                        flex flex-col justify-center px-4 py-4">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            See you in
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground">
            {edition?.city || 'The Forge'}
          </span>
        </div>
        
        {/* Right: Timer section with glass effect */}
        <div className="flex-1 flex items-center justify-center gap-4 sm:gap-6 
                        py-4 px-4 bg-card/60 relative">
          <TimeUnit 
            value={timeLeft.days} 
            label="Days" 
            isInProgress={progressPosition > 0.25 && progressPosition < 0.45}
          />
          <TimeUnit 
            value={timeLeft.hours} 
            label="Hours" 
            isInProgress={progressPosition > 0.40 && progressPosition < 0.60}
          />
          <TimeUnit 
            value={timeLeft.minutes} 
            label="Min" 
            isInProgress={progressPosition > 0.55 && progressPosition < 0.75}
          />
          <TimeUnit 
            value={timeLeft.seconds} 
            label="Sec" 
            isInProgress={progressPosition > 0.70 && progressPosition < 0.90}
          />
        </div>
      </div>
      
      {/* NO bottom progress bar */}
    </div>
  );
};
```

---

## CSS Animation Enhancement

Add to `src/index.css`:

```css
/* Sweeping wave animation for countdown */
.countdown-wave {
  background: linear-gradient(
    90deg,
    transparent 0%,
    hsl(var(--forge-gold) / 0.3) 45%,
    hsl(var(--forge-yellow) / 0.6) 50%,
    hsl(var(--forge-orange) / 0.3) 55%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: wave-sweep 3s ease-in-out infinite;
}

@keyframes wave-sweep {
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}
```

---

## Visual Effect Breakdown

| State | Background | Text Color |
|-------|------------|------------|
| Before gradient reaches | Dark (card/charcoal) | Light (foreground) |
| Gradient passing through | Gold/Yellow wave | Dark (black/80) |
| After gradient passes | Dark again | Light again |

---

## Mobile Responsiveness

- Vertical stack on mobile with same sweeping effect
- City name shows below "See you in" on all sizes
- Gradient animation respects reduced-motion preference

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Add city display, sweeping gradient, remove bottom bar |
| `src/index.css` | Add wave-sweep animation keyframes |

---

## Expected Result

A premium countdown timer where:
1. "See you in **Goa**" (or cohort city) replaces the generic line
2. No separate progress bar - the gradient IS the timer background
3. A beautiful gold/yellow wave sweeps across the entire timer
4. Numbers get a "glass" contrast effect when the wave passes over them
5. Smooth, continuous animation creates a premium, dynamic feel


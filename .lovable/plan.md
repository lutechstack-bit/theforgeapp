
# Premium Countdown Timer Redesign

## Design Inspiration
Create a Stripe Sessions-style countdown with the Forge brand's gold/amber color palette. The timer will feature:
- Large, bold flip-clock numbers
- Elegant glass-card container with gold accents
- Smooth "tick" animation when seconds/minutes change
- Split background aesthetic (dark left, lighter right)

---

## Visual Design

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────┬───────────────────────────────┐  │
│ │                                     │                               │  │
│ │  🔥  Goa starts in                  │   ╔═══╗ ╔═══╗ ╔═══╗ ╔═══╗    │  │
│ │                                     │   ║ 09║ ║ 16║ ║ 54║ ║ 47║    │  │
│ │      (Dark gradient section)        │   ╚═══╝ ╚═══╝ ╚═══╝ ╚═══╝    │  │
│ │                                     │   DAYS   HRS   MIN   SEC     │  │
│ │                                     │   (Gold flip-clock blocks)   │  │
│ └─────────────────────────────────────┴───────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Split Background Design
- Left section: Dark gradient with the "starts in" message and flame icon
- Right section: Slightly lighter with the countdown blocks
- Diagonal split line for visual interest

### 2. Premium Flip-Clock Blocks
- Gold/amber gradient background matching brand colors
- Rounded corners with subtle border
- Center horizontal line (flip-card illusion)
- Drop shadow for depth
- Large, bold numbers (tabular-nums for alignment)

### 3. Tick Animation
- Subtle scale + fade animation when a number changes
- Quick 200ms transition for responsive feel
- Optional flip animation for premium effect

### 4. Mobile Responsiveness
- Compact layout on mobile (stacks vertically if needed)
- Slightly smaller blocks but still readable
- Touch-friendly sizing

---

## Implementation Plan

### File: `src/components/home/CompactCountdownTimer.tsx`

Complete redesign with the following structure:

```typescript
// New TimeBlock with flip-clock aesthetic
const TimeBlock = ({ value, label, prevValue }) => {
  const hasChanged = value !== prevValue;
  
  return (
    <div className="flex flex-col items-center">
      {/* Flip-clock block */}
      <div className={cn(
        "relative w-14 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden",
        "bg-gradient-to-b from-forge-gold to-forge-orange",
        "border border-forge-yellow/40",
        "shadow-lg shadow-forge-gold/30"
      )}>
        {/* Top half shine */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
        
        {/* Center divider line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/30 z-10" />
        
        {/* Number */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          hasChanged && "animate-tick"
        )}>
          <span className="text-2xl sm:text-3xl font-black text-black tabular-nums">
            {value.toString().padStart(2, '0')}
          </span>
        </div>
        
        {/* Bottom shadow */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      {/* Label */}
      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1.5 font-semibold">
        {label}
      </span>
    </div>
  );
};
```

### Main Container Layout

```typescript
return (
  <div className="relative overflow-hidden rounded-xl">
    {/* Split background container */}
    <div className="flex">
      {/* Left: Dark section with message */}
      <div className="flex-1 bg-gradient-to-br from-card via-card to-muted/50 px-4 py-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-forge-gold/20">
          <Flame className="w-5 h-5 text-forge-yellow" />
        </div>
        <p className="text-sm sm:text-base font-medium text-foreground">
          {edition?.city ? `${edition.city}` : 'Forge'} starts in
        </p>
      </div>
      
      {/* Right: Lighter section with timer */}
      <div className="flex items-center gap-2 sm:gap-3 px-4 py-3 bg-gradient-to-br from-muted/30 to-card/50">
        <TimeBlock value={timeLeft.days} label="DAYS" prevValue={prevTimeLeft.days} />
        <span className="text-forge-gold/50 text-xl font-light">:</span>
        <TimeBlock value={timeLeft.hours} label="HRS" prevValue={prevTimeLeft.hours} />
        <span className="text-forge-gold/50 text-xl font-light">:</span>
        <TimeBlock value={timeLeft.minutes} label="MIN" prevValue={prevTimeLeft.minutes} />
        <span className="text-forge-gold/50 text-xl font-light">:</span>
        <TimeBlock value={timeLeft.seconds} label="SEC" prevValue={prevTimeLeft.seconds} />
      </div>
    </div>
    
    {/* Diagonal accent line */}
    <div className="absolute top-0 bottom-0 left-[40%] w-px bg-gradient-to-b from-transparent via-forge-gold/30 to-transparent transform -skew-x-12" />
  </div>
);
```

---

## New Animation

Add a "tick" animation to `tailwind.config.ts`:

```typescript
keyframes: {
  "tick": {
    "0%": { transform: "scaleY(1)" },
    "50%": { transform: "scaleY(0.95)" },
    "100%": { transform: "scaleY(1)" }
  },
}

animation: {
  "tick": "tick 0.2s ease-out",
}
```

---

## Color Mapping

| Element | Color |
|---------|-------|
| Block background | `from-forge-gold to-forge-orange` gradient |
| Block border | `border-forge-yellow/40` |
| Block shadow | `shadow-forge-gold/30` |
| Number text | `text-black` (for contrast) |
| Labels | `text-muted-foreground` |
| Separators (`:`) | `text-forge-gold/50` |
| Icon | `text-forge-yellow` |
| Icon background | `bg-forge-gold/20` |

---

## Mobile Layout

On smaller screens (xs-sm):
- Container stays horizontal but more compact
- Blocks: `w-11 h-13` instead of `w-16 h-20`
- Font size: `text-xl` instead of `text-3xl`
- Labels: `text-[9px]` for compact fit

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Complete redesign with split-panel layout and flip-clock blocks |
| `tailwind.config.ts` | Add "tick" keyframe animation |
| `src/index.css` | Optional: Add glass effect variant for countdown |

---

## Expected Result

A premium, Stripe Sessions-inspired countdown timer that:
1. Has a dramatic split-panel background
2. Features gold flip-clock style number blocks
3. Displays smooth tick animations on number changes
4. Maintains the Forge brand identity with the 5-color palette
5. Works beautifully on both mobile and desktop

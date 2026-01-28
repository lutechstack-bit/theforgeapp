

# Use Gold Gradient for Filled Portion

## Current State
The countdown timer uses `bg-forge-charcoal` (dark) for the filled portion and `bg-forge-cream` (light) for the remaining portion.

## What You Want
Replace the dark charcoal fill with the Forge gold gradient to match the brand identity.

## Technical Changes

### File: `src/components/home/CompactCountdownTimer.tsx`

#### 1. Change Filled Background (Line 154-157)

**Current:**
```tsx
<div 
  className="absolute inset-0 bg-forge-charcoal transition-all duration-500"
  style={{ width: 'var(--p)' }}
/>
```

**New:**
```tsx
<div 
  className="absolute inset-0 bg-gradient-to-r from-forge-orange via-forge-gold to-forge-yellow transition-all duration-500"
  style={{ width: 'var(--p)' }}
/>
```

This uses your 3-color brand gradient: Orange (#DD6F16) → Gold (#D38F0C) → Yellow (#FFBC3B)

#### 2. Update Text Colors for Gold Background

Since gold is a light color, the text on the filled portion needs to be **dark** (black) for contrast, not white.

**Update CountdownContent tone logic (Lines 61-62):**

**Current:**
```tsx
const textClass = tone === 'fill' ? 'text-white' : 'text-black';
const labelClass = tone === 'fill' ? 'text-white/70' : 'text-black/70';
```

**New:**
```tsx
const textClass = tone === 'fill' ? 'text-black' : 'text-black';
const labelClass = tone === 'fill' ? 'text-black/70' : 'text-black/70';
```

Both sides now use dark text since:
- Filled side = Gold gradient (light) → needs dark text
- Remaining side = Cream (light) → needs dark text

#### 3. Update Progress Edge Line (Line 160-163)

Change from white to dark for better visibility on gold:

**Current:**
```tsx
<div 
  className="absolute top-0 bottom-0 w-px bg-white/30 z-10 transition-all duration-500"
  style={{ left: 'var(--p)' }}
/>
```

**New:**
```tsx
<div 
  className="absolute top-0 bottom-0 w-px bg-black/20 z-10 transition-all duration-500"
  style={{ left: 'var(--p)' }}
/>
```

## Visual Result

```text
┌────────────────────────────────────────────────────────────────────┐
│ SEE YOU IN │   09   :   11   :   45   :   18                       │
│ Goa        │  DAYS     HOURS    MIN      SEC                       │
└────────────────────────────────────────────────────────────────────┘
🟠🟠🟠🟠🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Orange → Gold → Yellow gradient    │    Cream (remaining)
      Black text throughout
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Replace charcoal fill with gold gradient, update text to black |


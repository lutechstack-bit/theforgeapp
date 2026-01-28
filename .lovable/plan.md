

# Add High-Intensity Gold Glow Border to Timer

## Overview
Add a premium gold outline glow effect to the countdown timer container, creating a high-intensity glowing border that makes the timer stand out as a premium element.

---

## Visual Effect

```text
  ╔═══════════════════════════════════════════════════════════════════════╗
  ║  ✧                                                               ✧    ║
  ║    ┌──────────────────────────────────────────────────────────────┐   ║
  ║    │  SEE YOU IN   09 : 16 : 34 : 11                              │   ║
  ║    │  Goa         DAYS HRS  MIN  SEC                              │   ║
  ║    └──────────────────────────────────────────────────────────────┘   ║
  ║  ✧                                                               ✧    ║
  ╚═══════════════════════════════════════════════════════════════════════╝
              ↑ HIGH INTENSITY GOLD GLOW BORDER ↑
```

---

## Implementation

### File: `src/components/home/CompactCountdownTimer.tsx`

**Update the outer container (line 112):**

Replace:
```typescript
<div className="relative overflow-hidden rounded-xl border border-border/30">
```

With:
```typescript
<div className="relative overflow-hidden rounded-xl border-2 border-forge-gold/60 
                shadow-[0_0_15px_rgba(255,188,59,0.4),0_0_30px_rgba(255,188,59,0.3),0_0_45px_rgba(211,143,12,0.2),inset_0_0_15px_rgba(255,188,59,0.1)]">
```

---

## CSS Breakdown

The glow effect uses multiple layered box-shadows:

| Layer | Blur | Color | Purpose |
|-------|------|-------|---------|
| Layer 1 | 15px | `rgba(255,188,59,0.4)` | Inner glow (Primary Yellow) |
| Layer 2 | 30px | `rgba(255,188,59,0.3)` | Medium spread glow |
| Layer 3 | 45px | `rgba(211,143,12,0.2)` | Outer glow (Deep Gold) |
| Inset | 15px | `rgba(255,188,59,0.1)` | Subtle inner radiance |

**Border:** `border-2 border-forge-gold/60` - Solid gold border at 60% opacity

---

## Color Values (from Brand Identity)

| Color | Hex | RGB |
|-------|-----|-----|
| Primary Yellow | #FFBC3B | 255, 188, 59 |
| Deep Gold | #D38F0C | 211, 143, 12 |
| Secondary Orange | #DD6F16 | 221, 111, 22 |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Update outer container with gold border and multi-layer glow shadow |

---

## Expected Result

A countdown timer with:
- **Gold border** (2px, 60% opacity) that defines the outline
- **High-intensity multi-layered glow** radiating outward in gold/amber tones
- **Subtle inset glow** for depth and premium feel
- Maintains the existing solid progress fill and text inversion functionality


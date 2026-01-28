

# Pixel-Perfect Split-Number Progress Bar

## What You Want

In the reference image, when the progress fill cuts through a number:
- The portion ON the dark/colored background = **white text**
- The portion ON the light background = **dark text**
- The split can happen **mid-character** for that dramatic half-number effect

## Technical Approach: Dual-Layer Text with Clip Masking

Render the text **twice** with different colors, each clipped to its respective background:

```text
Layer Structure:
┌─────────────────────────────────────────────────────────────────────┐
│ Container (relative, overflow-hidden)                               │
│ ├── Layer 1: Dark Background (left portion)                        │
│ │   └── White text, clipped to 0% → progressPercent%               │
│ ├── Layer 2: Light/Gold Background (right portion)                 │
│ │   └── Dark text, clipped to progressPercent% → 100%              │
│ └── Gold fill overlay (for visual styling)                         │
└─────────────────────────────────────────────────────────────────────┘
```

## How It Works

Using `clip-path: inset()` to reveal only the portion of each text layer that sits on its matching background:

| Layer | Text Color | Clip Region | What's Visible |
|-------|------------|-------------|----------------|
| 1 | White/Cream | `inset(0 ${100-progress}% 0 0)` | Left side (on dark BG) |
| 2 | Black/Dark | `inset(0 0 0 ${progress}%)` | Right side (on light BG) |

When progress = 70%:
- Layer 1 (white text): Shows 0% to 70% 
- Layer 2 (dark text): Shows 70% to 100%

**Result**: A number at the 70% mark will be split - left portion white, right portion dark!

## Visual Example

```text
Progress at 65% (cutting through "32"):

┌────────────────────────────────────────────────────────────────────┐
│ SEE YOU IN │   40   11   32   56                                   │
│ Goa        │  DAYS  HOURS  MIN  SEC                                │
│            │ [WHT] [WHT] [SPLIT] [DRK]                              │
└────────────────────────────────────────────────────────────────────┘
████████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░
                                           ↑
                                    65% split point
                               
The "3" in 32 = WHITE (on dark)
The "2" in 32 = DARK (on light)
```

## Technical Changes

### File: `src/components/home/CompactCountdownTimer.tsx`

**Complete restructure using clip-path masking:**

1. **Create a reusable `SplitText` component** that renders text twice with opposing clip masks
2. **Remove mix-blend-mode** (not reliable for this effect)
3. **Use absolute positioning** for the two text layers to overlap perfectly

### New Component Structure

```typescript
// SplitText component - renders text with split coloring
const SplitText = ({ 
  children, 
  progressPercent,
  className 
}: { 
  children: React.ReactNode; 
  progressPercent: number;
  className?: string;
}) => (
  <div className={cn("relative", className)}>
    {/* Dark text layer - visible on light/gold portion (right side) */}
    <span 
      className="text-black"
      style={{ 
        clipPath: `inset(0 0 0 ${progressPercent}%)` 
      }}
    >
      {children}
    </span>
    {/* Light text layer - visible on dark portion (left side) */}
    <span 
      className="absolute inset-0 text-white"
      style={{ 
        clipPath: `inset(0 ${100 - progressPercent}% 0 0)` 
      }}
    >
      {children}
    </span>
  </div>
);
```

### TimeUnit Refactor

```typescript
const TimeUnit = ({ 
  value, 
  label, 
  progressPercent 
}: { 
  value: number; 
  label: string;
  progressPercent: number;
}) => (
  <div className="flex flex-col items-center">
    <SplitText progressPercent={progressPercent} className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums">
      {value.toString().padStart(2, '0')}
    </SplitText>
    <SplitText progressPercent={progressPercent} className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest mt-0.5">
      {label}
    </SplitText>
  </div>
);
```

### Color Scheme (Matching Reference)

| Element | Dark Portion | Light Portion |
|---------|--------------|---------------|
| Numbers | White (`text-white`) | Black (`text-black`) |
| Labels | White/80 (`text-white/80`) | Black/80 (`text-black/80`) |
| Background | Dark gray/charcoal | Gold (forge-gold) |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Complete rewrite with dual-layer clip-path approach |

## Benefits

- **Pixel-perfect split**: Characters split exactly where progress ends
- **No calculations needed**: CSS handles the visual masking automatically
- **Responsive**: Works on all screen sizes
- **Smooth**: Progress updates create smooth visual transitions
- **Matches reference**: Exactly like the image you shared


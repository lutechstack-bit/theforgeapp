

# Enhanced Floating Highlights Button

## Goal
Make the floating button more visually compelling so users are drawn to tap it and discover the Highlights content (Past Moments, Student Work, Stay Locations).

---

## Design Options

### Option A: Forge Logo Icon (Recommended)
Use the `forge-icon.png` as the button graphic - it's the brand mark users recognize.

### Option B: Animated Ring with Sparkles
A glowing ring animation with the Sparkles icon and a subtle "New" badge to create urgency.

### Option C: Mini Preview Badge
Show a tiny thumbnail preview from the highlights content as the button itself.

**Recommended: Option A** with enhanced animations for premium feel.

---

## Implementation Plan

### Changes to FloatingHighlightsButton.tsx

Transform the button from a simple sparkle icon to a premium, branded experience:

**Visual Enhancements:**
1. **Forge Icon** - Use the brand's forge-icon.png as the main graphic
2. **Glowing Ring** - Animated outer ring that pulses with the primary color
3. **Badge Indicator** - Small dot or "Highlights" label to hint at content
4. **Glass Background** - Frosted glass effect matching the app's premium aesthetic
5. **Smooth Hover/Active States** - Scale and shadow transitions

**Animation Enhancements:**
- Replace basic `animate-pulse` with layered effects:
  - Outer glow ring that expands and fades
  - Subtle bounce when content is available
  - Scale feedback on tap

---

## Visual Design

```text
┌──────────────────────────────────────────────────┐
│                                                  │
│  Main Content Area                               │
│                                                  │
│                                                  │
│                              ┌─────────────────┐ │
│                              │  ╭───────────╮  │ │
│                              │  │  [FORGE]  │  │ │  ← Forge icon
│                              │  │   ICON    │  │ │
│                              │  ╰───────────╯  │ │
│                              │    ◉ glow ring  │ │  ← Animated ring
│                              └─────────────────┘ │
│                                     ● badge      │  ← "View" indicator
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## New Button Component Structure

```typescript
// FloatingHighlightsButton.tsx

<button className="fixed bottom-24 right-4 z-40 lg:hidden group">
  {/* Outer glow ring - animated */}
  <div className="absolute inset-0 -m-2 rounded-full bg-primary/20 animate-ping" />
  <div className="absolute inset-0 -m-1 rounded-full bg-primary/30 animate-pulse-soft" />
  
  {/* Main button body - glass effect */}
  <div className="relative p-3 rounded-full glass-premium 
                  border border-primary/30 
                  shadow-lg shadow-primary/20
                  group-active:scale-95 transition-all duration-200">
    
    {/* Forge icon */}
    <img 
      src={forgeIcon} 
      alt="Forge Highlights" 
      className="w-8 h-8 object-contain drop-shadow-[0_0_8px_hsl(var(--primary))]" 
    />
  </div>
  
  {/* "View" badge label */}
  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                   text-[10px] font-semibold text-primary 
                   bg-background/90 px-2 py-0.5 rounded-full 
                   border border-primary/30 shadow-sm">
    View
  </span>
</button>
```

---

## Animation Details

### Layered Glow Effect
```css
/* Outer ring - slow ping */
.absolute.inset-0.-m-2.rounded-full.bg-primary/20.animate-ping

/* Inner ring - soft pulse */
.absolute.inset-0.-m-1.rounded-full.bg-primary/30.animate-pulse-soft

/* Icon glow */
.drop-shadow-[0_0_8px_hsl(var(--primary))]
```

### Timing
- Ping animation: 1.5s infinite (grabs attention)
- Pulse-soft: 3s infinite (subtle background glow)
- Active scale: 0.95 on tap (200ms transition)

---

## Alternative Badge Options

### Option 1: "View" Text Badge (Recommended)
```text
     ┌────────┐
     │ [ICON] │
     └────────┘
       [View]
```

### Option 2: Number Badge (if count available)
```text
     ┌────────┐
     │ [ICON] │
     └────────┘
         ③
```

### Option 3: Sparkle Dot Only
```text
     ┌────────┐
     │ [ICON] │●
     └────────┘
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/roadmap/FloatingHighlightsButton.tsx` | Redesign with Forge icon, glow rings, and badge |

---

## Technical Details

### Updated Component Code

```typescript
import React, { useState } from 'react';
import MobileHighlightsSheet from './MobileHighlightsSheet';
import forgeIcon from '@/assets/forge-icon.png';

const FloatingHighlightsButton: React.FC<{ editionId?: string }> = ({ editionId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 lg:hidden group"
        aria-label="View Forge Highlights"
      >
        {/* Animated glow rings */}
        <div className="absolute inset-0 -m-3 rounded-full bg-primary/15 animate-ping opacity-75" />
        <div className="absolute inset-0 -m-1.5 rounded-full bg-primary/25 animate-pulse-soft" />
        
        {/* Glass button body */}
        <div className="relative p-3 rounded-full 
                        bg-background/80 backdrop-blur-xl 
                        border border-primary/40 
                        shadow-lg shadow-primary/30
                        group-active:scale-95 transition-all duration-200
                        group-hover:border-primary/60 group-hover:shadow-xl">
          <img 
            src={forgeIcon} 
            alt="" 
            className="w-7 h-7 object-contain drop-shadow-[0_0_6px_hsl(var(--primary))]" 
          />
        </div>
        
        {/* "View" label */}
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 
                         text-[9px] font-bold uppercase tracking-wide
                         text-primary bg-background/95 
                         px-1.5 py-0.5 rounded-full 
                         border border-primary/30 shadow-sm
                         whitespace-nowrap">
          View
        </span>
      </button>

      <MobileHighlightsSheet
        editionId={editionId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
};

export default FloatingHighlightsButton;
```

---

## Expected Results

1. **Brand Recognition** - Forge icon is instantly recognizable to users
2. **Visual Magnetism** - Animated glow rings draw the eye naturally
3. **Clear Action** - "View" label tells users what to expect
4. **Premium Feel** - Glass effect and smooth animations match app aesthetic
5. **Accessible** - Proper touch target size (48x48px+) and ARIA label


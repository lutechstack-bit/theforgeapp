

# Extend Hero Carousel Height & Reposition CTA — Responsive

## Changes

### `src/components/home/HeroBanner.tsx`

1. **Replace `aspectRatio: '16/9'`** with responsive fixed heights:
   - Mobile: `h-[45vh]` (shorter on small screens)
   - Tablet: `sm:h-[50vh]`
   - Desktop: `md:h-[55vh] lg:h-[60vh]`

2. **Move the CTA button outside the carousel container** into a separate `div` below it with responsive padding (`py-5 sm:py-6 md:py-8`) for breathing space, centered horizontally.

3. **Keep the "Welcome to the Forge" heading** overlaid at the bottom of the carousel image with the gradient — only the button moves out.

4. **Wrap both sections** (carousel + CTA) in a parent fragment so they remain semantically together.

```text
┌──────────────────────────┐
│   Carousel images        │  ← h-[45vh] to h-[60vh] responsive
│                          │
│   "Welcome to the Forge" │  ← overlaid with gradient
└──────────────────────────┘
         py-5 to py-8         ← breathing space
   [ Start your Journey ↓ ]   ← separate centered div
```

| File | Change |
|------|--------|
| `src/components/home/HeroBanner.tsx` | Replace aspect-ratio with responsive vh heights; extract CTA button below carousel with responsive padding |


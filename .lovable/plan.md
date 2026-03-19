

# Extend Hero Carousel with Overlay CTA + Countdown

## What Changes

The hero carousel currently ends, then the "Start your Journey" button sits in its own section, and the countdown timer is a separate card below. The goal: make the carousel taller to encompass all three elements, with the CTA button and countdown timer overlaid on top of the carousel image.

## Approach

### 1. HeroBanner — Accept `edition` prop, render countdown inside
- Accept `edition` and `countdownVisible` props
- Increase carousel height: `h-[65vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh]` to accommodate the extra overlaid content
- Move the "Start your Journey" button back inside the overlay (positioned above the countdown)
- Render `CompactCountdownTimer` inside the overlay at the bottom, with adjusted styling (transparent/glass background instead of the gold fill, or keep the gold card but floating over the image)
- Strengthen the bottom gradient to ensure readability over the image

### 2. Home.tsx — Remove standalone countdown + CTA
- Pass `edition` and `countdownSection` to `HeroBanner`
- Remove the standalone `<CompactCountdownTimer>` and its skeleton from the page-container section

### 3. CompactCountdownTimer — Add overlay-friendly variant
- Add an optional `variant="overlay"` prop
- When overlay: use `backdrop-blur-md bg-black/30` background instead of `bg-forge-cream`, use white text instead of black, keep the gold glow border

## Layout (inside HeroBanner)

```text
┌─────────────────────────────┐
│                             │
│      Carousel Image         │
│                             │
│   "Welcome to the Forge"    │
│                             │
│   [Start your Journey ▼]    │
│                             │
│  ┌───────────────────────┐  │
│  │  Countdown Timer      │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## Files to Edit
1. `src/components/home/HeroBanner.tsx` — taller carousel, overlay CTA + countdown
2. `src/components/home/CompactCountdownTimer.tsx` — add `variant` prop for overlay styling
3. `src/pages/Home.tsx` — pass edition to HeroBanner, remove standalone countdown


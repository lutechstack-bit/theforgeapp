

# Fix: Alumni Cards Full-Width + Travel Section Hidden Behind Bottom Nav

## Issues
1. **Alumni Showcase cards** show at fixed `w-[220px]` on mobile — shows partial second card. Should show one full card at a time with snap scrolling.
2. **Travel & Stay section** (last section on Home) gets hidden behind the 68px bottom nav bar — needs bottom margin/padding.

## Fixes

### 1. `src/components/home/AlumniShowcaseSection.tsx` — Full-width cards on mobile
- Line 75: Change card width from `w-[220px] sm:w-[280px]` → `w-[calc(100%-8px)] sm:w-[280px]`
- This makes each card take full container width on mobile (minus a tiny peek), showing one card at a time
- `snap-start` already present so swiping snaps cleanly

### 2. `src/pages/Home.tsx` — Add bottom padding to prevent last section hiding behind bottom nav
- Line 152: Add `pb-6` to the `space-y-6` container (already has `page-container` which may include some padding, but the Travel section is the last item and gets clipped)
- Alternatively, check `page-container` class — the `pb-24 md:pb-0` is on the `<main>` in AppLayout, so it should already work. Let me verify the actual padding chain.

Looking at AppLayout: `<main className="pb-24 md:pb-0">` — this should provide 96px bottom padding. The issue might be that `page-container` or `min-h-screen` is interfering. The fix is simpler — ensure the content wrapper itself has adequate bottom spacing.

### File changes:

**`src/components/home/AlumniShowcaseSection.tsx`** (line 75):
- `w-[220px] sm:w-[280px]` → `w-[calc(100vw-72px)] sm:w-[280px]`
  - 72px = 32px container padding (p-4 × 2) + 8px inner padding (px-1 × 2) — ensures one full card visible with no half-card peek

**`src/pages/Home.tsx`** (line 152):
- Add `pb-8` to the space-y container so the Travel & Stay section clears the bottom nav


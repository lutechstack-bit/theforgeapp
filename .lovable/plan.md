

# Reduce Spacing on Learn Page

## Problem
Too much vertical gap between the CinematicHero header and the "More from LevelUp" zone. The `page-container` adds top padding, the hero has `mb-6 md:mb-8`, and the content wrapper uses `space-y-8 sm:space-y-10`, all compounding into excessive whitespace.

## Changes

### 1. CinematicHero (`src/components/shared/CinematicHero.tsx`)
- Reduce bottom margin from `mb-6 md:mb-8` to `mb-2 md:mb-3`

### 2. Learn page (`src/pages/Learn.tsx`)
- Reduce outer `space-y-8 sm:space-y-10` to `space-y-5 sm:space-y-6` (line 154)
- Reduce inner content `space-y-8 sm:space-y-10` to `space-y-5 sm:space-y-6` (line 195)
- Reduce LevelUp zone top padding from `pt-8` to `pt-5` and header margin from `mb-8` to `mb-5` (lines 215-217)
- Reduce LevelUp zone inner spacing from `space-y-8 sm:space-y-10` to `space-y-6 sm:space-y-8` (line 228)
- Reduce `mt-4` on the LevelUp zone wrapper to `mt-2`

## Files to Edit
1. `src/components/shared/CinematicHero.tsx` — reduce bottom margin
2. `src/pages/Learn.tsx` — tighten all section spacing


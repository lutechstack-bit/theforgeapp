

# Add Amber Glow Border to Remaining Learn Page Cards

## Current State

The amber glow border already exists on: LearnCourseCard, LevelUpCourseCard, MasterclassCard, and ProgramBanner.

Two card types on the Learn page are still missing the effect:

1. **PremiumVideoCard** (Continue Watching section) — currently uses `border border-border/50` with a CSS class `hover-gold-glow`
2. **Upcoming Online Sessions cards** (inline in UpcomingSessionsSection) — currently uses `border border-border/30 hover:border-primary/30`

## Changes

| File | Change |
|---|---|
| `src/components/learn/PremiumVideoCard.tsx` (lines 54-61) | Wrap the outer `div` in the standard amber glow container (`rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 ...`). Remove old `border border-border/50 hover-gold-glow` classes. Inner div becomes `rounded-[13px]`. |
| `src/components/learn/UpcomingSessionsSection.tsx` (line 78) | Wrap each session card in the amber glow container. Remove old `border border-border/30 hover:border-primary/30` from the inner card div. Inner card becomes `rounded-[13px]`. |

## Technical Detail

Both components get the same wrapper pattern used everywhere else:

```tsx
<div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15 hover:from-[#FFBF00]/50 hover:via-[#FFBF00]/25 hover:to-[#FFBF00]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300">
  {/* existing card content with rounded-[13px] */}
</div>
```

For PremiumVideoCard, the inner `rounded-t-2xl` on the thumbnail also adjusts to `rounded-t-[13px]` to nest properly.


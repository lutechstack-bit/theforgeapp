

# Add Amber Glow Border to All Homepage Section Cards

## What Changes

Apply the standard amber `#FFBF00` gradient glow border (matching the Learn page cards) to every section card on the homepage. The Countdown Timer already has its own gold treatment and Alumni Showcase already has the glow — so the remaining sections are:

1. **Today's Focus Card** (`TodaysFocusCard.tsx`) — currently `border border-primary/20`
2. **KY Profile / Onboarding Card** (`KYProfileCard.tsx`) — currently `border border-forge-gold/30`
3. **Session Detail Card** (`SessionDetailCard.tsx`) — currently `border border-primary/30` or `border-border/30`
4. **Travel & Stay Section** (`TravelStaySection.tsx`) — currently `border border-border/40`
5. **Batchmates Section** (`BatchmatesSection.tsx`) — currently no card wrapper; will wrap the avatar grid area in a bordered card

## Files Changed

| File | Change |
|---|---|
| `src/components/home/TodaysFocusCard.tsx` (line 23) | Wrap in amber glow container, remove old `border border-primary/20` |
| `src/components/home/KYProfileCard.tsx` (line 32) | Wrap in amber glow container, remove old `border border-forge-gold/30` |
| `src/components/home/SessionDetailCard.tsx` (lines 30-36) | Wrap in amber glow container, remove old border classes |
| `src/components/home/TravelStaySection.tsx` (line 87) | Wrap in amber glow container, remove old `border border-border/40` |
| `src/components/home/BatchmatesSection.tsx` (lines 74-142) | Wrap avatar grid content in a bordered card with amber glow |

## Technical Detail

Each component gets the standard wrapper:

```tsx
<div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15 hover:from-[#FFBF00]/50 hover:via-[#FFBF00]/25 hover:to-[#FFBF00]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300">
  <div className="rounded-[13px] ... existing inner content ...">
    ...
  </div>
</div>
```

Inner containers change from `rounded-2xl` to `rounded-[13px]` and have old `border` classes removed (the gradient wrapper IS the border now).

For **BatchmatesSection**, the `<section>` keeps its header outside the glow, and the avatar row gets wrapped in the glow card so it matches the visual treatment of other sections.

**CompactCountdownTimer** and **AlumniShowcaseSection** are left untouched — they already have their own amber/gold treatments.


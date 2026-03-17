

# Compact Payment Card with Detail Modal

## What changes

### 1. Create `PaymentFocusCard` — compact card matching TodaysFocusCard style
A small card with the same border/badge pattern as the "Today's Focus" card:
- Badge: "PAYMENT DUE" (red-tinted, like the current badge)
- Title: "Complete your programme fees"
- Subtitle: shows balance amount (e.g., "₹70,000 remaining")
- CTA button: "Pay Balance →" which opens a modal

### 2. Create `PaymentDetailModal` — popup with the full payment breakdown
Move all the existing PaymentDueCard content (progress ring, line items, pay links) into a Dialog modal that opens when the CTA is clicked.

### 3. Update Home.tsx layout order
- Remove `PaymentDueCard` from its current position (line 123, below countdown)
- Add the new compact `PaymentFocusCard` between Onboarding Steps and Journey Timeline

New section order:
1. Countdown Timer
2. Today's Focus
3. Onboarding Steps (creator profile)
4. **Payment Focus Card** (new position)
5. Journey Timeline
6. Batchmates
7. Alumni
8. Travel & Stay

## Files

| File | Change |
|------|--------|
| `src/components/home/PaymentFocusCard.tsx` | New — compact card with modal trigger |
| `src/components/home/PaymentDetailModal.tsx` | New — modal with full payment breakdown (existing PaymentDueCard content) |
| `src/pages/Home.tsx` | Move payment section below onboarding, swap to new component |


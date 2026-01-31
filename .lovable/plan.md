

# Reorder Perks Page Sections

## Current Order

1. **Hero Section - Acceptance Card** (lines 112-175)
2. **Your Forge Bag** (lines 177-213)
3. **Perks Unlocked** (lines 215-242)
4. **Equipment Discounts** (lines 244-286)
5. **Footer Note** (lines 288-298)

## New Order (as requested)

1. **Hero Section - Acceptance Card** ✓ (keep at top)
2. **Equipment Discounts** ↑ (move up)
3. **Perks Unlocked** ↔ (stays in middle)
4. **Your Forge Bag** ↓ (move down)
5. **Footer Note** ✓ (keep at bottom)

---

## Implementation

### File: `src/pages/Perks.tsx`

Simply rearrange the JSX sections within the return statement. No logic changes needed — just cut and paste the sections in the new order.

**Section blocks to move:**

| Section | Current Lines | New Position |
|---------|---------------|--------------|
| Equipment Discounts | 244-286 | After Acceptance Card |
| Perks Unlocked | 215-242 | After Equipment Discounts |
| Your Forge Bag | 177-213 | After Perks Unlocked |

---

## Visual Preview

```text
┌─────────────────────────────────────┐
│  🏆 ACCEPTANCE CARD                 │  ← Stays at top
│  Welcome, [Name]!                   │
│  [Share Your Acceptance]            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  📷 EQUIPMENT DISCOUNTS             │  ← Moved UP (was 4th)
│  Sony - Up to 25% off               │
│  Digitek - Up to 30% off            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🎁 PERKS UNLOCKED                  │  ← Now 3rd (was 3rd)
│  Forge Alumni Network               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  📦 YOUR FORGE BAG                  │  ← Moved DOWN (was 2nd)
│  7 items included                   │
│  [Grid of bag items]                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  📦 Your Forge Bag Awaits           │  ← Stays at bottom
│  Footer note                        │
└─────────────────────────────────────┘
```

---

## Summary

This is a simple reorder of existing sections — no functionality changes, just moving the JSX blocks into the new sequence.


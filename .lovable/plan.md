

# Clean Up Coming Soon Card in Perks

## The Issue
The current "Coming Soon" fallback card (shown when no banner image exists) is cluttered with:
- Large letter avatar box
- Category badge
- Name + headline text layout
- "Soon" badge on the right

This creates a collapsed, awkward appearance.

## Solution
Replace the text-layout fallback with a clean, minimal "Coming Soon" card that matches the visual style of banner cards:

- Same 16/10 aspect ratio for grid consistency
- Subtle dark background with gold border accent
- Simple, centered "Coming Soon" text with clock icon
- No attempt to render placeholder content

## Changes

### Update `src/components/perks/PerkCard.tsx`
- When `isComingSoon` is true and no banner exists, render a clean minimal card
- Keep banner mode unchanged (already handles coming soon gracefully with overlay)
- Simplify the fallback layout to be a centered, aspect-ratio card instead of text-heavy layout

### Visual Result
```
┌─────────────────────────────┐
│      ┌─────────┐            │
│      │  Clock  │            │
│      └─────────┘            │
│                             │
│    Coming Soon              │
│    More perks on the way    │
└─────────────────────────────┘
```

Clean, minimal, matches the grid, no collapsed text.


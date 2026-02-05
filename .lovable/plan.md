
# Perks Page Redesign - Brand Logos + Social Sharing Enhancement

## Summary
Redesign the Perks page with proper Sony and Digitek brand logos, a GrowthX-inspired partnership hero section, platform-specific social sharing buttons (Instagram, LinkedIn, WhatsApp, X, Facebook), and fixed grammar. Move the goodie bag section to the bottom to prioritize high-value partnership perks.

---

## Part 1: Add Brand Logos to Project

### Step 1: Copy uploaded logos to public folder
The user uploaded Sony and Digitek logos that need to be copied:
- `user-uploads://1-5.png` → `public/images/brands/sony.png`
- `user-uploads://2-5.png` → `public/images/brands/digitek.png`

These will be placed alongside existing brand logos in `public/images/brands/`.

---

## Part 2: New Partnership Hero Component

### File: `src/components/perks/PartnershipHero.tsx` (NEW)

A prominent GrowthX-inspired section showcasing Sony and Digitek as official partners.

```text
Layout:
┌─────────────────────────────────────────────────────────────────┐
│                    OFFICIAL PARTNERS                            │
│                                                                 │
│     ┌───────────────┐           ┌───────────────┐              │
│     │   [SONY       │           │   [DIGITEK    │              │
│     │    LOGO]      │           │    LOGO]      │              │
│     │   ─────────   │           │   ─────────   │              │
│     │   Up to 25%   │           │   Up to 30%   │              │
│     │   off         │           │   off         │              │
│     └───────────────┘           └───────────────┘              │
│                                                                 │
│          Exclusive pricing on cameras, lenses,                  │
│          lighting & production equipment                        │
└─────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Full-width gradient card with gold blur orbs
- White/light rounded containers for logos (GrowthX style)
- Logos displayed as actual `<img>` elements using the new files
- Gold discount badges on each partner card
- Premium gold glow on hover

---

## Part 3: Enhanced Acceptance Share Card

### File: `src/components/perks/AcceptanceShareCard.tsx` (MODIFY)

Add platform-specific social sharing buttons:

**New Social Button Row:**
```text
┌─────────────────────────────────────────────────────────────┐
│  Share to:                                                   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│  │ Insta  │ │LinkedIn│ │WhatsApp│ │   X    │ │  FB    │     │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │    Download     │  │   Copy Link     │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

**Platform Sharing Logic:**
| Platform | Method | Action |
|----------|--------|--------|
| Instagram | Download + Copy | Downloads image, copies caption, shows instructions |
| LinkedIn | URL intent | Opens `linkedin.com/sharing/share-offsite/?url=...` |
| WhatsApp | URL scheme | Opens `wa.me/?text=...` with share text |
| Twitter/X | Tweet intent | Opens `twitter.com/intent/tweet?text=...` |
| Facebook | Sharer URL | Opens `facebook.com/sharer/sharer.php?quote=...` |

**Social Button Styling:**
- Platform brand colors (Instagram gradient, LinkedIn blue, WhatsApp green, etc.)
- `h-11 w-11` touch-friendly size
- Rounded squares with subtle hover effects
- Custom SVG icons for each platform

---

## Part 4: Grammar Fixes

### File: `src/pages/Perks.tsx`

**Current (incorrect):**
```typescript
const cohortTitles: Record<CohortType, string> = {
  FORGE: 'Filmmaker',      // sounds like singular person
  FORGE_WRITING: 'Writer',
  FORGE_CREATORS: 'Creator',
};
```

**Fixed (correct):**
```typescript
const cohortTitles: Record<CohortType, string> = {
  FORGE: 'Filmmakers',       // program name (plural)
  FORGE_WRITING: 'Writing',  // keep as program name
  FORGE_CREATORS: 'Creators', // program name (plural)
};
```

This fixes:
- "Welcome to Forge Filmmaker" → "Welcome to Forge Filmmakers"
- "I got accepted into Forge Filmmaker!" → "I got accepted into Forge Filmmakers!"

---

## Part 5: Page Layout Restructure

### File: `src/pages/Perks.tsx` (MODIFY)

**New Section Order:**
1. **PartnershipHero** (NEW) - Sony & Digitek prominently displayed with actual logos
2. **Acceptance Card** (COMPACTED) - Smaller card with integrated social sharing buttons
3. **Perks Unlocked** - Alumni Network section (keep as is)
4. **Forge Bag** (MOVED DOWN) - Deprioritized, shown at bottom

**Remove from current position:**
- Remove `equipmentDiscounts` section (replaced by PartnershipHero)
- Move goodie bag section to bottom

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `public/images/brands/sony.png` | COPY | Sony logo from uploaded file |
| `public/images/brands/digitek.png` | COPY | Digitek logo from uploaded file |
| `src/components/perks/PartnershipHero.tsx` | CREATE | GrowthX-inspired partner showcase with actual logos |
| `src/components/perks/AcceptanceShareCard.tsx` | MODIFY | Add social platform buttons (Insta, LinkedIn, WhatsApp, X, FB) |
| `src/pages/Perks.tsx` | MODIFY | Fix grammar, restructure layout, integrate PartnershipHero |

---

## Visual Specifications

### PartnershipHero Card Design
- **Container**: `rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20`
- **Logo containers**: White rounded cards (`bg-white rounded-xl p-4`) for brand logos
- **Logo images**: `h-8 md:h-10` height, maintain aspect ratio
- **Discount badges**: Gold gradient badges below each logo
- **Decorative elements**: Gold blur orbs in corners

### Social Button Colors
| Platform | Background | Text/Icon |
|----------|------------|-----------|
| Instagram | `bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]` | White |
| LinkedIn | `bg-[#0A66C2]` | White |
| WhatsApp | `bg-[#25D366]` | White |
| Twitter/X | `bg-black border border-white/20` | White |
| Facebook | `bg-[#1877F2]` | White |

---

## Expected Outcome

1. **Real brand logos** - Sony and Digitek logos displayed prominently (not icons)
2. **GrowthX-inspired layout** - Clean, professional partnership showcase
3. **Platform-specific sharing** - Direct buttons for Instagram, LinkedIn, WhatsApp, X, Facebook
4. **Correct grammar** - "Forge Filmmakers" instead of "Forge Filmmaker"
5. **Prioritized content** - Partnerships first, goodie bag last
6. **Mobile-optimized** - Touch-friendly social buttons, responsive cards

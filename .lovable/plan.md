
# Mentor Card Redesign - Clean GrowthX-Inspired Design

## Summary
Redesign the mentor cards to feel modern, warm, and credible by switching from the current flip-card design to a cleaner vertical layout with color photos, proper spacing, and visible brand logos. The new design is inspired by GrowthX's clean aesthetic while maintaining Forge's gold-accented brand identity.

---

## Current Issues

| Problem | Impact |
|---------|--------|
| Black & white photos | Reduces warmth, feels dated and less personable |
| Complex flip animation | Confusing UX, hides important info (brands) behind interaction |
| Small card size | Cramped content, hard to read on mobile |
| Topic/role buried | Not immediately visible what mentor teaches |
| Brands only visible on flip | Missing credibility signals at first glance |

---

## New Card Structure (GrowthX-Inspired)

```text
┌──────────────────────────────────┐
│                                  │
│        [COLOR PHOTO]             │
│        (3:4 aspect ratio)        │
│        object-cover              │
│                                  │
├──────────────────────────────────┤
│  Topic / What They Teach         │  <- Gold text, uppercase, small
│  ─────────────────────────       │
│  Mentor Name                     │  <- Bold, larger, cream
│                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐        │  <- Brand logos (3 max)
│  │ Logo│ │ Logo│ │ Logo│        │
│  └─────┘ └─────┘ └─────┘        │
└──────────────────────────────────┘
```

**Key Design Principles:**
1. **Full color photos** - No filters, no grayscale, warm and inviting
2. **Topic first** - What they teach is immediately visible (gold text)
3. **Name prominent** - Clear, bold, easy to read
4. **Brands visible** - Credibility logos always shown (not hidden behind flip)
5. **Generous padding** - Breathing room for premium feel
6. **Gold accents** - Consistent with Forge brand identity

---

## Implementation Plan

### File 1: Create `src/components/shared/CleanMentorCard.tsx` (NEW)

A completely new mentor card component with the GrowthX-inspired design.

**Component Features:**
- **No flip animation** - Static card, tap opens modal
- **Full-color photo** - Uses existing `image_url` without filters
- **Topic badge** - Shows first role/specialty in gold
- **Clean typography** - Name is prominent, topic is secondary but visible
- **Brand strip** - Up to 3 logos displayed at the bottom
- **Subtle hover** - Light scale + gold border glow (desktop)
- **Touch feedback** - `tap-scale` class for mobile

**Card Dimensions:**
- Mobile: `min-w-[180px]` (slightly wider than current 160px)
- Desktop: `min-w-[240px]`
- Aspect: `aspect-[3/4]` maintained

**Styling:**
- Container: `card-warm` background with gold border accent
- Photo: `object-cover object-top` (no grayscale filter)
- Topic: `text-xs text-primary uppercase tracking-wide font-semibold`
- Name: `text-lg font-bold text-foreground`
- Brands: Small logo pills in a flex row

### File 2: Update `src/pages/Home.tsx`

Replace `FlipMentorCard` import with `CleanMentorCard`:

```typescript
// Change from:
import { FlipMentorCard } from '@/components/shared/FlipMentorCard';

// To:
import { CleanMentorCard } from '@/components/shared/CleanMentorCard';
```

Update the carousel to use the new component:

```tsx
<CleanMentorCard
  key={mentor.id}
  mentor={mentorData}
  onClick={() => handleMentorClick(mentorData)}
/>
```

### File 3: Update `src/data/mentorsData.ts` (Optional Cleanup)

Since mentors are now stored in the database and fetched dynamically, this file may only serve as a type definition reference. The existing `Mentor` interface remains valid:

```typescript
export interface Mentor {
  id: string;
  name: string;
  title: string;
  roles: string[];  // First role = topic they teach
  imageUrl: string;
  modalImageUrl?: string;
  bio: string[];
  brands: MentorBrand[];
}
```

No changes needed to the interface.

### File 4: Keep `src/components/shared/FlipMentorCard.tsx` (RETAIN)

Keep the flip card component for potential future use or A/B testing. No modifications.

---

## Visual Specifications

### Color Photo Treatment
- **Current**: Photos may have grayscale or desaturated effects
- **New**: Full color, natural warmth
- **Image object fit**: `object-cover object-top` (faces centered at top)

### Typography Hierarchy
| Element | Style |
|---------|-------|
| Topic (role) | `text-xs text-primary uppercase tracking-wide font-semibold` |
| Name | `text-lg sm:text-xl font-bold text-foreground` |
| Brand text fallback | `text-[10px] font-medium text-muted-foreground` |

### Spacing
| Area | Value |
|------|-------|
| Card padding (content area) | `p-4` |
| Gap between topic and name | `mb-1` |
| Gap between name and brands | `mt-3` |
| Brand logo height | `h-6` |
| Brand pill spacing | `gap-2` |

### Hover Effects (Desktop Only)
- Scale: `hover:scale-[1.02]`
- Border glow: `hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]`
- Transition: `transition-all duration-300`

### Mobile Touch Feedback
- Uses existing `tap-scale` class from CSS
- Subtle press animation on tap

---

## Brand Logo Display Logic

The new card shows up to 3 brand logos at the bottom:

```typescript
// Show up to 3 brands with logos
const visibleBrands = mentor.brands.slice(0, 3);

// If no logo URL, show text badge instead
{brand.logoUrl ? (
  <img src={brand.logoUrl} alt={brand.name} className="h-5 max-w-[60px] object-contain" />
) : (
  <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
    {brand.name}
  </span>
)}
```

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/shared/CleanMentorCard.tsx` | CREATE | New GrowthX-inspired card design |
| `src/pages/Home.tsx` | MODIFY | Switch to CleanMentorCard in carousel |
| `src/components/shared/FlipMentorCard.tsx` | RETAIN | Keep for potential future use |

---

## Expected Outcome

1. **Warmer appearance** - Full color photos feel more personal and inviting
2. **Immediate credibility** - Brand logos visible without interaction
3. **Clear topic focus** - What they teach is shown first (gold text)
4. **Premium feel** - Clean spacing, gold accents, subtle animations
5. **Consistent with brand** - Uses existing `card-warm` and gold styling
6. **Mobile-first** - Wider cards with better touch feedback
7. **Future-ready** - Easy to add new mentors via admin panel

---

## Technical Notes

### Image Loading
- Maintains lazy loading with `loading="lazy"` attribute
- Uses `skeleton-premium` shimmer placeholder while loading
- Fade-in animation on load complete

### Responsive Sizing
- Mobile: `min-w-[180px]` for comfortable card width
- Tablet: `sm:min-w-[200px]`
- Desktop: `md:min-w-[240px]`

### Accessibility
- Full alt text on images: `alt={mentor.name}`
- Brand logos have descriptive alt text
- Sufficient color contrast on all text elements




# Improve Journey Toggle + Alumni Showcase Cards

## 1. Journey Toggle — Chip/Tag Style (Option B)

**Current:** A single grey pill container with two flat text buttons. Active state is a white rounded pill inside. Low contrast, generic.

**New design:** Two separate rounded chips side by side with a small gap. Active chip gets a filled amber/primary background with dark text. Inactive chip gets a ghost-outlined border with muted text. More tactile and distinct.

```text
  [ Online Sessions ]    [ Goa Bootcamp ]
   (filled amber bg)      (ghost border)
```

### Changes in `src/components/home/HomeJourneySection.tsx` (lines 224-249)
- Remove the wrapping `bg-muted rounded-full p-1` container
- Replace with a `flex gap-2` row
- Active button: `bg-primary text-primary-foreground font-medium rounded-full px-4 py-2 border border-primary`
- Inactive button: `bg-transparent text-muted-foreground rounded-full px-4 py-2 border border-border hover:border-foreground/30`

---

## 2. Alumni Showcase — Film Strip Carousel (Option C)

**Current:** Tiny 160-180px landscape cards, YouTube auto-thumbnails look washed out, big primary-colored play button dominates, "Student Film / by Forge Student" text sits outside the card.

**New design:** Wider landscape cards (~280px, 16:9 ratio) with:
- Thumbnail fills the entire card
- Subtle vignette gradient at the bottom only (not a heavy overlay)
- Film title + director name overlaid at bottom-left inside the gradient
- Play button: a smaller, frosted/semi-transparent circle (white/foreground with backdrop-blur) that appears on hover (desktop) and is always subtly visible on mobile
- Cards scroll horizontally with `scroll-snap-type: x mandatory`

```text
┌────────────────────────────────┐
│                                │
│        [thumbnail]             │
│                                │
│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│ The Last Slice          ▶     │
│ by Aanchal                     │
└────────────────────────────────┘
```

### Changes in `src/components/home/AlumniShowcaseSection.tsx` (lines 69-107)
- Card width: `w-[260px] sm:w-[300px]`
- Aspect ratio: `aspect-video` (16:9)
- Remove separate text below the thumbnail — move title + name inside the card as an overlay
- Vignette: `bg-gradient-to-t from-black/80 via-black/30 to-transparent` at bottom half only
- Play button: smaller (h-8 w-8), white/foreground with `backdrop-blur-sm`, `opacity-70 group-hover:opacity-100`
- Add `scroll-snap-align: start` and `scroll-snap-type: x mandatory` on the scroll container
- Remove the outer card border/bg wrapper for a cleaner edge-to-edge feel, keep just the header row

---

## Files Changed

| File | Change |
|---|---|
| `src/components/home/HomeJourneySection.tsx` | Replace pill toggle with chip/tag style buttons |
| `src/components/home/AlumniShowcaseSection.tsx` | Redesign cards as wider film-strip style with overlay text and subtle play button |

No database or backend changes needed.


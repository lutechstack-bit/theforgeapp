

# Partnership Hero Redesign - Premium Transparent Logo Display

## Summary
Remove the white card backgrounds completely and display Sony and Digitek logos directly on the gradient background. Create a premium, eye-catching layout with transparent logos, larger sizing, proper alignment, and elegant gold accents.

---

## Current vs New Design

### Current (Issues)
- White card backgrounds clash with dark theme
- Digitek white logo invisible on white cards
- Cards feel boxy and dated
- Logos appear small and cramped

### New (Premium)
- No card backgrounds - logos float on gradient
- Both logos work perfectly on dark gradient
- Open, breathing layout
- Large, prominent logos with gold glow effects

---

## Visual Design

```text
┌──────────────────────────────────────────────────────────────────┐
│              ✦ OFFICIAL PARTNERS ✦                              │
│                                                                  │
│           Exclusive Partner Pricing                              │
│                                                                  │
│     ┌─────────────────────────────────────────────────────┐     │
│     │                                                      │     │
│     │     [SONY LOGO]              [DIGITEK LOGO]         │     │  ← Transparent,
│     │      (large)                    (large)             │     │    floating on
│     │                                                      │     │    gradient
│     │   ───────────────        ───────────────            │     │
│     │                                                      │     │
│     │    Up to 25% off          Up to 30% off             │     │
│     │   Cameras & lenses      Lighting & gear             │     │
│     │                                                      │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                  │
│            ✧ Gold blur orbs for depth ✧                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### File: `src/components/perks/PartnershipHero.tsx` (MODIFY)

**Key Changes:**

1. **Remove white card backgrounds** - Replace `bg-white` with transparent containers
2. **Increase logo sizes** - From `h-10 md:h-14` to `h-14 md:h-20` for more prominence
3. **Add gold glow on logos** - Subtle `drop-shadow` effect for premium feel
4. **Enhance dividers** - Use animated gold gradient lines
5. **Improve typography** - Larger discount text, cream/gold description text
6. **Add hover animation** - Scale and glow effect on each partner section

**Updated Partner Display:**
```tsx
<div className="grid grid-cols-2 gap-6 md:gap-10 max-w-xl mx-auto">
  {partners.map((partner) => (
    <div
      key={partner.id}
      className="group flex flex-col items-center text-center py-4 transition-all duration-300 hover:scale-[1.03]"
    >
      {/* Logo - larger, with drop shadow for depth */}
      <div className="h-14 md:h-20 flex items-center justify-center mb-4 md:mb-5">
        <img
          src={partner.logo}
          alt={partner.name}
          className="h-full w-auto object-contain max-w-[120px] md:max-w-[160px] drop-shadow-[0_0_15px_rgba(255,188,59,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(255,188,59,0.5)] transition-all duration-300"
        />
      </div>
      
      {/* Gold divider line */}
      <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mb-4" />
      
      {/* Discount badge - more prominent */}
      <Badge className="bg-gradient-to-r from-primary to-deep-gold text-primary-foreground border-0 font-black text-sm md:text-base px-4 py-1.5 mb-2">
        {partner.discount}
      </Badge>
      
      {/* Description in cream/muted color */}
      <p className="text-xs md:text-sm text-muted-foreground/80 leading-tight">
        {partner.description}
      </p>
    </div>
  ))}
</div>
```

**Enhanced Container Styling:**
```tsx
<div className="relative mb-6 md:mb-8 overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/10 via-card/80 to-card border border-primary/30 shadow-lg">
  {/* Enhanced decorative blur orbs */}
  <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
  <div className="absolute bottom-0 left-0 w-36 md:w-48 h-36 md:h-48 bg-primary/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
  <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-deep-gold/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
  
  {/* Content with more padding */}
  <div className="relative p-6 md:p-10">
    ...
  </div>
</div>
```

---

## Visual Enhancements

| Element | Change | Effect |
|---------|--------|--------|
| Card backgrounds | Removed | Logos float elegantly on gradient |
| Logo size | `h-14 md:h-20` | 40% larger, more prominent |
| Logo effect | Gold drop-shadow | Premium glow, depth |
| Hover state | Scale + enhanced glow | Interactive feedback |
| Divider | Gold gradient, wider | Elegant separation |
| Discount badge | Larger font, more padding | Eye-catching |
| Blur orbs | Larger, extra center orb | Richer depth |
| Container border | `border-primary/30` | Slightly more visible gold edge |

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/perks/PartnershipHero.tsx` | MODIFY | Remove card backgrounds, larger logos, add gold glow effects |

---

## Expected Outcome

1. **Both logos visible** - Sony (black) and Digitek (white+red) both pop on the dark gradient
2. **Premium aesthetic** - Floating logos with gold glows, no boxy cards
3. **Eye-catching** - Larger logos, prominent discount badges, rich visual depth
4. **Consistent with brand** - Gold accents, dark theme, elite feel
5. **Interactive** - Subtle scale and glow on hover


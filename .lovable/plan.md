

# Revamp Roadmap, Perks & Events Pages — Match Homepage Visual Standard

Apply the same two changes we made on the homepage: (1) simple static `border border-[#FFBF00]/20` instead of heavy glows/shadows, and (2) replace generic Lucide icon boxes in section headers with the small Forge brand icon.

---

## Roadmap Page Changes

### RoadmapHero.tsx
- Remove `gradient-subtle` background div and `glass-premium` class
- Use simple `rounded-2xl border border-[#FFBF00]/20 bg-card p-6` instead
- Keep the status badges and text as-is

### RoadmapSummaryCards.tsx
- Replace `border-border/40 bg-card/60` and `hover:border-primary/30 hover:bg-card/80` on each card button with `border border-[#FFBF00]/20 bg-card` — no hover glow

### EquipmentSection.tsx (header)
- Remove the `p-2 rounded-lg bg-primary/10` icon box around `<Package>` icon
- Replace with Forge icon: `<img src={forgeIcon} className="w-4 h-4 opacity-60" />`

### EquipmentHeroCard.tsx
- Remove the 3 blur orb divs and `bg-gradient-to-br from-card via-card to-muted/30`
- Simplify to `rounded-2xl border border-[#FFBF00]/20 bg-card`

### EquipmentCard.tsx
- Remove `hover:shadow-[0_8px_40px_hsl(var(--primary)/0.15)] hover:-translate-y-1` and the hover ring overlay div
- Use `border border-[#FFBF00]/20` instead of `border-border/40 hover:border-primary/40`

### PrepChecklistSection.tsx (header)
- The category headers have `p-2 rounded-lg bg-secondary` icon boxes — replace with Forge icon for the main "Prep Checklist" section header (keep category-level icons since they're functional/meaningful for distinguishing categories)

### RulesGuidelines.tsx (section headers)
- Replace the `p-2 rounded-lg bg-destructive/10` / `bg-primary/10` / `bg-accent/10` icon boxes in the 3 section headers with the Forge brand icon
- Keep the individual rule card icons (they are functional — shield, clock, etc.)
- Replace `glass-card` on default rule cards with `bg-card border border-[#FFBF00]/20`
- Replace `gradient-subtle border border-primary/20` on the bottom note with `bg-card border border-[#FFBF00]/20`

---

## Perks Page Changes

### Perks.tsx
- **Acceptance Card**: Remove decorative blur orb div, remove `bg-gradient-to-br from-primary/15 via-card to-card`. Use `rounded-2xl border border-[#FFBF00]/20 bg-card`
- **Section headers** ("Perks Unlocked", "Your Forge Bag"): Remove the `w-9 h-9 rounded-xl bg-gradient-to-br` icon boxes around `<Gift>` and `<Package>`. Replace with Forge icon
- **Alumni Network perk card**: Remove `bg-gradient-to-br from-card via-card to-secondary/20`, `hover:shadow-gold-glow`, `hover:scale-[1.01]`. Use `bg-card border border-[#FFBF00]/20`
- **Alumni icon box**: Remove the `w-11 h-11 rounded-xl bg-gradient-to-br` container around `<Users>`. Keep the `<Users>` icon but without the decorative box
- **Bag item cards**: Remove `group-hover:from-primary group-hover:to-deep-gold` icon box effects. Use `bg-primary/10` static, no hover transformation
- **Footer note**: Remove `bg-gradient-to-br from-card to-secondary/50`. Use `bg-card border border-[#FFBF00]/20`. Remove the footer icon box

### PartnershipHero.tsx
- Remove the 3 decorative blur orb divs
- Remove `bg-gradient-to-br from-primary/10 via-card/80 to-card border border-primary/30 shadow-lg`
- Use `rounded-2xl border border-[#FFBF00]/20 bg-card`
- Remove `drop-shadow-[0_0_15px...]` and hover drop-shadow on partner logos
- Remove the gold divider line div
- Keep the partner logos, discount badges, and descriptions

---

## Events Page Changes

### CleanEventCard.tsx
- Remove `hover:shadow-[0_12px_40px_hsl(var(--primary)/0.15)] hover:-translate-y-1`
- Replace `border-border/50 hover:border-primary/30` with `border border-[#FFBF00]/20`
- Keep the image, badges, title overlay, and footer unchanged

### Events.tsx (section headers)
- "Upcoming" and "Past Events" headers use `section-title` class — these are already clean text. No change needed.

---

## Files Modified (11 total)

| File | Changes |
|---|---|
| `RoadmapHero.tsx` | Remove glass-premium + gradient-subtle, use amber border |
| `RoadmapSummaryCards.tsx` | Simplify card borders to amber, remove hover effects |
| `EquipmentSection.tsx` | Replace icon box header with Forge icon |
| `EquipmentHeroCard.tsx` | Remove blur orbs, use amber border |
| `EquipmentCard.tsx` | Remove hover shadow/translate/ring, use amber border |
| `PrepChecklistSection.tsx` | Replace main header icon box with Forge icon |
| `RulesGuidelines.tsx` | Replace section header icon boxes with Forge icon, amber borders on cards |
| `Perks.tsx` | Remove gradients/blurs/hovers, use amber borders, Forge icon headers |
| `PartnershipHero.tsx` | Remove blur orbs/shadows, use amber border |
| `CleanEventCard.tsx` | Remove hover shadow/translate, use amber border |
| `Events.tsx` | No change needed (already clean) |


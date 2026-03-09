

# Add Gold Hover Outline to Perk Cards

Add `hover:border-[#FFBF00]/60` effect to PerkCard, matching the amber border hover seen on event cards in the Learn page.

## Change: `src/components/perks/PerkCard.tsx`

**Banner mode (line 25-26):** Change border from `border-border/50` with `hover:shadow-lg` to static `border-[#FFBF00]/20` with `hover:border-[#FFBF00]/60` on hover (matching the project's section-ui-standard pattern).

**Fallback text mode (line 49-50):** Same treatment -- `border-[#FFBF00]/20` static, `hover:border-[#FFBF00]/60` on hover.

This aligns with the existing amber border convention used across all section cards (events, roadmap, home).




# Add Gold Glow Effect to Perk Cards

The perk cards currently have the gold border on hover but are missing the `hover-gold-glow` class that produces the ambient box-shadow glow (visible in the reference screenshots on Learn page cards).

## Change: `src/components/perks/PerkCard.tsx`

- **Banner mode (line 26):** Add `hover-gold-glow` to the non-disabled hover classes
- **Fallback text mode (~line 50):** Same addition

This class is already defined in `index.css` and applies `box-shadow: 0 0 20px hsl(var(--primary) / 0.3)` on hover. No other files need changes.


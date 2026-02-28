

# Remove "Start Learning" Button from Masterclass Cards

## Change

**`src/components/learn/MasterclassCard.tsx`** (lines 39-45):
- Remove the bottom gradient overlay (line 38) since it was only there to blend into the button area
- Remove the entire `<div className="p-2.5">` block containing the "Start Learning" button
- The card remains fully clickable via the existing `onClick={handleClick}` on the parent div

The card will show only the image with no button below it, matching the image-first visual standard already used by LevelUp cards.


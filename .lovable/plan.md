

# Remove Overlay Text from Pre Forge Session Cards

## Problem
The landscape card currently renders overlay text (title, instructor name, "Pre-Forge Session" label) on top of the card image. But the card images themselves already contain all that text baked in, causing a double-text effect.

## Solution
Remove all overlay text from the landscape variant in `LearnCourseCard.tsx`. The card should simply display the `thumbnail_url` image at the correct aspect ratio with no gradient overlay and no text -- just the raw image. Also replace the placeholder image with the newly uploaded clean version.

## Changes

### 1. Replace placeholder image
Copy `Adv_PP_3_1-2.png` to `public/images/learn/pre-forge-placeholder.png`, overwriting the current file.

### 2. Update `src/components/learn/LearnCourseCard.tsx`
Simplify the landscape variant to just render the image with no overlay:
- Remove the golden gradient overlay div
- Remove the "Pre-Forge Session" label
- Remove the title text overlay
- Remove the instructor/company text overlay
- Keep only: the image filling the card, rounded corners, hover scale effect, and click handler

The landscape block (currently lines ~49-97) becomes roughly:
```tsx
if (cardLayout === 'landscape') {
  return (
    <div onClick={handleClick} className="group cursor-pointer w-[320px] sm:w-[360px] flex-shrink-0">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border/30 group-hover:border-primary/30 transition-colors duration-300">
        <img
          src={thumbnailUrl || '/images/learn/pre-forge-placeholder.png'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
    </div>
  );
}
```

### 3. Database -- no change needed
The `thumbnail_url` values already point to `/images/learn/pre-forge-placeholder.png`. Later you can update each card's image individually from the admin panel.

## Files Modified

| File | Change |
|------|--------|
| `public/images/learn/pre-forge-placeholder.png` | Replaced with new clean card image |
| `src/components/learn/LearnCourseCard.tsx` | Removed all overlay text and gradient from landscape variant |


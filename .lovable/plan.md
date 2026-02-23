

# Simplify LevelUp Course Cards to Image-Only Design

## What Changes

Strip the `LevelUpCourseCard` component down to just the image -- remove all overlay elements (tags, wave icon, title text, accent text, instructor footer, gradient overlay, divider line). The card becomes a pure image card with rounded corners.

## Files Changed

| File | Change |
|---|---|
| `src/components/learn/LevelUpCourseCard.tsx` | Remove all overlay content: tags, wave SVG, gradient div, title, accent text, divider, instructor row, LevelUp logo. Keep only the image inside a rounded container with the same dimensions. |
| `src/pages/Learn.tsx` | Simplify the card data array -- remove `tags`, `title`, `accent`, `instructor`, `subtitle` fields since they are no longer rendered. Only `image` is needed per card. |

## Card Structure (after)

```
<div class="w-[260px] sm:w-[280px] aspect-[4/5] rounded-2xl overflow-hidden">
  <img src={imageUrl} class="w-full h-full object-cover" />
</div>
```

No gradient, no text, no icons -- just the image filling the rounded card.


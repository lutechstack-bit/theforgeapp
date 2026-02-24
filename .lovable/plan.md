

# Fix Uniform Card Sizes in Online Sessions

## Problem

The first card renders larger than the others because the image can influence the container's intrinsic sizing in a flex layout.

## Fix

In `src/components/learn/LevelUpCourseCard.tsx`, make two changes to the card container div:

1. Add `relative` positioning to the container and switch the image to `absolute inset-0` so it fills the card without affecting layout dimensions.
2. Add `flex-shrink-0` directly on the card container to prevent any flex compression or expansion.

## Updated markup

```tsx
<div className="w-[260px] sm:w-[280px] flex-shrink-0 aspect-[4/5] rounded-2xl overflow-hidden relative group cursor-pointer">
  <img
    src={imageUrl}
    alt=""
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    loading="lazy"
  />
</div>
```

Key changes:
- `relative` on container + `absolute inset-0` on image ensures the image never stretches the card beyond its fixed width
- `flex-shrink-0` on the card itself prevents flex compression

Only one file is changed: `src/components/learn/LevelUpCourseCard.tsx`.

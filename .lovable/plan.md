

# Pre Forge Sessions: Landscape Card Redesign

## What Changes

The "Pre Forge Sessions" cards on the Learn page currently use a portrait (3:4) aspect ratio. They will be changed to a landscape layout matching the uploaded reference image -- a wide card with a background image, session title overlaid in large bold text, and instructor name at the bottom left.

The uploaded image (`Adv_PP_3.png`) will be copied into the project and used as the default placeholder thumbnail for all pre-forge session cards.

A new `card_layout` column will be added to the `learn_content` table so admins can control the card style per content item from the backend (values: `portrait`, `landscape`).

## Visual Reference

The reference image shows:
- Landscape aspect ratio (~16:9)
- Full-bleed background image with warm golden overlay
- "Pre-Forge Session" label at top-left
- Large bold title text overlaid on the left side
- Instructor name and title at bottom-left
- No visible buttons or duration badges on the card itself

## File Changes

### 1. Database Migration
- Add `card_layout` column to `learn_content` table (type: `text`, default: `'portrait'`, nullable)
- This lets admins set `portrait` or `landscape` per content item

### 2. `src/components/learn/LearnCourseCard.tsx`
- Add `cardLayout` prop (default: `'portrait'`)
- When `cardLayout === 'landscape'`:
  - Change from `w-[180px]...aspect-[3/4]` to `w-[320px] sm:w-[360px] aspect-[16/10]`
  - Render a full-bleed image background with warm gradient overlay
  - Overlay "Pre-Forge Session" label at top-left with a small gold circle icon
  - Render the title in large bold black text on the left
  - Show instructor name and company at bottom-left
- When `portrait`, keep existing behavior unchanged

### 3. `src/pages/Learn.tsx`
- Pass `card_layout` from the fetched data (defaulting to `'portrait'` for backward compatibility) through to `CourseCarouselSection` and then to `LearnCourseCard`
- Copy the uploaded image to `public/images/learn/pre-forge-placeholder.png` and use it as the fallback thumbnail for `bfp_sessions` cards that don't have a custom thumbnail

### 4. Copy uploaded image
- Copy `user-uploads://Adv_PP_3.png` to `public/images/learn/pre-forge-placeholder.png`

## Technical Details

**New database column:**
```sql
ALTER TABLE public.learn_content
ADD COLUMN card_layout text DEFAULT 'portrait';
```

**LearnCourseCard landscape variant rendering:**
- Outer container: `w-[320px] sm:w-[360px]` with `aspect-[16/10]` and `rounded-2xl overflow-hidden relative`
- Background: `<img>` with `object-cover` filling the card
- Gradient overlay: warm golden gradient from left (`rgba(245,230,200,0.85)`) fading to transparent on right
- Top-left: gold circle + "Pre-Forge Session" label in small text
- Center-left: title in `text-xl sm:text-2xl font-black text-black` (up to 4 lines)
- Bottom-left: instructor name in `text-sm font-bold text-black`, company in `text-xs text-black/60`

**Data flow:**
- `learn_content.card_layout` is fetched alongside existing fields
- Passed through `CourseCarouselSection` props to `LearnCourseCard` as `cardLayout`
- Default fallback is `'portrait'` so all existing cards remain unchanged

## Files Modified

| File | Change |
|------|--------|
| Database migration | Add `card_layout` column to `learn_content` |
| `public/images/learn/pre-forge-placeholder.png` | New file -- uploaded image as placeholder |
| `src/components/learn/LearnCourseCard.tsx` | Add landscape variant with overlay design |
| `src/pages/Learn.tsx` | Pass `cardLayout` and default thumbnail for pre-forge cards |


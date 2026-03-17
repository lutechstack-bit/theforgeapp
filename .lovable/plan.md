

# Add Device Image Upload to Hero Carousel Admin

## Change
Add a file upload option (from device) alongside the existing URL input in the Hero Carousel Slides manager. No restriction on slide count.

## File Changes

| File | Change |
|------|--------|
| `src/pages/admin/AdminHomepage.tsx` | Add a tab toggle between "Upload Image" and "Paste URL" modes. In upload mode, show a file input that uploads to the `event-images` storage bucket under `hero-slides/` prefix, gets the public URL, and inserts the slide. Add upload loading state. |

## Implementation Details

1. **Two input modes** via a simple toggle: "Upload from Device" / "Paste URL"
2. **Upload flow**: `<input type="file" accept="image/*">` → upload to `event-images` bucket at `hero-slides/{timestamp}-{filename}` → get public URL → insert into `homepage_hero_slides`
3. **No count restriction** — current code already has none; just ensure unlimited adds work
4. **Loading indicator** on the Add button during upload
5. Uses the existing public `event-images` bucket (already has admin RLS)


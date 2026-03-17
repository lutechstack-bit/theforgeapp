
## Replace Program Banner Images

The user wants to swap the banner images for two online programs on the Learn page:
1. **Breakthrough Filmmaking** — replace with `user-uploads://banner_filmamking.jpg`
2. **Video Editing Academy** — replace with `user-uploads://02_copy.jpg`

### Current Setup
- `Learn.tsx` lines 288–308 define online programs with `ProgramBanner` components
- Breakthrough Filmmaking: `imageUrl="/images/programs/breakthrough-filmmaking.png"` (line 293)
- Video Editing Academy: `imageUrl="/images/programs/video-editing-academy.png"` (line 300)

### Changes

**1. Copy Assets**
- `user-uploads://banner_filmamking.jpg` → `public/images/programs/breakthrough-filmmaking.jpg`
- `user-uploads://02_copy.jpg` → `public/images/programs/video-editing-academy.jpg`

**2. Update File References in `Learn.tsx`**
- Line 293: Change `.png` to `.jpg` for Breakthrough Filmmaking
- Line 300: Change `.png` to `.jpg` for Video Editing Academy

### Why
The uploaded files are `.jpg` format. Overwriting the existing `.png` paths would require conversion. Instead, we update the extension references in the code to match the new asset format.

| File | Change |
|------|--------|
| Asset copy | `banner_filmamking.jpg` → `public/images/programs/breakthrough-filmmaking.jpg` |
| Asset copy | `02_copy.jpg` → `public/images/programs/video-editing-academy.jpg` |
| `Learn.tsx` line 293 | Change `.png` to `.jpg` |
| `Learn.tsx` line 300 | Change `.png` to `.jpg` |


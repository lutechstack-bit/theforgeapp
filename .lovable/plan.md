

# Fix Writers Click Behavior + Thumbnails + Admin Restructuring

## Issues Found

1. **Writers lightbox popup**: Only 1 of 4 Writing items ("Ocean Eyes, Starry Skies") has a `redirect_url`. The other 3 (Neelima, Sunny, Yuvraj) have `null`, so clicking them opens the image in a popup lightbox. You want all clicks to redirect externally — not open a popup.

2. **Creators broken thumbnails**: Vimeo items missing `thumbnail_url` show placeholders. Need auto-derive from video URL.

3. **Admin restructuring**: Move "Explore Programs" and "Alumni Showcase" out of Learn into separate admin pages.

## Plan

### 1. Fix Writers click behavior (`AlumniShowcaseSection.tsx`)
- For `media_type === 'image'`: if `redirect_url` exists, open it. If not, **do nothing** (no lightbox popup). Remove the image lightbox dialog entirely.
- Alternatively, if you want all 4 books to redirect, you'll need to add `redirect_url` values for the other 3 books via the admin panel.

### 2. Fix thumbnail auto-derivation (`AlumniShowcaseSection.tsx`)
- Update `getAutoThumbnail` to skip empty/null `thumbnail_url` and derive from `media_url` (Vimeo → vumbnail.com, YouTube → img.youtube.com).

### 3. Seed Filmmaking content (migration)
- Insert 4 FORGE rows with the YouTube URLs provided earlier.

### 4. Extract admin pages
- **Create** `src/pages/admin/AdminExplorePrograms.tsx` — extract Explore Programs tab from AdminLearn
- **Create** `src/pages/admin/AdminAlumniShowcase.tsx` — extract Alumni Showcase tab from AdminLearn  
- **Edit** `src/pages/admin/AdminLearn.tsx` — remove those two tabs
- **Edit** `src/components/admin/AdminLayout.tsx` — add sidebar entries
- **Edit** `src/App.tsx` — add routes

### 5. Admin form: auto-clear thumbnail on URL change
- In the Alumni Showcase admin form, when `media_url` changes, auto-clear `thumbnail_url` so fresh thumbnails are derived.

## Files

| Action | File |
|--------|------|
| Edit | `src/components/home/AlumniShowcaseSection.tsx` — remove image lightbox, fix thumbnails |
| Create | `src/pages/admin/AdminExplorePrograms.tsx` |
| Create | `src/pages/admin/AdminAlumniShowcase.tsx` |
| Edit | `src/pages/admin/AdminLearn.tsx` — remove extracted tabs |
| Edit | `src/components/admin/AdminLayout.tsx` — add nav items |
| Edit | `src/App.tsx` — add routes |
| Migration | Insert 4 FORGE rows into `alumni_showcase` |


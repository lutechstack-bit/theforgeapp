

# Replace Perks Banner Images

The user wants to swap the 3 perk card banner images with the newly uploaded versions.

## Changes

Copy uploaded images to overwrite the existing perk banners:
- `user-uploads://01_1-2.jpg` → `public/images/perks/sony-banner.jpg`
- `user-uploads://02_1-2.jpg` → `public/images/perks/digitek-banner.jpg`
- `user-uploads://03_1-2.jpg` → `public/images/perks/sandcastles-banner.jpg`

No code changes needed — the perk cards already reference these file paths via the database `banner_url` field.


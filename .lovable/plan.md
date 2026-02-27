

# Fix: Travel & Stay "Open in Maps" Button Hidden Behind Bottom Nav

The current `pb-8` (32px) on the Home content container isn't enough to clear the bottom nav bar (~68px + safe area). The `AppLayout` already has `pb-24` on `<main>`, but the inner container's `pb-8` may be conflicting or insufficient.

## Fix

### `src/pages/Home.tsx`
- Line 152: Change `pb-8` → `pb-24 md:pb-8` on the `space-y-6` container. This adds 96px bottom padding on mobile (matching the bottom nav height) while keeping modest padding on desktop where there's no bottom nav.


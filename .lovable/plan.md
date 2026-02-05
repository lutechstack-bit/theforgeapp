

# Fix Partner Logos on Published Site

## Problem Identified
The logos ARE working correctly in the **preview** (I can see both Sony and Digitek logos properly displayed). However, you're viewing the **published site** which:
1. Hasn't received the latest code changes yet (needs publishing)
2. May have old images cached in the browser for up to 30 days (current PWA cache setting)

---

## Solution: Cache-Busting + Reduced Caching

### Step 1: Add Cache-Busting to Logo URLs

Add a version query parameter to the logo URLs so browsers fetch fresh images instead of serving stale cached versions.

**File: `src/components/perks/PartnershipHero.tsx`**

```typescript
const partners = [
  {
    id: 'sony',
    name: 'Sony',
    logo: '/images/brands/sony.png?v=2',  // Cache-bust
    discount: 'Up to 25% off',
    description: 'Cameras, lenses & accessories',
  },
  {
    id: 'digitek',
    name: 'Digitek',
    logo: '/images/brands/digitek.png?v=2',  // Cache-bust
    discount: 'Up to 30% off',
    description: 'Lighting & production gear',
  },
];
```

### Step 2: Reduce Image Cache Duration (Optional)

Update the PWA configuration to cache images for 7 days instead of 30 days for faster updates.

**File: `vite.config.ts`**

Change the image cache expiration from 30 days to 7 days:
```typescript
runtimeCaching: [
  {
    urlPattern: /\.(?:png|jpg|jpeg|webp|gif)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "images-cache",
      expiration: { 
        maxEntries: 100, 
        maxAgeSeconds: 60 * 60 * 24 * 7  // Changed from 30 to 7 days
      },
    },
  },
],
```

---

## After Publishing

Once you publish, users will see:
- **New users / cleared cache**: Fresh logos immediately
- **Existing users**: Fresh logos due to cache-busting `?v=2` parameter

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/perks/PartnershipHero.tsx` | MODIFY | Add cache-busting query params to logo URLs |
| `vite.config.ts` | MODIFY | Reduce image cache from 30 to 7 days |

---

## Expected Outcome

1. Both Sony (white) and Digitek (white+red) logos display perfectly on the dark gradient
2. Cache-busting ensures fresh images are served after publishing
3. Future image updates will propagate faster (7 days vs 30 days cache)


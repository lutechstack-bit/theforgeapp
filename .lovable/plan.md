

# Simplify Stay Locations: Image Upload + Single Address Field

## Overview

Streamline the Stay Locations admin by:
1. **Adding direct image upload** from device (like Roadmap Sidebar)
2. **Replacing 4 address fields with 1** - a single "Full Address" textarea that you copy from Google Maps

---

## Current vs. Proposed

| Current (Complex) | Proposed (Simple) |
|-------------------|-------------------|
| Address Line 1 | **Full Address** (single textarea) |
| Address Line 2 | *(removed)* |
| City | *(removed)* |
| Postcode | *(removed)* |
| Google Maps URL | Google Maps URL (kept) |
| URL input for images | **Upload from device OR paste URL** |

---

## How It Will Work

**Admin Form Flow:**
1. Paste Google Maps link
2. Copy the full address from Google Maps into "Full Address" field
3. Upload images directly from device (or paste URL)

---

## Technical Changes

### 1. Database Migration

Consolidate address fields into a single `full_address` column:

```sql
-- Add new single address field
ALTER TABLE stay_locations ADD COLUMN full_address TEXT;

-- Migrate existing data (combine all address parts)
UPDATE stay_locations 
SET full_address = CONCAT_WS(', ', 
  NULLIF(address_line1, ''),
  NULLIF(address_line2, ''),
  NULLIF(city, ''),
  NULLIF(postcode, '')
)
WHERE address_line1 IS NOT NULL OR city IS NOT NULL;

-- Drop old columns
ALTER TABLE stay_locations DROP COLUMN address_line1;
ALTER TABLE stay_locations DROP COLUMN address_line2;
ALTER TABLE stay_locations DROP COLUMN city;
ALTER TABLE stay_locations DROP COLUMN postcode;
```

---

### 2. Admin Form Update (`AdminStayLocations.tsx`)

**Remove:** 4 address input fields (lines 412-450)

**Add:** Single textarea + Image upload tabs

```text
New Form Layout:
┌─────────────────────────────────────────────┐
│ Hotel/Stay Name*         │ Edition          │
├─────────────────────────────────────────────┤
│ Google Maps URL (paste full link)           │
├─────────────────────────────────────────────┤
│ Full Address                                │
│ ┌─────────────────────────────────────────┐ │
│ │ Copy the address from Google Maps here  │ │
│ │ (can be multiple lines)                 │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Featured Image                              │
│ ┌───────────────────────────────────────┐   │
│ │ [ Upload ]  [ URL ]  ← Tabs           │   │
│ ├───────────────────────────────────────┤   │
│ │ Click to upload or drag & drop        │   │
│ │ Max 10MB                              │   │
│ └───────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│ Gallery Images                              │
│ Each with Upload/URL tabs + caption         │
└─────────────────────────────────────────────┘
```

---

### 3. Modal Display Update (`StayLocationDetailModal.tsx`)

**Remove:** `formatAddress()` function that combines 4 fields

**Replace:** Simply display `full_address` with proper line breaks:

```tsx
// Before: formatAddress() combining 4 fields
// After: Single field with line break support
{location.full_address && (
  <p className="text-sm text-muted-foreground whitespace-pre-line">
    {location.full_address}
  </p>
)}
```

---

## Files to Modify

| File | Change |
|------|--------|
| **Database** | Add `full_address` column, migrate data, drop old 4 columns |
| `src/pages/admin/AdminStayLocations.tsx` | Replace 4 inputs with 1 textarea; add FileUpload tabs for images |
| `src/components/roadmap/StayLocationDetailModal.tsx` | Update to use `full_address` instead of combining 4 fields |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |

---

## UI Preview

**Admin Form (After):**
```text
┌──────────────────────────────────────────────────┐
│ Hotel/Stay Name*                                 │
│ [The Grand Hyderabad________________]            │
├──────────────────────────────────────────────────┤
│ Google Maps URL                                  │
│ [https://maps.google.com/...________]            │
├──────────────────────────────────────────────────┤
│ Full Address (copy from Google Maps)             │
│ ┌──────────────────────────────────────────────┐ │
│ │ Road No. 1, Banjara Hills,                   │ │
│ │ Hyderabad, Telangana 500034                  │ │
│ └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│ Featured Image                                   │
│  [ Upload ]  [ URL ]                             │
│ ┌──────────────────────────────────────────────┐ │
│ │  📤 Click to upload or drag image here       │ │
│ │     JPG, PNG, WebP • Max 10MB                │ │
│ └──────────────────────────────────────────────┘ │
│ [Preview thumbnail after upload]                 │
└──────────────────────────────────────────────────┘
```

---

## Summary

This simplifies Stay Location management from 6 fields to 3:
- **Hotel Name** (required)
- **Google Maps URL** (paste the link)
- **Full Address** (paste from Maps)

Plus adds proper **device image upload** matching the Roadmap Sidebar pattern.


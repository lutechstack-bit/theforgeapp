

# Fix Stay Locations Display + Admin Integration

## Problems Identified

### Issue 1: Stay Location Not Showing in Sidebar/FAB
The Stay Location "Bambolim Beach Resort" is currently mapped only to Writing editions (4 & 5), NOT Filmmaking Edition 14 where the test user is enrolled. The filtering logic is working correctly - the location simply needs to be assigned to more editions in the admin panel.

### Issue 2: Missing Thumbnail Image  
The Stay Location has no `featured_image_url` set but has 4 gallery images. The code uses `featured_image_url || ''` which results in an empty image URL. Need to fall back to the first gallery image.

### Issue 3: Interface Mismatch
`RoadmapSidebar.tsx` uses outdated field names (`city`, `address_line1`) that don't exist in the database. The database uses `full_address` (single textarea field).

### Issue 4: Admin Consolidation
Move the full Stay Locations admin functionality INTO the Roadmap Sidebar admin as a third tab.

---

## Part 1: Fix StayLocation Interface and Fallback Image

**File:** `src/components/roadmap/RoadmapSidebar.tsx`

**Changes:**
1. Update `StayLocation` interface to match database schema:
   - Replace `address_line1`, `address_line2`, `city`, `postcode` with `full_address`
2. Update carousel item mapping to use fallback image:
   ```typescript
   // Use featured_image_url OR first gallery image
   const stayItems = stayLocations.map(loc => ({
     id: loc.id,
     media_url: loc.featured_image_url || loc.gallery_images?.[0]?.url || '',
     title: loc.name,
     caption: loc.full_address?.split('\n')[0] || undefined // First line of address
   }));
   ```

---

## Part 2: Merge Stay Locations into Roadmap Sidebar Admin

**File:** `src/pages/admin/AdminRoadmapSidebar.tsx`

**Changes:**
1. Add a top-level tabbed interface with three tabs:
   - **Content** - Existing Past Moments & Student Work management
   - **Stay Locations** - Full Stay Locations admin (moved from separate page)

2. Import all Stay Locations functionality:
   - Queries for stay locations and edition mappings
   - CRUD mutations
   - Form state for contacts, notes, gallery images
   - Full form dialog with all fields (name, address, Google Maps, contacts, notes, gallery)

3. Remove `stay_locations` from `blockTypeConfig` (it uses a separate table, not `roadmap_sidebar_content`)

**Structure:**
```text
AdminRoadmapSidebar
├── Header: "Roadmap Sidebar Content"
├── Tabs
│   ├── Tab: "Content" (Past Moments & Student Work)
│   │   ├── Filters (block type, edition)
│   │   └── Grid of media cards
│   └── Tab: "Stay Locations"
│       ├── "Add Location" button
│       ├── Grid of location cards
│       └── Full form dialog (name, editions, address, contacts, notes, gallery)
```

---

## Part 3: Remove Separate Stay Locations Admin Page

**File:** `src/App.tsx`
- Remove route: `<Route path="stay-locations" element={<AdminStayLocations />} />`
- Remove import

**File:** `src/components/admin/AdminLayout.tsx`
- Remove nav item: `{ to: '/admin/stay-locations', icon: Building2, label: 'Stay Locations' }`

**File:** `src/pages/admin/AdminStayLocations.tsx`
- Delete this file (functionality merged)

---

## Part 4: Filter Stay Locations with Empty Images

**File:** `src/components/roadmap/SidebarStayCarousel.tsx`

**Changes:**
- Filter out items with empty `media_url` before rendering
- This prevents showing broken image placeholders

```typescript
const validItems = items.filter(item => item.media_url);
if (!validItems || validItems.length === 0) {
  // Show "Coming soon" placeholder
}
```

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/roadmap/RoadmapSidebar.tsx` | Edit | Fix interface, add fallback image logic |
| `src/components/roadmap/SidebarStayCarousel.tsx` | Edit | Filter out empty media_url items |
| `src/pages/admin/AdminRoadmapSidebar.tsx` | Major Edit | Add Stay Locations tab with full CRUD |
| `src/components/admin/AdminLayout.tsx` | Edit | Remove Stay Locations nav item |
| `src/App.tsx` | Edit | Remove stay-locations route |
| `src/pages/admin/AdminStayLocations.tsx` | Delete | Functionality merged |

---

## Expected Result

### Sidebar Display
- Stay Location will show with first gallery image as thumbnail when no featured image
- Caption will show first line of full address instead of missing `city` field
- Properly filters by user's edition

### Admin Experience
- Single "Roadmap Sidebar" admin page with tabbed interface
- "Content" tab for Past Moments & Student Work (simple media)
- "Stay Locations" tab for rich location management (contacts, notes, gallery)
- Cleaner navigation without separate Stay Locations entry

### Data Requirements
- Admin needs to assign Stay Location to Filmmaking Edition 14 for it to appear for that cohort


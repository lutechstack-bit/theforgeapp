

# Enhanced Stay Location Detail View

## Overview

Add a comprehensive "Stay Location" detail modal/page with hotel name, address, contacts, important notes, and image gallery - all dynamic and admin-manageable.

---

## Current State

The `stay_locations` block in `roadmap_sidebar_content` only stores:
- `media_url` (image)
- `title` (optional)
- `caption` (optional)

This is insufficient for the rich detail view shown in the reference.

---

## Solution Architecture

### 1. Database Schema Update

Create a new `stay_locations` table with all the detailed fields:

```sql
CREATE TABLE stay_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  google_maps_url TEXT,
  
  -- Contacts (JSONB array)
  contacts JSONB DEFAULT '[]',
  -- Format: [{ "name": "Thrishal", "phone": "900863973" }]
  
  -- Things to keep in mind (JSONB array)
  notes JSONB DEFAULT '[]',
  -- Format: ["Location specific information", "Airport info", ...]
  
  -- Gallery images (JSONB array)
  gallery_images JSONB DEFAULT '[]',
  -- Format: [{ "url": "...", "caption": "..." }]
  
  -- Featured image (hero/main image)
  featured_image_url TEXT,
  
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. New UI Components

#### A. `StayLocationDetailModal.tsx`
A premium modal matching the app's design system with:

```
┌──────────────────────────────────────────┐
│ Where You'll Stay                    [X] │
├──────────────────────────────────────────┤
│                                          │
│  [Hotel Name]                            │
│  Address Line 1                          │
│  City, Postcode                          │
│  📍 View on Google Maps                  │
│                                          │
│  ┌──────────────┐                        │
│  │   Contact    │                        │
│  │ Thrishal - 9008... │                  │
│  │ Hiresh - 9836...   │                  │
│  └──────────────┘                        │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │ Things to Keep in Mind              │ │
│  │ 1. Location specific information    │ │
│  │ 2. Airport information              │ │
│  │ 3. Packing essentials note          │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  [───────── Image Gallery ──────────]    │
│  [img1] [img2] [img3] ← scrollable       │
│                                          │
└──────────────────────────────────────────┘
```

#### B. Mobile Layout (Stacked)
```
┌─────────────────────────┐
│ Where You'll Stay   [X] │
├─────────────────────────┤
│ [Hotel Name]            │
│ Address Line 1          │
│ City, Postcode          │
│ 📍 View on Maps         │
├─────────────────────────┤
│ [Image Gallery Carousel]│
│ ← swipe →               │
├─────────────────────────┤
│ Contact                 │
│ • Thrishal - 900...     │
│ • Hiresh - 983...       │
├─────────────────────────┤
│ Things to Keep in Mind  │
│ 1. Location specific... │
│ 2. Airport info...      │
│ 3. Packing essentials   │
└─────────────────────────┘
```

### 3. Admin Panel Updates

Create `AdminStayLocations.tsx` with:
- CRUD for stay locations
- Multi-image upload for gallery
- Dynamic contacts management (add/remove)
- Dynamic notes/tips management (add/remove)
- Edition assignment

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/components/roadmap/StayLocationDetailModal.tsx` | Rich detail modal |
| `src/pages/admin/AdminStayLocations.tsx` | Admin management page |

### Modified Files
| File | Change |
|------|--------|
| `src/components/roadmap/SidebarStayCarousel.tsx` | Pass full stay data to modal |
| `src/components/roadmap/RoadmapSidebar.tsx` | Fetch from new table, use new modal |
| `src/components/home/RoadmapBentoBox.tsx` | Update to use new stay data |
| `src/components/admin/AdminLayout.tsx` | Add nav link to new admin page |
| `src/App.tsx` | Add route for new admin page |

---

## Implementation Details

### Database Migration
```sql
-- Create enhanced stay_locations table
CREATE TABLE stay_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES editions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  google_maps_url TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  featured_image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE stay_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stay locations" ON stay_locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage stay locations" ON stay_locations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
```

### StayLocationDetailModal.tsx Structure
```tsx
// Key sections:
// 1. Header with hotel name
// 2. Address block with Google Maps link
// 3. Contact pill/card
// 4. Notes section (light pink/cream background)
// 5. Image gallery carousel
```

### AdminStayLocations.tsx Features
- List view with cards showing featured image + name
- Add/Edit dialog with:
  - Name, address fields
  - Google Maps URL input
  - Dynamic contacts list (+ Add Contact button)
  - Dynamic notes list (+ Add Note button)
  - Multi-image gallery upload
  - Featured image selection

---

## UI Design Alignment

### Colors & Style (Matching Current App)
- Background: Dark glassmorphism (`bg-black/60 backdrop-blur-xl`)
- Cards: `glass-card rounded-xl`
- Notes section: Light rose/cream accent (`bg-rose-50/10` or `bg-primary/5`)
- Contact pill: Rounded pill with muted background
- Buttons: Ghost/outline variants
- Typography: `font-semibold` for headings, `text-muted-foreground` for secondary

### Mobile Responsiveness
- Single column layout on mobile
- Full-width image carousel
- Touch-friendly contact buttons (tap to call)
- Collapsible sections if content is long

---

## Data Flow

```
┌─────────────────────────┐
│    Admin Panel          │
│  AdminStayLocations     │
└───────────┬─────────────┘
            │ CRUD
            ▼
┌─────────────────────────┐
│    stay_locations       │
│    (new table)          │
└───────────┬─────────────┘
            │ fetch
            ▼
┌─────────────────────────┐
│   RoadmapSidebar.tsx    │
│   SidebarStayCarousel   │
└───────────┬─────────────┘
            │ onViewAll()
            ▼
┌─────────────────────────┐
│ StayLocationDetailModal │
│  (rich detail view)     │
└─────────────────────────┘
```

---

## Summary

| Component | Action |
|-----------|--------|
| Database | Create `stay_locations` table with rich schema |
| StayLocationDetailModal | New premium modal component |
| AdminStayLocations | New admin page for management |
| SidebarStayCarousel | Connect to new modal |
| RoadmapSidebar | Fetch from new table |
| Routes/Navigation | Add admin route |

This provides a complete, admin-customizable stay location system that matches the app's premium dark aesthetic while being fully responsive on mobile.


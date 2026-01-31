
# Add Floating Highlights Button to Home + Reorganize Admin Navigation

## Overview

This plan addresses three requests:
1. **Keep Stay Locations admin inside Roadmap Sidebar** - Move it from separate nav to be grouped under Roadmap Sidebar
2. **Add floating highlights button to Home screen (mobile)** - Same FAB that exists on Roadmap
3. **Add Roadmap Sidebar (highlights) to Home screen (desktop/web view)** - Show the full sidebar panel
4. **Remove "Forge Highlights" heading from RoadmapBentoBox** - This bento box is being replaced with the actual sidebar

---

## Part 1: Home Screen - Mobile Floating Button

Add the same `FloatingHighlightsButton` component that exists on the Roadmap page to the Home page.

**File:** `src/pages/Home.tsx`

**Changes:**
- Import `FloatingHighlightsButton` from roadmap components
- Get `profile` from `useAuth()` to access `edition_id`
- Add `FloatingHighlightsButton` at the end of the component with `editionId` prop
- The button is already set to `lg:hidden` so it only shows on mobile/tablet

```tsx
import FloatingHighlightsButton from '@/components/roadmap/FloatingHighlightsButton';

// Inside the component:
<FloatingHighlightsButton editionId={profile?.edition_id} />
```

---

## Part 2: Home Screen - Desktop Sidebar Panel

Add the `RoadmapSidebar` to the home page for desktop users (lg: breakpoint and above).

**File:** `src/pages/Home.tsx`

**Changes:**
- Import `RoadmapSidebar` from roadmap components
- Restructure the layout to a grid with main content + sidebar panel on desktop
- Desktop layout: `grid-cols-[1fr_280px]` for main content + sidebar
- Mobile layout: single column (sidebar hidden, FAB accessible)

**New Layout Structure:**
```text
Desktop (lg:):
┌─────────────────────────────────────┬──────────────┐
│  Main Content                       │  Sidebar     │
│  - Countdown                        │  - Moments   │
│  - Journey Timeline                 │  - Student   │
│  - Mentors                          │    Work      │
│  - (Remove old bento)               │  - Stay      │
│  - Alumni                           │    Location  │
│  - Learn                            │              │
│  - Events                           │              │
└─────────────────────────────────────┴──────────────┘

Mobile:
┌─────────────────────────────────────┐
│  Main Content (full width)          │
│  - Countdown                        │
│  - Journey Timeline                 │
│  - Mentors                          │
│  - (No bento box)                   │
│  - Alumni                           │
│  - Learn                            │
│  - Events                           │
│                                     │
│  [FAB for Highlights at bottom-24]  │
└─────────────────────────────────────┘
```

---

## Part 3: Remove RoadmapBentoBox from Home

Since the sidebar provides the same content (Past Moments, Student Work) with autoplay carousels, the simplified bento box is redundant.

**File:** `src/pages/Home.tsx`

**Changes:**
- Remove the `import { RoadmapBentoBox }` line
- Remove the `<RoadmapBentoBox />` component from the JSX

---

## Part 4: Admin - Move Stay Locations Under Roadmap Sidebar

The user wants Stay Locations to be grouped with Roadmap Sidebar in the admin navigation instead of being a separate nav item.

**Option A:** Create a Roadmap group in admin nav with sub-items
**Option B:** Simply reorder the nav items to group Roadmap-related items together

Since the admin layout currently uses a flat list, Option B is cleaner.

**File:** `src/components/admin/AdminLayout.tsx`

**Changes:**
- Move `Stay Locations` nav item to be directly after `Roadmap Sidebar`
- The current order is already:
  - Roadmap
  - Roadmap Sidebar
  - Stay Locations (already grouped!)
  - Equipment
  
The current grouping is already correct! No changes needed to the admin navigation structure.

---

## Files to Change

### 1. `src/pages/Home.tsx`

**Changes:**
- Import `FloatingHighlightsButton` and `RoadmapSidebar`
- Restructure layout to include sidebar panel on desktop
- Remove `RoadmapBentoBox` import and usage
- Add `FloatingHighlightsButton` for mobile

### 2. No changes needed to `src/components/admin/AdminLayout.tsx`

The Stay Locations is already placed right after Roadmap Sidebar in the nav structure.

---

## Technical Implementation

### Updated Home.tsx Structure

```tsx
import FloatingHighlightsButton from '@/components/roadmap/FloatingHighlightsButton';
import RoadmapSidebar from '@/components/roadmap/RoadmapSidebar';
// Remove: import { RoadmapBentoBox } from '@/components/home/RoadmapBentoBox';

return (
  <div className="min-h-screen">
    {/* Desktop Layout with Sidebar */}
    <div className="flex gap-6 px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-6">
      
      {/* Main Content Column */}
      <div className="flex-1 space-y-5 sm:space-y-6">
        <CompactCountdownTimer edition={edition} />
        <HomeJourneySection />
        
        {/* Mentors */}
        {mentors && mentors.length > 0 && (
          <ContentCarousel title="Meet Your Mentors">...</ContentCarousel>
        )}

        {/* No more RoadmapBentoBox here */}

        {/* Alumni Testimonials */}
        {alumniTestimonials && ...}
        
        {/* Learn Section */}
        {displayLearnContent.length > 0 && ...}
        
        {/* Events Section */}
        {displayEvents.length > 0 && ...}
      </div>
      
      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
        <div className="sticky top-24">
          <RoadmapSidebar editionId={profile?.edition_id} />
        </div>
      </div>
    </div>

    {/* Mobile Floating Button - Hidden on desktop */}
    <FloatingHighlightsButton editionId={profile?.edition_id} />
  </div>
);
```

---

## Summary

| Change | File | Purpose |
|--------|------|---------|
| Add FloatingHighlightsButton | Home.tsx | Mobile access to highlights |
| Add RoadmapSidebar | Home.tsx | Desktop sidebar panel with highlights |
| Remove RoadmapBentoBox | Home.tsx | Replaced by actual sidebar |
| Keep Stay Locations grouped | AdminLayout.tsx | Already correct - no change needed |

---

## Expected Result

### Mobile View
- Home page shows main content with Floating Highlights FAB at bottom-right
- Tapping FAB opens the same bottom sheet as Roadmap page
- Shows Past Moments, Student Work, and Stay Location carousels

### Desktop View  
- Home page has a 2-column layout
- Main content on the left (~75% width)
- Sidebar panel on the right (~25% width) with:
  - Past Moments carousel (autoplay)
  - Student Work carousel (autoplay)
  - Stay Location carousel (autoplay)
- Sidebar is sticky and scrolls with content

### Admin Panel
- Navigation already has Stay Locations grouped with Roadmap items
- No changes needed

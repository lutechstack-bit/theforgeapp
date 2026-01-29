
# Enhanced Deep Links: Direct Navigation to Specific Task Locations

## Problem Statement

Currently, when a user clicks "Go" on a journey task (e.g., "Check packing essentials list"), they are redirected to a general page like `/roadmap/prep`. However, the user expects to land **directly on the specific item or section** related to that task.

**Current Flow:**
```
Task: "Check packing essentials list" → /roadmap/prep → User sees entire Prep page
Task: "Connect your Instagram" → /profile → User sees entire Profile page
```

**Expected Flow:**
```
Task: "Check packing essentials list" → /roadmap/prep#packing → Auto-scroll to "Packing Essentials" section
Task: "Connect your Instagram" → /profile#instagram → Auto-open Profile Edit Sheet + scroll to Instagram field
```

---

## Current Data Structure

The `journey_tasks` table has a `deep_link` field with values like:
| Task | Current deep_link |
|------|-------------------|
| Complete your Forge form | `/kyf` |
| Set up your profile with photo | `/profile` |
| Check packing essentials list | `/roadmap/prep` |
| Connect your Instagram | `/profile` |
| Book your travel | `/roadmap/prep` |

**Issue:** No specificity for scroll targets or section identifiers.

---

## Solution Architecture

### Phase 1: Enhance Deep Links with Hash Fragments

Update `deep_link` values in the database to include specific section targets:

| Task | Enhanced deep_link |
|------|-------------------|
| Complete your Forge form | `/kyf` (no change - full page form) |
| Set up your profile with photo | `/profile?action=edit&section=photo` |
| Check packing essentials list | `/roadmap/prep#packing` |
| Connect your Instagram | `/profile?action=edit&section=instagram` |
| Book your travel | `/roadmap/prep#travel` |
| Prepare your prop list | `/roadmap/prep#script_prep` |
| Note emergency contacts | `/roadmap/prep#emergency` |

### Phase 2: Add Scroll-to-Section Logic in Destination Pages

**1. RoadmapPrep.tsx** - Add hash-based auto-scroll
- Parse URL hash on mount (e.g., `#packing`)
- Find the corresponding category section
- Scroll into view with smooth animation + highlight effect

**2. Profile.tsx** - Add query param-based action handling
- Parse `?action=edit` to auto-open `ProfileEditSheet`
- Parse `&section=instagram` to scroll/focus the Instagram field

**3. PrepChecklistSection.tsx** - Add element IDs for scroll targets
- Add `id={category}` to each category Card for anchor linking
- Add highlight animation when scrolled to

---

## Technical Implementation

### Database Updates

```sql
-- Update deep_links to include section targets
UPDATE journey_tasks SET deep_link = '/roadmap/prep#packing' WHERE title ILIKE '%packing%';
UPDATE journey_tasks SET deep_link = '/roadmap/prep#script_prep' WHERE title ILIKE '%prop list%';
UPDATE journey_tasks SET deep_link = '/profile?action=edit&section=instagram' WHERE title ILIKE '%instagram%';
UPDATE journey_tasks SET deep_link = '/profile?action=edit&section=photo' WHERE title ILIKE '%photo%';
```

### File: `src/pages/roadmap/RoadmapPrep.tsx`

Add a `useEffect` hook to:
1. Read `window.location.hash` on mount
2. Wait for DOM render (short timeout)
3. Find element by ID matching the hash
4. Scroll into view with `{ behavior: 'smooth', block: 'center' }`
5. Add temporary highlight class

```tsx
// New logic to add
useEffect(() => {
  const hash = window.location.hash.slice(1); // Remove '#'
  if (hash) {
    // Wait for DOM to render
    setTimeout(() => {
      const element = document.getElementById(`prep-${hash}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-pulse');
        setTimeout(() => element.classList.remove('highlight-pulse'), 2000);
      }
    }, 300);
  }
}, []);
```

### File: `src/components/roadmap/PrepChecklistSection.tsx`

Add `id` attributes to category cards:

```tsx
// Line ~126
<Card 
  key={category} 
  id={`prep-${category}`} 
  className="glass-card overflow-hidden transition-all duration-500"
>
```

### File: `src/pages/Profile.tsx`

Add query param handling for auto-opening edit sheet:

```tsx
// Add to Profile component
import { useSearchParams } from 'react-router-dom';

// Inside component
const [searchParams, setSearchParams] = useSearchParams();
const actionParam = searchParams.get('action');
const sectionParam = searchParams.get('section');

useEffect(() => {
  if (actionParam === 'edit') {
    setEditSheetOpen(true);
    // Clear params after opening
    setSearchParams({});
  }
}, [actionParam]);
```

### File: `src/components/profile/ProfileEditSheet.tsx`

Add scroll-to-section on open:

```tsx
// Add refs to key fields
const instagramRef = useRef<HTMLDivElement>(null);
const photoRef = useRef<HTMLDivElement>(null);

// Scroll to section when sheet opens
useEffect(() => {
  if (open && sectionParam) {
    setTimeout(() => {
      const refMap = { instagram: instagramRef, photo: photoRef };
      refMap[sectionParam]?.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
}, [open, sectionParam]);
```

### File: `src/index.css`

Add highlight animation:

```css
.highlight-pulse {
  animation: highlight-pulse 2s ease-out;
}

@keyframes highlight-pulse {
  0% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4); }
  50% { box-shadow: 0 0 0 8px hsl(var(--primary) / 0.2); }
  100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/roadmap/RoadmapPrep.tsx` | Add hash-based scroll logic |
| `src/components/roadmap/PrepChecklistSection.tsx` | Add `id` attributes to category cards |
| `src/pages/Profile.tsx` | Add query param handling for auto-edit |
| `src/components/profile/ProfileEditSheet.tsx` | Add scroll-to-section on open |
| `src/index.css` | Add highlight animation |
| Database migration | Update `deep_link` values with section targets |

---

## User Experience Flow

**Before:**
1. User clicks "Check packing essentials list"
2. Lands on `/roadmap/prep` 
3. Manually scrolls to find "Packing Essentials" section

**After:**
1. User clicks "Check packing essentials list"
2. Lands on `/roadmap/prep#packing`
3. Page auto-scrolls to "Packing Essentials" section with a subtle highlight
4. User can immediately check off items

---

## Edge Cases Handled

1. **Hash doesn't exist**: No scroll, user sees full page
2. **Section not yet rendered**: 300ms delay allows DOM to paint
3. **Query params cleaned up**: Removed after action to prevent re-triggering on refresh
4. **Mobile support**: Scroll behavior works identically on mobile bottom sheet

---

## Summary

This enhancement adds:
- **Section-specific deep links** using URL hash fragments and query params
- **Auto-scroll with highlight** to draw user attention
- **Auto-open Profile Edit Sheet** for profile-related tasks
- **Clean URL handling** to prevent repeated actions on refresh

The result is a seamless flow where journey tasks take users directly to the exact location where they can complete that task.

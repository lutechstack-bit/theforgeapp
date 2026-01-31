
# Comprehensive Fix: Cohort-Specific Roadmap Content

## Problems Found

### Problem 1: Roadmap Showing Wrong Content (CRITICAL)
**Location:** `src/hooks/useRoadmapData.ts` (Lines 25-37)

The code always fetches the shared template (`edition_id IS NULL`) which contains **Filmmaking-specific content**:
- "Orientation & Visual Storytelling"
- "Cinematography Masterclass"
- "Direction & Storytelling"

But the database has **cohort-specific content** stored by edition_id:

| Cohort | Example Days |
|--------|--------------|
| **FORGE** (Filmmaking) | Cinematography Masterclass, Direction & Storytelling |
| **FORGE_WRITING** | Psychology of Storytelling, Advanced Writing & Mentorship |
| **FORGE_CREATORS** | Mindset Reset, Shoot Day 1, Brand & Monetization |

---

### Problem 2: Equipment Tab Shouldn't Appear for Writers/Creators
**Location:** `src/components/roadmap/RoadmapLayout.tsx`

Current logic only hides Equipment for Writers:
```tsx
const showEquipment = userCohortType !== 'FORGE_WRITING';
```

But Creators also have **zero equipment** in the database. The Equipment tab should only appear when there's actual data.

---

### Problem 3: Hardcoded "Filmmaking Arsenal" Label
**Location:** `src/components/roadmap/EquipmentSection.tsx`

The section displays "Your Filmmaking Arsenal" even when empty or for other cohorts.

---

## Solution

### Fix 1: Fetch Edition-Specific Roadmap Days

**File:** `src/hooks/useRoadmapData.ts`

**Current Logic:**
```tsx
// Always fetches shared template (Filmmaking content)
.is('edition_id', null)
```

**New Logic:**
1. First, try to fetch days matching user's `edition_id`
2. If no edition-specific days exist, fall back to shared template
3. This ensures Writers see "Psychology of Storytelling" and Creators see "Mindset Reset"

---

### Fix 2: Data-Driven Equipment Tab Visibility

**File:** `src/components/roadmap/RoadmapLayout.tsx`

Add a query to check if equipment exists for the user's cohort before showing the tab.

```tsx
// Query equipment count for this cohort
const { data: equipmentCount } = useQuery({
  queryKey: ['equipment-count', userCohortType],
  queryFn: async () => {
    const { count } = await supabase
      .from('forge_equipment')
      .select('*', { count: 'exact', head: true })
      .eq('cohort_type', userCohortType)
      .eq('is_active', true);
    return count || 0;
  }
});

// Only show equipment tab if there's data
const showEquipment = (equipmentCount || 0) > 0;
```

This is **data-driven** - if you add equipment for Writers later, the tab automatically appears.

---

### Fix 3: Remove Empty Equipment Section Fallback

Since the Equipment tab now only appears when data exists, we can simplify the EquipmentSection component by removing the empty state (the tab won't be accessible anyway).

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useRoadmapData.ts` | Update query to fetch edition-specific days with fallback |
| `src/components/roadmap/RoadmapLayout.tsx` | Add equipment count query for data-driven tab visibility |

---

## Technical Implementation

### 1. useRoadmapData.ts - Edition-Specific Days Query

```tsx
// Fetch roadmap days - prioritize edition-specific, fallback to template
const { data: templateDays, isLoading: isLoadingDays } = useQuery({
  queryKey: ['roadmap-days', profile?.edition_id],
  queryFn: async () => {
    // First, try to get edition-specific days
    if (profile?.edition_id) {
      const { data: editionDays, error: editionError } = await supabase
        .from('roadmap_days')
        .select('*')
        .eq('edition_id', profile.edition_id)
        .order('day_number', { ascending: true });
      
      if (!editionError && editionDays && editionDays.length > 0) {
        return editionDays as RoadmapDay[];
      }
    }
    
    // Fallback to shared template if no edition-specific days
    const { data, error } = await supabase
      .from('roadmap_days')
      .select('*')
      .is('edition_id', null)
      .order('day_number', { ascending: true });
    
    if (error) throw error;
    return data as RoadmapDay[];
  },
  enabled: !!profile?.edition_id
});
```

### 2. RoadmapLayout.tsx - Equipment Count Check

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Inside component:
const { data: equipmentCount } = useQuery({
  queryKey: ['equipment-count', userCohortType],
  queryFn: async () => {
    const { count, error } = await supabase
      .from('forge_equipment')
      .select('*', { count: 'exact', head: true })
      .eq('cohort_type', userCohortType)
      .eq('is_active', true);
    if (error) return 0;
    return count || 0;
  },
  enabled: !!userCohortType
});

const showEquipment = (equipmentCount || 0) > 0;
```

---

## Expected Behavior After Fix

| User Cohort | Journey Content | Equipment Tab |
|-------------|-----------------|---------------|
| **FORGE** (Filmmaking) | "Cinematography Masterclass" | ✅ Visible (13 items) |
| **FORGE_WRITING** | "Psychology of Storytelling" | ❌ Hidden (0 items) |
| **FORGE_CREATORS** | "Mindset Reset", "Shoot Day 1" | ❌ Hidden (0 items) |

---

## Mobile & Desktop Compatibility

Both fixes are **purely data/logic changes** - no UI modifications needed:
- The QuickActionsBar already handles responsive layouts with `flex-1 sm:flex-none`
- Equipment tab will simply not appear in the nav tabs when hidden
- All existing touch targets and spacing remain unchanged

---

## Data Flow After Fix

```text
User Login
    ↓
AuthContext loads profile.edition_id + edition.cohort_type
    ↓
useRoadmapData:
  ├── Query roadmap_days WHERE edition_id = user's edition
  │   ├── Has data? → Use edition-specific content
  │   └── No data? → Fallback to shared template
  └── Query equipment count for cohort_type
    ↓
RoadmapLayout:
  ├── showEquipment = equipmentCount > 0
  └── QuickActionsBar receives hasEquipment prop
    ↓
QuickActionsBar:
  └── Only shows Equipment tab if hasEquipment is true
```

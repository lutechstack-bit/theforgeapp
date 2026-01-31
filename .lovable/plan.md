

# Complete Fix: Cohort-Specific Roadmap Content Issues

## Issues Identified

### Issue 1: Writing Users See Filmmaking Content (CRITICAL)
**Root Cause Found:** The current Writing users are assigned to edition `cf2b9fd2-a3da-4d0b-8370-da0937f9d786` (Forge Writing - Edition 5 - Goa), but this edition has **0 roadmap days**.

**Database Evidence:**
| Edition | Cohort Type | Roadmap Days |
|---------|-------------|--------------|
| Forge Writing - Edition 5 - Goa | FORGE_WRITING | **0** |
| Forge Writing - Edition 4 - Goa | FORGE_WRITING | **0** |
| Forge Writing - Goa Jan 2025 | FORGE_WRITING | 7 ✓ |

The code correctly falls back to the shared template when no edition-specific days exist, but the shared template contains **Filmmaking content** ("Orientation & Visual Storytelling", "Cinematography Masterclass", etc.).

**This is a DATA issue, not a code issue.** However, we need a better solution than falling back to filmmaking content.

---

### Issue 2: Online/Virtual Sessions Showing for Writers
**Current Behavior:** The screenshots show "Online" badges and virtual session content for the Writing cohort.

**Expected Behavior:** Per the existing memory:
> "This feature is restricted at the UI level to Filmmaking and Creators cohorts; all virtual UI elements and session notifications are hidden for the 'FORGE_WRITING' cohort as they skip the online stage."

**Root Cause:** The JourneyCard correctly checks `cohortType !== 'FORGE_WRITING'` for virtual indicators, BUT since the data is falling back to the Filmmaking template (which has `is_virtual: true` for days 1-3), the data itself contains virtual meeting info.

---

### Issue 3: Zoom Link Feature Not Working
**Analysis:** The SessionMeetingCard component is well-implemented with:
- Join Now button that opens meeting URL
- Copy meeting ID/passcode functionality  
- Calendar sync (Google + Apple)
- Platform detection (Zoom, Meet, Teams)

However, it's only shown when `forgeMode === 'DURING_FORGE'` and `cohortType !== 'FORGE_WRITING'`. 

**Potential Issue:** If users are in PRE_FORGE mode, they only see "Meeting details will be available when Forge begins" - but they need to test/verify access beforehand.

---

## Root Cause Summary

```text
User (Writing cohort) → edition_id: cf2b9fd2-a3da-4d0b-8370-da0937f9d786
                              ↓
                    Query: WHERE edition_id = ?
                              ↓
                         0 roadmap days found
                              ↓
                    Fallback: WHERE edition_id IS NULL
                              ↓
                    Shared template (FILMMAKING content!)
                              ↓
             "Cinematography Masterclass" shown to Writers!
```

---

## Solution: Two-Part Fix

### Part 1: Cohort-Based Fallback (Code Fix)

Instead of falling back to the shared template (Filmmaking), we should:
1. First try to get edition-specific days (current behavior)
2. If none exist, **find another edition of the same cohort type** that has roadmap days
3. Only fall back to shared template as last resort

This ensures Writers see Writing content and Creators see Creators content.

**File:** `src/hooks/useRoadmapData.ts`

```typescript
// Fetch roadmap days - prioritize edition-specific, then cohort-specific, then shared template
const { data: templateDays, isLoading: isLoadingDays } = useQuery({
  queryKey: ['roadmap-days', profile?.edition_id, userCohortType],
  queryFn: async () => {
    // Step 1: Try user's exact edition
    if (profile?.edition_id) {
      const { data: editionDays } = await supabase
        .from('roadmap_days')
        .select('*')
        .eq('edition_id', profile.edition_id)
        .order('day_number', { ascending: true });
      
      if (editionDays && editionDays.length > 0) {
        return editionDays as RoadmapDay[];
      }
    }
    
    // Step 2: Find another edition of SAME cohort type with roadmap days
    if (userCohortType) {
      // Get editions of same cohort type
      const { data: sameTypeEditions } = await supabase
        .from('editions')
        .select('id')
        .eq('cohort_type', userCohortType);
      
      if (sameTypeEditions && sameTypeEditions.length > 0) {
        const editionIds = sameTypeEditions.map(e => e.id);
        
        const { data: cohortDays } = await supabase
          .from('roadmap_days')
          .select('*')
          .in('edition_id', editionIds)
          .order('day_number', { ascending: true });
        
        if (cohortDays && cohortDays.length > 0) {
          return cohortDays as RoadmapDay[];
        }
      }
    }
    
    // Step 3: Last resort - shared template
    const { data } = await supabase
      .from('roadmap_days')
      .select('*')
      .is('edition_id', null)
      .order('day_number', { ascending: true });
    
    return (data || []) as RoadmapDay[];
  },
  enabled: !!profile?.edition_id
});
```

---

### Part 2: Hide Virtual Sessions for Writers (Already Implemented - Verify)

The code already has these checks in place:
- `JourneyCard.tsx` line 161: `day.is_virtual && cohortType !== 'FORGE_WRITING'`
- `JourneyCard.tsx` line 230: Virtual join button hidden for FORGE_WRITING
- `DayDetailModal.tsx` line 138: Online session badge hidden for FORGE_WRITING
- `DayDetailModal.tsx` line 162: SessionMeetingCard hidden for FORGE_WRITING

**These will work correctly once Writers get Writing-specific data** (which has `is_virtual: false`).

---

### Part 3: Improve Zoom Link Accessibility (Enhancement)

Add ability to preview meeting credentials even in PRE_FORGE mode (optional enhancement):

**Option A:** Show credentials (obscured) in PRE_FORGE with "Available X days before session"
**Option B:** Allow access to meeting card 24-48 hours before session start

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useRoadmapData.ts` | Update query to use cohort-based fallback instead of shared template |

---

## Expected Behavior After Fix

| User Cohort | Content Shown | Virtual Sessions |
|-------------|---------------|------------------|
| **FORGE** (Filmmaking) | "Cinematography Masterclass" | ✓ Days 1-3 Online |
| **FORGE_WRITING** | "Psychology of Storytelling", "Advanced Writing" | ✗ No virtual UI |
| **FORGE_CREATORS** | "Mindset Reset", "Shoot Day 1" | ✓ Virtual where applicable |

---

## Data Flow After Fix

```text
User Login (Writing cohort)
    ↓
profile.edition_id = cf2b9fd2... (Edition 5)
    ↓
Query 1: roadmap_days WHERE edition_id = cf2b9fd2
         Result: 0 rows
    ↓
Query 2: editions WHERE cohort_type = 'FORGE_WRITING'
         → Found: [cf2b9fd2, 9a4b17e1, 7f94f1b7]
    ↓
Query 3: roadmap_days WHERE edition_id IN [...]
         Result: 7 rows from 7f94f1b7 (Jan 2025 Writing)
    ↓
Writers now see: "Psychology of Storytelling" ✓
```

---

## Mobile & Desktop Compatibility

All changes are data-layer only. The existing responsive UI components (JourneyCard, DayDetailModal, SessionMeetingCard) already handle:
- Touch-friendly tap targets
- Drawer/Dialog responsive switching
- Proper spacing and typography for mobile
- Calendar sync works on both platforms

---

## Why This is Better Than Database-Only Fix

While we could simply copy roadmap days to Edition 5, the code fix ensures:
1. Future editions automatically inherit content from past editions of same cohort
2. Admins don't need to duplicate data for every new edition
3. Self-healing when new cohorts are created


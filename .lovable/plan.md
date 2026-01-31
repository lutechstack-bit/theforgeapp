

# Comprehensive Fix: Cohort-Specific Content + Online Sessions for Filmmaking & Creators

## Summary of Issues Found

Based on my analysis of the codebase, database, and the 4 PDFs you provided, here are the confirmed issues:

### Issue 1: Race Condition Causes Wrong Cohort Content (ROOT CAUSE)
**Location:** `src/hooks/useRoadmapData.ts` (Line 21)

```typescript
const userCohortType = (edition?.cohort_type as CohortType) || 'FORGE';
```

When a user loads the Roadmap page:
1. `profile.edition_id` loads first → query is enabled
2. But `edition?.cohort_type` is still `undefined` → defaults to `'FORGE'`
3. Roadmap query runs with `userCohortType = 'FORGE'` 
4. **Writing/Creators users see Filmmaking content!**

Even though the 3-tier fallback logic was added, this race condition means the wrong cohort type is used from the start.

---

### Issue 2: Online Sessions Exist But Aren't in Database (Data Gap)

**From Creators Bali PDF - 6 Online Sessions:**
| Session | Date | Time | Title |
|---------|------|------|-------|
| 1 | Jan 22 | 7-8:30 PM | Orientation |
| 2 | Jan 23 | 6:30-8:30 PM | Niche Discovery + Competitor Analysis |
| 3 | Jan 24 | 6:30-8 PM | Storytelling for Social Media |
| 4 | Jan 25 | 11 AM-1 PM | Videography Theory |
| 5 | Jan 27 | 6:30-8:30 PM | Assignment Review & Feedback |
| 6 | Jan 28 | 6:30-8:30 PM | Video Editing Theory |

**Current Database State:**
- Creators editions have `is_virtual = false` for all days
- No `meeting_url` data for any Creators roadmap days
- Only the shared template (Filmmaking) has virtual session data

---

### Issue 3: Zoom Credentials Only Visible in DURING_FORGE Mode

Current logic in `DayDetailModal.tsx` (Line 162):
```typescript
{day.is_virtual && day.meeting_url && forgeMode === 'DURING_FORGE' && cohortType !== 'FORGE_WRITING' && (
  <SessionMeetingCard ... />
)}
```

This means:
- Users can't preview meeting credentials before Forge starts
- They only see "Meeting details will be available when Forge begins"

**Better UX:** Show credentials 24-48 hours before session starts.

---

## Online Sessions Structure (From PDFs)

### FORGE (Filmmaking) - Online Sessions
- **3 Online Days** before physical sessions
- Days 1-3 are virtual, Days 4+ are in-person
- Has Zoom meeting infrastructure

### FORGE_CREATORS - Online Sessions (From Bali PDF)
- **6 Online Sessions** before physical sessions
- Sessions numbered separately from physical days
- Then Day 1-7 are in-person

### FORGE_WRITING - NO Online Sessions
- Direct to physical (Day 1-6)
- No virtual component at all

---

## Solution Architecture

### Fix 1: Wait for Cohort Type Before Fetching

**File:** `src/hooks/useRoadmapData.ts`

```typescript
// OLD (causes race condition)
const userCohortType = (edition?.cohort_type as CohortType) || 'FORGE';

// NEW (wait for cohort to be known)
const userCohortType = edition?.cohort_type as CohortType | undefined;

// Query enabled only when BOTH profile and edition are loaded
enabled: !!profile?.edition_id && !!userCohortType
```

This prevents the query from running with an incorrect default.

---

### Fix 2: Add Online Sessions as Day Numbers -5 to 0

For cohorts with online sessions (Filmmaking, Creators), use negative day numbers:

| Day Number | Type | Filmmaking | Creators |
|------------|------|------------|----------|
| -5 | Online | - | Session 1: Orientation |
| -4 | Online | - | Session 2: Niche Discovery |
| -3 | Online | Session 1: Orientation | Session 3: Storytelling |
| -2 | Online | Session 2: Cinematography | Session 4: Videography |
| -1 | Online | Session 3: Direction | Session 5: Assignment Review |
| 0 | Pre-Forge | Prep Day | Session 6 + Prep |
| 1+ | Physical | In-Person Days | In-Person Days |

This keeps the timeline sequential and the existing UI works.

---

### Fix 3: Early Access to Meeting Credentials

**File:** `src/components/roadmap/DayDetailModal.tsx`

Change visibility logic from:
```typescript
forgeMode === 'DURING_FORGE'
```

To:
```typescript
// Show meeting card if:
// 1. During Forge, OR
// 2. Session is within 48 hours

const sessionDate = day.date ? new Date(day.date) : null;
const hoursUntilSession = sessionDate 
  ? (sessionDate.getTime() - Date.now()) / (1000 * 60 * 60) 
  : Infinity;
const showMeetingCard = forgeMode === 'DURING_FORGE' || hoursUntilSession <= 48;
```

---

### Fix 4: Mobile-Friendly Improvements

The current `SessionMeetingCard` already has good mobile support, but we'll enhance:

1. **Touch-friendly buttons** - Ensure 44px minimum touch targets
2. **Copy feedback** - Haptic feedback on mobile (if supported)
3. **Calendar sync** - Works on both platforms already
4. **Compact mode** - Use in JourneyCard for quick access

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useRoadmapData.ts` | Fix race condition by requiring cohortType before fetching |
| `src/components/roadmap/JourneyCard.tsx` | Pass virtual meeting fields to modal, add compact meeting card |
| `src/components/roadmap/DayDetailModal.tsx` | Show meeting card 48h before session; improve mobile UX |
| `src/components/roadmap/SessionMeetingCard.tsx` | Minor mobile UX tweaks (touch targets, feedback) |

---

## Database Updates Required (via Admin Panel)

After the code fix, you'll need to add the online session data for:

### Creators Edition (Bali)
Add roadmap_days entries with:
- `day_number`: -5, -4, -3, -2, -1, 0
- `is_virtual`: true
- `meeting_url`: Zoom link
- `meeting_id`: Zoom meeting ID
- `meeting_passcode`: Zoom passcode
- `session_start_time`: Time from PDF
- Titles from PDF (Orientation, Niche Discovery, etc.)

### Filmmaking Edition (if needed)
Add/update roadmap_days with:
- `day_number`: -2, -1, 0 (for online sessions)
- Virtual meeting fields populated

---

## Expected Behavior After Fix

| Cohort | Online Sessions | Physical Days | Zoom UI |
|--------|-----------------|---------------|---------|
| **Filmmaking** | Days -2 to 0 (3 sessions) | Days 1-6 | ✓ Visible |
| **Creators** | Days -5 to 0 (6 sessions) | Days 1-7 | ✓ Visible |
| **Writing** | None | Days 1-6 | ✗ Hidden |

---

## User Experience Flow

```text
User logs in (Creators cohort)
    ↓
AuthContext loads profile → then edition
    ↓
useRoadmapData waits for edition.cohort_type
    ↓
Query runs with correct cohort: FORGE_CREATORS
    ↓
Journey shows:
├── Session 1: Orientation (Online) - Jan 22
├── Session 2: Niche Discovery (Online) - Jan 23
├── ... (6 online sessions total)
├── Day 1: Orientation & Mindset Reset (In-Person) - Jan 31
├── Day 2: Art of the Hook (In-Person) - Feb 1
└── ... (7 physical days)
    ↓
Tapping online session shows:
├── SessionMeetingCard with Join Now button
├── Meeting ID + Passcode (copy buttons)
├── Add to Calendar (Google/Apple)
└── All mobile-optimized with 44px+ touch targets
```

---

## Implementation Order

1. **Phase 1** (Code - Critical)
   - Fix race condition in `useRoadmapData.ts`
   - Update query `enabled` condition

2. **Phase 2** (Code - UX)
   - Update `DayDetailModal.tsx` for 48h early access
   - Ensure virtual fields are passed through `JourneyCard.tsx`

3. **Phase 3** (Data - Admin Panel)
   - Add online session entries for Creators
   - Add online session entries for Filmmaking
   - Populate meeting URLs, IDs, passcodes

4. **Phase 4** (Testing)
   - Test as Writing user → No virtual UI
   - Test as Filmmaking user → Virtual sessions visible
   - Test as Creators user → 6 online sessions visible
   - Test mobile view for all cohorts

---

## Data Entry Template (for Admin Panel)

For each online session, you'll add a roadmap_day with:

```json
{
  "edition_id": "<creators-edition-id>",
  "day_number": -5,  // Negative for online sessions
  "title": "Orientation",
  "is_virtual": true,
  "is_active": true,
  "meeting_url": "https://zoom.us/j/...",
  "meeting_id": "123 456 7890",
  "meeting_passcode": "FORGE",
  "session_start_time": "19:00",
  "session_duration_hours": 1.5,
  "call_time": "7:00 PM IST",
  "what_youll_learn": ["Course overview", "Team introductions", "Platform walkthrough"],
  "schedule": [
    {"time": "7:00 PM", "activity": "Welcome & Intros"},
    {"time": "7:30 PM", "activity": "Platform Walkthrough"},
    {"time": "8:00 PM", "activity": "Q&A"}
  ]
}
```


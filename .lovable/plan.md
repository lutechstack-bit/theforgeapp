

# Fix: Hide Virtual Sessions for FORGE_WRITING Cohort

## The Issue

The Online Forge Zoom integration feature is fully implemented, but it currently doesn't account for cohort-specific behavior:

| Cohort | Online Sessions (Days 1-3) | Physical Sessions |
|--------|---------------------------|-------------------|
| **FORGE** (Filmmaking) | ✅ Yes - Days 1-3 virtual | Days 4+ physical |
| **FORGE_CREATORS** | ✅ Yes - Days 1-3 virtual | Days 4+ physical |
| **FORGE_WRITING** | ❌ No - Skip online stage | All days physical |

**Current Behavior**: If virtual sessions are configured for Days 1-3, ALL cohorts (including Writers) would see "Join Now" buttons and online session indicators.

**Expected Behavior**: FORGE_WRITING students should never see virtual session UI elements (no "Online" badge, no "Join Now" button, no meeting details).

---

## Solution: UI-Level Cohort Filtering

Since the roadmap uses a shared template (no `cohort_type` field on `roadmap_days`), we'll add cohort-based filtering at the UI component level.

### Logic
```tsx
// Virtual sessions only apply to FORGE and FORGE_CREATORS
const showVirtualFeatures = day.is_virtual && cohortType !== 'FORGE_WRITING';
```

---

## Files to Update

### 1. `src/components/roadmap/JourneyCard.tsx`
**Current (Line 161):**
```tsx
{day.is_virtual ? (
  <span className="...">Online</span>
) : ...}
```

**Updated:**
```tsx
{day.is_virtual && cohortType !== 'FORGE_WRITING' ? (
  <span className="...">Online</span>
) : ...}
```

**Current (Line 230):**
```tsx
{day.is_virtual && day.meeting_url && status === 'current' && forgeMode === 'DURING_FORGE' && (
  <Button>Join Now</Button>
)}
```

**Updated:**
```tsx
{day.is_virtual && day.meeting_url && status === 'current' && forgeMode === 'DURING_FORGE' && cohortType !== 'FORGE_WRITING' && (
  <Button>Join Now</Button>
)}
```

### 2. `src/components/roadmap/DayDetailModal.tsx`
Add cohort check before rendering `SessionMeetingCard`:

```tsx
{day.is_virtual && day.meeting_url && cohortType !== 'FORGE_WRITING' && (
  <SessionMeetingCard ... />
)}
```

### 3. `src/hooks/useSessionNotifications.ts`
Add cohort check so Writers don't receive "session starting soon" notifications:

```tsx
// Only track virtual sessions for FORGE and FORGE_CREATORS
if (cohortType === 'FORGE_WRITING') {
  return { sessionStatus: 'none', currentSession: null };
}
```

### 4. `src/components/home/MasterNotificationCenter.tsx`
Ensure session alerts are hidden for Writing cohort.

---

## Summary of Changes

| Component | Change |
|-----------|--------|
| `JourneyCard.tsx` | Hide "Online" badge and "Join Now" button for FORGE_WRITING |
| `DayDetailModal.tsx` | Hide meeting details card for FORGE_WRITING |
| `useSessionNotifications.ts` | Skip session tracking for FORGE_WRITING |
| `MasterNotificationCenter.tsx` | Hide session alerts for FORGE_WRITING |

---

## Result

After this fix:

| Feature | FORGE | FORGE_CREATORS | FORGE_WRITING |
|---------|-------|----------------|---------------|
| "Online" badge on Days 1-3 | ✅ | ✅ | ❌ Hidden |
| "Join Now" button | ✅ | ✅ | ❌ Hidden |
| Meeting details in modal | ✅ | ✅ | ❌ Hidden |
| Session notifications | ✅ | ✅ | ❌ Disabled |
| Calendar sync for sessions | ✅ | ✅ | ❌ Hidden |

Writers will see the same roadmap days but treated as physical/in-person sessions only.


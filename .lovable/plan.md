

# Fix: Add Virtual Session Data for Testing

## The Problem

The Zoom link feature is hidden because the database has no virtual session data:

| Day | is_virtual | meeting_url | meeting_id | meeting_passcode |
|-----|------------|-------------|------------|------------------|
| 1 | ❌ false | null | null | null |
| 2 | ❌ false | null | null | null |
| 3 | ❌ false | null | null | null |

The feature requires these conditions to be met:
1. `is_virtual = true`
2. `meeting_url` must exist
3. `forgeMode = 'DURING_FORGE'` (Admin Testing Panel can simulate this)
4. `status = 'current'` (simulated day matches the day number)

---

## Solution: Database Migration

Add placeholder virtual session data to Days 1-3 so you can test the feature:

```sql
UPDATE roadmap_days 
SET 
  is_virtual = true,
  meeting_url = 'https://zoom.us/j/1234567890',
  meeting_id = '123 456 7890',
  meeting_passcode = 'forge2026',
  session_start_time = '10:00',
  session_duration_hours = 3
WHERE edition_id IS NULL 
AND day_number IN (1, 2, 3);
```

---

## After Migration: How to Test

1. **Go to Roadmap page** (`/roadmap`)
2. **Open Admin Testing Panel** (floating gear icon bottom-right)
3. **Set mode** to `DURING_FORGE`
4. **Set simulated day** to `1`, `2`, or `3`
5. **You should see:**
   - "Online" badge on Day 1-3 cards
   - "Join Now" button on the current day's card
   - Meeting details when you click to open Day Detail Modal

---

## Visual Preview

### Journey Card (Day 1 - Current)
```
┌────────────────────────────────────────┐
│ Tue  │ Day 1  🌐 Online      ● NOW     │
│  04  │                                  │
│ Feb  │ Orientation & Visual Storytelling│
│      │                                  │
│      │ [🎥 Join Now]                    │
└────────────────────────────────────────┘
```

### Day Detail Modal
```
┌────────────────────────────────────────┐
│ Day 1: Orientation                      │
│ 🌐 Online Session                       │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ 🎥 Join Virtual Session             │ │
│ │                                     │ │
│ │ Meeting ID: 123 456 7890            │ │
│ │ Passcode: forge2026                 │ │
│ │                                     │ │
│ │ [📋 Copy]  [📅 Add to Calendar]     │ │
│ │                                     │ │
│ │    [🎥 Join Meeting]                │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| Database Migration | CREATE | Add virtual session data to Days 1-3 |

No code changes needed — the UI is already built. We just need the data!

---

## Note

You can update the placeholder Zoom URL (`https://zoom.us/j/1234567890`) to your real meeting link later via **Admin Panel → Roadmap → Edit Day 1/2/3**.


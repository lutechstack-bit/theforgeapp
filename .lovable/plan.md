
# Online Forge Sessions: Zoom Links, Notifications & Calendar Integration

## Overview
This plan implements a complete system for managing and displaying Zoom meeting links during online Forge sessions (Days 1-3), with automatic notifications in the Home notification center and seamless calendar integration.

---

## Current State Analysis

Based on my exploration:

1. **Roadmap Days Table**: Has columns for session details but **no Zoom link field** currently
2. **JourneyCard & DayDetailModal**: Display session info but don't show meeting links
3. **MasterNotificationCenter**: Shows general updates and events but not session-specific notifications
4. **Calendar Utils**: Already has helper functions (`generateGoogleCalendarUrl`, `downloadICSFile`) that we can reuse
5. **Admin Roadmap**: Manages day content but lacks fields for virtual meeting details

---

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        ADMIN: Roadmap Day Editor                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Day 1: Online Orientation                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │ 📹 Virtual Meeting                                           │  │ │
│  │  │ Meeting URL: [https://zoom.us/j/...]                        │  │ │
│  │  │ Meeting ID:  [123 456 7890]                                 │  │ │
│  │  │ Passcode:    [****]                                         │  │ │
│  │  │ Start Time:  [10:00 AM]   Duration: [3] hours              │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STUDENT: Journey Card (Online Day)                    │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Day 1  │ Online Orientation                        [🟢 NOW]      │ │
│  │         │ 📍 Virtual (Zoom)  ⏰ 10:00 AM                           │ │
│  │         │                                                         │ │
│  │         │  ┌─────────────────────────────────────────────────┐   │ │
│  │         │  │ 🎥 Join Zoom Meeting                             │   │ │
│  │         │  │ 📅 Add to Calendar  📋 Copy Link                │   │ │
│  │         │  └─────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               HOME: Master Notification Center                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  🎬 Session Starting Soon                                          │ │
│  │  "Online Orientation" starts in 30 minutes                        │ │
│  │  [Join Zoom] [Add to Calendar]                            →       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Changes

### Add Virtual Meeting Columns to `roadmap_days`

```sql
ALTER TABLE public.roadmap_days
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meeting_url TEXT,
ADD COLUMN IF NOT EXISTS meeting_id TEXT,
ADD COLUMN IF NOT EXISTS meeting_passcode TEXT,
ADD COLUMN IF NOT EXISTS session_start_time TIME,
ADD COLUMN IF NOT EXISTS session_duration_hours NUMERIC(3,1);
```

| Column | Type | Purpose |
|--------|------|---------|
| `is_virtual` | boolean | Flag to indicate online session |
| `meeting_url` | text | Full Zoom/Meet link (clickable) |
| `meeting_id` | text | Meeting ID for manual entry |
| `meeting_passcode` | text | Passcode (displayed during session) |
| `session_start_time` | time | Exact session start time (for calendar) |
| `session_duration_hours` | numeric | Duration in hours (for calendar end time) |

---

## Implementation Steps

### Part 1: Database Migration

Add the new virtual meeting columns to the `roadmap_days` table.

### Part 2: Update Admin Roadmap Editor

**File: `src/pages/admin/AdminRoadmap.tsx`**

Add virtual meeting section to the day editor form:
- Toggle: "Is Virtual Session"
- Conditional fields when virtual:
  - Meeting URL input
  - Meeting ID input  
  - Passcode input (with show/hide toggle)
  - Session start time picker
  - Duration hours input

### Part 3: Create Session Meeting Card Component

**New File: `src/components/roadmap/SessionMeetingCard.tsx`**

A reusable card that shows:
- Platform badge (Zoom, Google Meet, etc.)
- "Join Meeting" primary CTA button
- Meeting ID + copy button
- Passcode + copy button (with reveal toggle)
- "Add to Calendar" dropdown (Google Calendar, Apple/ICS)
- Only visible when `is_virtual` is true and during DURING_FORGE mode

### Part 4: Update JourneyCard

**File: `src/components/roadmap/JourneyCard.tsx`**

Changes:
- Show virtual indicator badge ("🌐 Online" vs "📍 Physical")
- When current day + virtual: show "Join Now" prominent button

### Part 5: Update DayDetailModal

**File: `src/components/roadmap/DayDetailModal.tsx`**

Add new section for virtual sessions:
- Full meeting details in a prominent card
- Join button (opens Zoom link in new tab)
- Copy link to clipboard
- Meeting ID & Passcode (with copy actions)
- Add to Calendar buttons (Google + Apple)
- Show only when `day.is_virtual` is true

### Part 6: Create Session Notification System

**New File: `src/hooks/useSessionNotifications.ts`**

Hook that:
- Checks if user is in DURING_FORGE mode
- Finds current or next session from roadmap data
- Calculates time until session (30min, 15min, 5min, now)
- Returns formatted notification data

**Update: `src/components/home/MasterNotificationCenter.tsx`**

Add new "Live Sessions" section:
- Fetches current/upcoming virtual sessions
- Shows notification card for sessions starting within 1 hour
- "Join Zoom" button directly in notification
- "Add to Calendar" button

### Part 7: Add Announcement Trigger for Sessions

**Database Insert: `announcement_triggers`**

Add new trigger type for session reminders:

```sql
INSERT INTO announcement_triggers (trigger_type, title_template, message_template, deep_link, icon_emoji, priority, config, is_active)
VALUES 
  ('session_starting_soon', 'Session starting in {minutes} minutes', 'Join "{session_title}" now!', '/roadmap/journey', '🎬', 85, '{"minutes_before": [30, 15, 5]}', true),
  ('session_live_now', 'Your session is LIVE!', 'Join "{session_title}" now', '/roadmap/journey', '🔴', 95, '{}', true);
```

### Part 8: Update Smart Announcements Hook

**File: `src/hooks/useSmartAnnouncements.ts`**

Add session-based triggers:
- `session_starting_soon`: Triggers 30/15/5 min before
- `session_live_now`: Triggers when session is in progress
- Include direct join link in announcement

### Part 9: Calendar Integration for Sessions

**File: `src/lib/calendarUtils.ts`**

Add new utility specifically for Forge sessions:

```typescript
export const generateForgeSessionCalendarEvent = (day: RoadmapDay): CalendarEvent => {
  // Calculate exact start datetime from day.date + session_start_time
  // Calculate end datetime from start + session_duration_hours
  // Include Zoom link in description
  // Return formatted event
};
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Migration SQL | Create | Add virtual meeting columns to roadmap_days |
| `src/pages/admin/AdminRoadmap.tsx` | Modify | Add virtual meeting fields to editor |
| `src/components/roadmap/SessionMeetingCard.tsx` | Create | Reusable meeting info/join component |
| `src/components/roadmap/JourneyCard.tsx` | Modify | Add virtual badge and join button |
| `src/components/roadmap/DayDetailModal.tsx` | Modify | Add meeting section with actions |
| `src/hooks/useSessionNotifications.ts` | Create | Hook for session notification logic |
| `src/hooks/useSmartAnnouncements.ts` | Modify | Add session triggers |
| `src/components/home/MasterNotificationCenter.tsx` | Modify | Add live sessions section |
| `src/lib/calendarUtils.ts` | Modify | Add session calendar helper |
| `src/hooks/useRoadmapData.ts` | Modify | Include new virtual fields |

---

## Component Details

### SessionMeetingCard Component

```text
┌─────────────────────────────────────────────────────────────┐
│  🎥 Zoom Meeting                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           [ 🚀 Join Zoom Meeting ]                      │ │
│  │                                                         │ │
│  │   Opens: zoom.us/j/123456789                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Meeting ID: 123 456 7890                          [📋]     │
│  Passcode:   ******* [👁️]                         [📋]     │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐                        │
│  │ 📅 Google    │  │ 🍎 Apple      │                        │
│  │  Calendar    │  │  Calendar     │                        │
│  └──────────────┘  └───────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Home Notification Card

```text
┌─────────────────────────────────────────────────────────────┐
│  🔴 Live Session                               Starting Now │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Day 1: Online Orientation                                  │
│  Your session is live! Click to join.                       │
│                                                              │
│  ┌────────────────┐  ┌───────────────┐                      │
│  │ 🚀 Join Zoom   │  │ 📅 Calendar   │          →          │
│  └────────────────┘  └───────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## User Experience Flow

### During Online Session Days (1-3)

1. **Home Page**:
   - Notification card shows "Session starting in X minutes" or "Session is LIVE"
   - One-click "Join Zoom" button
   - "Add to Calendar" option

2. **Roadmap Journey**:
   - JourneyCard shows 🌐 Online badge
   - Current session has prominent "Join Now" button
   - Click card → opens DayDetailModal with full meeting details

3. **DayDetailModal**:
   - Full meeting section with all details
   - Large "Join Zoom" primary button
   - Copy buttons for meeting ID and passcode
   - Calendar sync buttons

### Admin Experience

1. **Roadmap Editor**:
   - Toggle "Is Virtual Session" 
   - Enter Zoom link, Meeting ID, Passcode
   - Set session start time and duration
   - Save → Students see meeting info during DURING_FORGE

---

## Security Considerations

1. **Meeting links only visible during DURING_FORGE mode**
   - PRE_FORGE: Meeting info hidden/redacted
   - DURING_FORGE: Full details visible
   - POST_FORGE: Links become inactive/archived

2. **Passcode hidden by default**
   - Reveal button to show passcode
   - Copy button works without revealing

3. **Admin Testing Mode Integration**
   - Virtual meeting details visible when simulating DURING_FORGE

---

## Expected Results

After implementation:

1. **Admins** can add Zoom meeting details to any roadmap day
2. **Students** see prominent "Join Zoom" buttons for virtual sessions
3. **Notifications** alert students 30/15/5 minutes before sessions
4. **Calendar** integration allows one-click adds to Google/Apple calendars
5. **Testing** works via Admin Testing Mode without waiting for real dates

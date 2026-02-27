

# Fix "Add to Calendar" Button Functionality

## Problem
The "Add to Calendar" button on the homepage `SessionDetailCard` doesn't add anything to a calendar - it just opens the detail modal via `onViewDetail`. The button in `SessionDetailModal` does work (calls `handleAddToCalendar` which opens Google Calendar), but the homepage one is broken.

## Changes

### 1. `src/components/home/SessionDetailCard.tsx`
- Replace the dummy `onViewDetail` click handler on the "Add to Calendar" button with actual calendar functionality
- Import `generateGoogleCalendarUrl` and `downloadICSFile` from `@/lib/calendarUtils`
- Add a Popover dropdown with two options: **Google Calendar** (opens URL) and **Download .ics** (for Apple/Outlook)
- Build the calendar event from the `day` prop data (title, description, date, session_start_time, duration, is_virtual)

### 2. No other files need changes
The `SessionDetailModal` already has a working implementation. The `calendarUtils.ts` library already has all needed helpers.

## Technical Details

**SessionDetailCard calendar button flow:**
- Click "Add to Calendar" → opens a small Popover with two options
- "Google Calendar" → calls `generateGoogleCalendarUrl()` with day data, opens in new tab
- "Apple / Other (.ics)" → calls `downloadICSFile()` with day data, downloads file
- If `day.date` is null, show a toast saying date not yet announced


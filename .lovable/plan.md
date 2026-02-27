

# Replace Downloads with Direct Calendar Redirect Links

## Problem
The "Apple / Other (.ics)" option downloads a file instead of redirecting. User wants all calendar options to work like Google Calendar — a redirect link that opens the calendar app directly.

## Solution
1. **Add direct URL generators** for Outlook Web and Yahoo Calendar (same pattern as Google Calendar — construct a URL, open in new tab)
2. **Create an edge function** that serves ICS content at a public URL, then use `webcal://` protocol to trigger Apple Calendar's native subscribe/add flow (no download)
3. **Update all calendar dropdowns** across the app to show: Google Calendar, Apple Calendar, Outlook, Yahoo — all as redirect links

## Changes

### 1. `supabase/functions/calendar-event/index.ts` (NEW)
- Edge function that accepts event params (title, description, start, end, location) as query params
- Returns ICS content with `Content-Type: text/calendar`
- This gives us a public URL we can use with `webcal://` for Apple Calendar

### 2. `src/lib/calendarUtils.ts`
- Add `generateOutlookCalendarUrl(event)` — builds `https://outlook.live.com/calendar/0/action/compose?...` URL
- Add `generateYahooCalendarUrl(event)` — builds `https://calendar.yahoo.com/?v=60&...` URL  
- Add `generateAppleCalendarUrl(event)` — builds a `webcal://` URL pointing to the edge function
- Keep existing functions for backward compatibility

### 3. `src/components/home/SessionDetailCard.tsx`
- Replace the two-option popover (Google + Apple/Other .ics) with four redirect options: Google, Apple, Outlook, Yahoo
- All use `window.open(url, '_blank')` — no downloads
- Remove Download icon, use Calendar/ExternalLink icons instead

### 4. `src/components/roadmap/SessionMeetingCard.tsx`
- Same update: replace Google + Apple dropdown with four redirect options

### 5. `src/components/home/MasterNotificationCenter.tsx`
- Same update: replace Google + Apple dropdown with four redirect options

### 6. `src/components/learn/SessionDetailModal.tsx`
- Add a dropdown/popover with all four calendar options instead of the single Google Calendar button

### 7. `src/components/events/CalendarSyncModal.tsx`
- Update Apple Calendar button to use `webcal://` redirect
- Update "Other Calendars" to show Outlook + Yahoo as separate redirect options

## Technical Details

**URL patterns (all are redirect links, no downloads):**

```text
Google:  https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...
Outlook: https://outlook.live.com/calendar/0/action/compose?subject=...&startdt=...&enddt=...
Yahoo:   https://calendar.yahoo.com/?v=60&title=...&st=...&et=...&desc=...
Apple:   webcal://<edge-function-url>/calendar-event?title=...&start=...&end=...
```

The edge function URL uses `webcal://` protocol instead of `https://`, which tells the OS to hand the URL to the default calendar app (Apple Calendar on iOS/macOS).


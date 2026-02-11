
# Make Calendar Button Work Directly on Session Cards

## What Changes

The calendar icon button (CalendarPlus) on each Upcoming Online Sessions card currently opens the same modal as "Join Session". It will be updated to directly add the session to the user's calendar -- opening Google Calendar in a new tab, without opening the modal.

## Changes

### `src/components/learn/UpcomingSessionsSection.tsx`

1. Import `generateGoogleCalendarUrl` from `@/lib/calendarUtils`
2. Add a `handleAddToCalendar` function that:
   - Takes a session object
   - Constructs a start date from `session.date` and `session.session_start_time`
   - Calculates the end date using `session.session_duration_hours`
   - Calls `generateGoogleCalendarUrl()` and opens it in a new tab
3. Update the CalendarPlus button's `onClick` to call `handleAddToCalendar(session)` instead of `setSelectedSession(session)`
4. Add `e.stopPropagation()` to prevent any parent click handlers from firing

No other files need to change -- all calendar utilities already exist in `src/lib/calendarUtils.ts`.

## Files Summary

| File | Action |
|------|--------|
| `src/components/learn/UpcomingSessionsSection.tsx` | UPDATE -- Wire calendar button to directly open Google Calendar |

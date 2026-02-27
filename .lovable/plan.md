

# Replace All `downloadICSFile` with `openICSFile`

## Problem
Three components still use `downloadICSFile` which triggers a file download instead of opening the calendar app directly. Only `SessionDetailCard` was updated previously.

## Changes

### 1. `src/components/learn/SessionDetailModal.tsx`
- Change import from `downloadICSFile` to `openICSFile`
- Replace all calls to `downloadICSFile` with `openICSFile`

### 2. `src/components/home/MasterNotificationCenter.tsx` (line 16, 252)
- Change import from `downloadICSFile` to `openICSFile`
- Replace `downloadICSFile(getCalendarEvent())` with `openICSFile(getCalendarEvent())` in `handleAppleCalendar`

### 3. `src/components/roadmap/SessionMeetingCard.tsx` (line 6, 96)
- Change import from `downloadICSFile` to `openICSFile`
- Replace `downloadICSFile(event)` with `openICSFile(event)` in `handleAppleCalendar`

All three are simple import + call swaps. No logic changes needed.




# Open Apple Calendar Directly Instead of Downloading .ics

## Problem
Currently the "Apple / Other (.ics)" option downloads a file. User wants it to redirect/open directly in the calendar app instead.

## Solution
Replace `downloadICSFile()` calls with opening a blob URL in a new tab (`window.open`). On iOS/macOS, this triggers the native Calendar app to add the event directly. On other platforms, the browser will handle the .ics file appropriately (usually opening it in the default calendar app).

## Changes

### 1. `src/lib/calendarUtils.ts`
- Add a new `openICSFile()` function that generates ICS content, creates a blob URL, and opens it via `window.open()` instead of triggering a download link click.

### 2. `src/components/home/SessionDetailCard.tsx`
- Replace `downloadICSFile(...)` call with the new `openICSFile(...)` function.
- Update toast message from "Calendar file downloaded" to "Opening calendar...".

### 3. Check for other usages of `downloadICSFile` across the codebase and update if appropriate (the existing download functions remain available for batch/feed downloads).


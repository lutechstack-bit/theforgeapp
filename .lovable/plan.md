

# Add Advanced Date/Time & User Filters to Admin Activity

## Overview
Replace the simple date range dropdown with a full date/time picker system and add a user filter, so admins can drill into exact time windows and individual users.

## Changes — `src/pages/admin/AdminActivity.tsx`

### 1. New Filter Controls (replace current date range dropdown)
- **Quick presets row**: Today, Yesterday, Last 7 days, Last 30 days, Custom (toggle buttons)
- **Custom date range**: Two date pickers (From / To) using the existing `Calendar` popover pattern, shown only when "Custom" is selected
- **Hour selector**: Two time dropdowns (From hour / To hour) to narrow within a day or range — e.g. "9:00 AM to 5:00 PM"
- **User filter**: A `Select` dropdown populated from the unique users in `profiles`, allowing filtering to a single user's activity

### 2. Query Logic Update
- When preset selected: compute `sinceDate` / `untilDate` from the preset
- When custom: use the picked from/to dates + hour values to build precise ISO timestamps
- Add `.lte('created_at', untilDate)` to the query alongside the existing `.gte`
- When a user is selected: add `.eq('user_id', selectedUserId)` to the query
- Increase limit from 200 to 500 for custom ranges

### 3. User List Fetch
- Add a separate query to fetch all profiles (`id, full_name, avatar_url`) for the user filter dropdown
- Show avatar + name in the dropdown items

### 4. UI Layout
```text
┌──────────────────────────────────────────────────┐
│ User Activity                                     │
│ Track logins & page visits                        │
├──────────────────────────────────────────────────┤
│ [Today] [Yesterday] [7 days] [30 days] [Custom]  │
│                                                    │
│ (if Custom):                                      │
│ From: [📅 Mar 15] [9:00 AM ▼]                    │
│ To:   [📅 Mar 20] [6:00 PM ▼]                    │
│                                                    │
│ User: [All Users ▼]  Event: [All Events ▼]       │
└──────────────────────────────────────────────────┘
```

### 5. Hour Slots
- Reuse the same time slot generation pattern from `DateTimePicker.tsx` (hourly increments for simplicity: 12AM through 11PM)

## Files to Edit
1. `src/pages/admin/AdminActivity.tsx` — all changes in this single file

## No Database Changes
Existing `user_activity_logs` table and RLS policies are sufficient.


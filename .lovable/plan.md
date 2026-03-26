

# Fix Activity Dashboard Row Limit Bug

## Problem
The query in `AdminActivity.tsx` uses `.limit(200)`, but there are 306 activity rows in the last 7 days. Since results are ordered by most recent first, older events from less active users get completely cut off — showing wrong totals for logins, page views, and active users.

## Fix — `src/pages/admin/AdminActivity.tsx`

**Change the query limit** from `200` to `2000` for all presets, and `5000` for custom ranges. This ensures all activity data is captured for accurate KPI counts and charts.

Line ~82: Change `.limit(preset === 'custom' ? 500 : 200)` to `.limit(2000)`

One-line fix. No other changes needed.




# Make KPI Cards Clickable with User Profile Popups

## What
Make each of the 3 KPI cards (Logins, Page Views, Active Users) clickable. On click, open a small Dialog/popup showing the unique users behind that metric — avatar, name, and their count for that metric.

## Changes — `src/pages/admin/AdminActivity.tsx`

### 1. Add state
- `kpiPopup: 'logins' | 'pageviews' | 'active' | null` — controls which popup is open

### 2. Compute user lists per KPI
From existing `activities` data, derive:
- **Logins**: unique users with login events, show login count per user
- **Page Views**: unique users with page_view events, show view count per user  
- **Active Users**: all unique users in the period, show total activity count

Each list uses the already-fetched `profiles` data (name + avatar) attached to each activity.

### 3. Make KPI cards clickable
Add `cursor-pointer hover:border-primary/50 transition-colors` and `onClick={() => setKpiPopup('logins')}` etc. to each card.

### 4. Add Dialog popup
- Title: "Users with Logins" / "Users with Page Views" / "Active Users"
- Content: scrollable list of user rows — Avatar (small), Name, Count badge
- Uses existing `Dialog`/`DialogContent` components
- Max height with scroll for many users

### No new files or database changes


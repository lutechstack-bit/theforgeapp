

# Add "Never Logged In" KPI Card with User List

## What
Add a 5th interactive KPI card to the dashboard showing how many users have **never logged in** (signed up but zero activity logs). Clicking it opens an inline expandable list of those users with name, email, and signup date.

## Changes — `src/pages/admin/AdminDashboard.tsx`

### 1. New hook: `useNeverLoggedIn`
- Query `profiles` for all user IDs, full_name, email, avatar_url, created_at
- Query `user_activity_logs` for distinct user_ids where event_type = 'login'
- Diff: users in profiles but NOT in login logs = never logged in
- Return the list + count

### 2. Add 5th KPI card
- Label: "Never Logged In"
- Value: count of users who never logged in
- Icon: `AlertTriangle` (amber themed)
- On click: instead of navigating, toggle a collapsible panel below the KPI row showing the list

### 3. Collapsible user list panel
- Appears below KPI row when the card is clicked (toggle state)
- Simple table: Avatar, Name, Email, Signed Up (relative date)
- "Close" button to collapse
- Grid changes from `grid-cols-4` to `grid-cols-5` to fit the new card

### No database changes needed


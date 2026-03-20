

# Enhanced Admin Dashboard with Login & Engagement Tracking

## What Changes

Enhance the existing `AdminDashboard.tsx` at `/admin` to add real user engagement metrics using data from existing tables. No new pages or routes needed.

## New Sections Added to AdminDashboard

### 1. Engagement KPI Cards (new row, inserted after existing stat cards)
Four cards with trend indicators:
- **Total Logins** — count from `user_activity_logs` where `event_type = 'login'` (today vs yesterday for trend)
- **Onboarding Completed** — count from `profiles` where `profile_setup_completed = true`
- **Creative Profiles Created** — count from `collaborator_profiles`
- **Videos Watched** — distinct users in `learn_watch_progress`

### 2. Daily Logins Line Chart (new chart below engagement cards)
- Query `user_activity_logs` grouped by day for last 30 days where `event_type = 'login'`
- Recharts `LineChart` showing daily login count

### 3. Engagement Funnel Bar Chart (alongside logins chart)
- Horizontal bar chart showing drop-off: Logged In → Onboarding Done → Profile Created → Video Watched
- All from real data counts

### 4. Recent User Activity Table (bottom section)
- Query last 50 activity logs joined with `profiles` for name/email
- Columns: User (avatar + name), Email, Login Date, Onboarding (check/x badge), Profile Created (check/x), Video Watched (check/x)
- Pagination (10 rows per page)
- "Last updated" timestamp + Refresh button

## Data Approach
All metrics use **real data** from existing tables — no mock data needed since the tables already exist. Each metric gets its own query hook for clean separation.

## File Changes
- **`src/pages/admin/AdminDashboard.tsx`** — Add new hooks (`useLoginStats`, `useEngagementFunnel`, `useRecentUserActivity`) and new UI sections

## No Database Changes
All required tables already exist: `user_activity_logs`, `profiles`, `collaborator_profiles`, `learn_watch_progress`.


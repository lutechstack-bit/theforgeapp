

# Professional Analytics Dashboard + Admin Cleanup

## Summary

Replace the basic admin dashboard with a professional analytics hub that surfaces real app data (visitors, pageviews, user growth, content stats, page popularity, device/country breakdowns). Also remove 5 orphaned admin pages that exist as files but have no routes and no frontend connections.

## Orphaned Admin Pages to Delete

These files exist but are **not registered in App.tsx routes** and are not linked from anywhere:
1. `src/pages/admin/AdminNotifications.tsx` — No route. The "Push Notification" quick action links to `/admin/notifications?action=create` which 404s.
2. `src/pages/admin/AdminHeroBanners.tsx` — No route. The `hero_banners` table exists but no frontend component renders hero banners.
3. `src/pages/admin/AdminContent.tsx` — No route. Just a placeholder "coming soon" page with content counts.
4. `src/pages/admin/AdminPastPrograms.tsx` — No route. Past programs are managed through the Events admin page already.
5. `src/pages/admin/AdminEventTypes.tsx` — No route. Event types are managed inline on the Events admin page.

## Dashboard Rebuild

### `src/pages/admin/AdminDashboard.tsx` — Complete rewrite

**Top Row: 5 Stat Cards** (matching the reference screenshot layout)
- Visitors (last 7 days) — from Lovable analytics API via edge function
- Pageviews (last 7 days)
- Views Per Visit
- Avg Visit Duration (formatted as Xm Ys)
- Bounce Rate (%)

**Section 2: Visitor Trend Chart**
- Area chart using Recharts showing daily visitors over the last 7/30 days
- Period selector dropdown (7 days / 30 days)
- Uses the existing `ChartContainer` component

**Section 3: Platform Stats (from database)**
- Total Users, Profile Setup Complete, KY Forms Completed, Balance Paid vs Pending
- Active Editions, Learn Content count, Events count, Community Messages

**Section 4: Insights Grid (2 columns)**
- **Top Pages** — bar list showing page visit counts (/, /learn, /roadmap, etc.)
- **Devices** — simple donut or bar showing desktop vs mobile split
- **Countries** — list with flags/counts
- **Traffic Sources** — direct vs referral breakdown

**Section 5: Quick Actions** (cleaned up)
- Create User → `/admin/users?action=create`
- Create Edition → `/admin/editions?action=create`
- Manage Roadmap → `/admin/roadmap`
- Remove the broken "Push Notification" link

### New Edge Function: `supabase/functions/admin-analytics/index.ts`

The Lovable analytics API is only accessible server-side. Create an edge function that:
- Accepts `period` query param (7 or 30 days)
- Calls the Lovable analytics read endpoint (using the project analytics tool pattern)
- Returns JSON with visitors, pageviews, viewsPerVisit, sessionDuration, bounceRate, topPages, devices, countries, sources
- Requires admin auth (validates JWT, checks `user_roles` for admin)

Actually — on review, the Lovable analytics tool is only available to the AI agent, not callable from edge functions. The analytics data cannot be fetched at runtime from user code.

**Revised approach**: The dashboard will use **database-sourced stats only** (which are real and queryable). The Lovable analytics data (visitors, pageviews, bounce rate) is only accessible through the Lovable platform UI, not via any API the app can call.

### Revised Dashboard Design

**Top Row: 5 Database Stat Cards**
- Total Users (profiles count)
- Profiles Completed (profile_setup_completed = true)
- KY Forms Submitted (kyf_responses count)
- Balance Paid (payment_status = 'BALANCE_PAID')
- Active Editions (non-archived editions)

**Section 2: User Growth Chart**
- Area chart showing user signups over time (profiles.created_at grouped by day/week)
- Last 30 days of registrations

**Section 3: Platform Health Grid (2x3)**
- Learn Content items count
- Events count
- Community Messages count
- Mentors count
- Roadmap Days configured
- Notifications sent

**Section 4: Breakdown Cards (2 columns)**
- **Payment Status** — pie/donut chart showing CONFIRMED_15K vs BALANCE_PAID
- **Forge Mode** — pie/donut chart showing PRE_FORGE vs DURING_FORGE vs POST_FORGE
- **Cohort Distribution** — bar chart by edition
- **Profile Completion** — completion rate visual

**Section 5: Quick Actions** (cleaned up, remove broken notification link)

### Admin Sidebar Cleanup

Remove the "Push Notification" quick action from dashboard since there's no route for it.

## Changes

### 1. `src/pages/admin/AdminDashboard.tsx` — Full rewrite
Professional dashboard with stat cards, Recharts area chart for user growth, platform health grid, breakdown charts, and cleaned quick actions.

### 2. Delete orphaned files (no code changes needed, just remove):
- `src/pages/admin/AdminNotifications.tsx`
- `src/pages/admin/AdminHeroBanners.tsx`
- `src/pages/admin/AdminContent.tsx`
- `src/pages/admin/AdminPastPrograms.tsx`
- `src/pages/admin/AdminEventTypes.tsx`

These have no routes in App.tsx, so deleting them has zero impact.

### 3. `src/pages/admin/AdminDashboard.tsx` — Quick Actions fix
Remove "Push Notification" button that links to non-existent `/admin/notifications` route.

## Technical Details

**Database queries for the dashboard** (all admin-only via RLS):
```sql
-- User stats
SELECT count(*) as total,
       count(*) FILTER (WHERE profile_setup_completed) as completed,
       count(*) FILTER (WHERE payment_status = 'BALANCE_PAID') as paid
FROM profiles;

-- User growth (last 30 days)
SELECT date_trunc('day', created_at)::date as day, count(*) 
FROM profiles 
WHERE created_at > now() - interval '30 days'
GROUP BY 1 ORDER BY 1;

-- Content counts
SELECT 
  (SELECT count(*) FROM learn_content) as learn,
  (SELECT count(*) FROM events) as events,
  (SELECT count(*) FROM community_messages) as messages,
  (SELECT count(*) FROM mentors WHERE is_active) as mentors;
```

**Chart library**: Uses existing `recharts` dependency + `ChartContainer` from `src/components/ui/chart.tsx`.


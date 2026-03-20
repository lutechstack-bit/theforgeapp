

# User Activity Tracking System

## Overview
Build a system that logs every user's login events and page visits, then displays this data in a new "User Activity" admin page.

## Database Changes (Migration)

**New table: `user_activity_logs`**
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL, references auth.users)
- `event_type` (text) — values: `login`, `page_view`
- `page_path` (text, nullable) — e.g. `/learn`, `/community`
- `page_name` (text, nullable) — friendly name e.g. "Learn", "Community"
- `metadata` (jsonb, default `{}`) — browser info, etc.
- `created_at` (timestamptz, default now())

RLS policies:
- Admins can SELECT all rows
- Authenticated users can INSERT their own rows (where `auth.uid() = user_id`)
- No public access

Index on `(user_id, created_at)` for fast lookups.

## Frontend: Activity Tracker Hook

**New file: `src/hooks/useActivityTracker.ts`**
- On mount (in AppLayout), log a `page_view` event for the current route
- Listen to route changes via `useLocation()` and log each navigation
- On login (in AuthContext), log a `login` event
- Debounce/deduplicate rapid navigations
- Map paths to friendly names (e.g. `/community` → "Community", `/learn` → "Learn")

## Frontend: Admin Activity Page

**New file: `src/pages/admin/AdminActivity.tsx`**
- Summary cards: total logins (today/7d/30d), unique active users, most visited pages
- Table of recent activity: user name, event type, page, timestamp
- Filter by user, event type, date range
- Bar chart of page visit distribution
- Join with profiles to show user names/avatars

## Wiring

- Add route `/admin/activity` in `App.tsx`
- Add nav item `{ to: '/admin/activity', icon: Activity, label: 'User Activity' }` in `AdminLayout.tsx`
- Insert the tracking hook into `AppLayout` so it runs for all authenticated users
- Log `login` event in `AuthContext` after successful sign-in

## Technical Notes
- Activity logging uses upsert-style inserts (fire-and-forget, no await blocking UI)
- The tracker skips admin routes to avoid noise
- Uses existing `profiles` table join for displaying user names in the admin view


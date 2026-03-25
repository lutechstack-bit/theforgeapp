

# Fix Page View Tracking & Show All Active Users

## Problem
The admin activity page shows 0 page views despite users actively using the app (filling forms, posting profiles). Only login events are being recorded. The `useActivityTracker` hook code looks correct, but page_view inserts are likely failing silently or the tracker isn't firing properly.

## Root Cause (likely)
The `useActivityTracker` hook depends on `user` from `useAuth()`. During the initial app load, the auth state resolves asynchronously. The React effect fires with dependencies `[user, location.pathname]`. When `user` transitions from `null` to the actual user object, the effect re-runs — but there may be a race condition where the debounce timeout gets cleared by a subsequent render before it fires. Additionally, the 300ms debounce combined with React strict mode double-mounting could cause issues.

## Changes

### 1. Fix `src/hooks/useActivityTracker.ts` — Make page_view tracking more robust
- Remove the 300ms debounce — it's unnecessary for page navigations and causes missed events
- Add error logging with more detail to catch silent insert failures
- Reset `lastPathRef` when user changes (handles re-login scenarios)
- Add a `sessionStart` flag to log the landing page on first load

### 2. Enhance `src/pages/admin/AdminActivity.tsx` — Show all registered users with their activity status
- Add a new section/tab: "All Users" showing every registered user from `profiles` with columns:
  - Name, Avatar, Email
  - Last Login (from activity logs, or "Never")
  - Total Page Views (count)
  - Last Seen (most recent activity timestamp)
  - Status badge: "Active" / "Inactive" / "Never Logged In"
- This gives the admin a complete picture of who's using the app regardless of whether page_view tracking was working before

### No database changes needed
Existing `user_activity_logs` table and RLS policies are correct.


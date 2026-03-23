

# Build 8 Admin Efficiency Improvements

Improvement #1 (Collapsible Sidebar Groups) is already implemented. Here are the remaining 8.

## 2. Global Command Palette (Cmd+K)

**New file: `src/components/admin/AdminCommandPalette.tsx`**
- Uses existing `Command`/`CommandDialog` from `src/components/ui/command.tsx`
- Groups: "Pages" (all 27 admin pages), "Quick Actions" (Create User, Create Edition, Download Data), "Users" (live search from `profiles` table)
- Selecting an item navigates or triggers the action

**Edit: `src/components/admin/AdminLayout.tsx`**
- Add `useEffect` for `Cmd+K` / `Ctrl+K` keyboard listener
- Render `<AdminCommandPalette />` with open state
- Add a small search button in the sidebar header area

## 3. Pinned Quick Actions Bar

**Edit: `src/components/admin/AdminLayout.tsx`**
- Add a sticky header bar above `<Outlet />` in the main content area
- Contains: Cmd+K search trigger, "Create User", "Create Edition" buttons, notifications bell, activity feed trigger
- Shows "Last updated" timestamp + Refresh button
- Compact single row with subtle border-bottom

## 4. Real-Time Notifications Bell

**New file: `src/components/admin/AdminNotifications.tsx`**
- Popover dropdown triggered from the quick actions bar
- Queries: new signups (profiles created in last 24h), users with `ky_form_completed = false`, recent logins
- Shows count badge on the bell icon
- Each notification item is clickable (navigates to relevant admin page)

## 5. Draggable Dashboard Widgets

**Edit: `src/pages/admin/AdminDashboard.tsx`**
- Wrap each major section (stat cards, charts, engagement, feature toggles, quick actions, activity table) as a draggable widget
- HTML5 drag-and-drop API — each widget gets a drag handle icon
- Widget order saved to `localStorage` (`admin-dashboard-order`)
- "Reset Layout" button to restore default order

## 6. Bulk Actions Toolbar

**Edit: `src/pages/admin/AdminUsers.tsx`**
- Already has multi-select checkboxes and bulk delete
- Add a floating bottom toolbar that appears when 1+ users selected
- Additional actions: "Export Selected as CSV", "Change Payment Status" (dropdown), "Change Forge Mode" (dropdown)
- Toolbar sticks to bottom of viewport with slide-up animation

## 7. Inline Table Editing

**Edit: `src/pages/admin/AdminUsers.tsx`**
- Make `payment_status` and `forge_mode` columns clickable
- On click, show an inline `Select` dropdown replacing the cell text
- On change, immediately update via supabase mutation + toast feedback
- Click outside or Escape cancels

## 8. Live Activity Feed Sidebar

**New file: `src/components/admin/AdminActivityFeed.tsx`**
- Sheet (slide-out panel) from the right
- Fetches last 50 entries from `user_activity_logs` joined with `profiles`
- Each entry: avatar, name, event type badge, friendly page name, relative timestamp
- Auto-refreshes every 30 seconds via `refetchInterval`
- Triggered from the quick actions bar

## 9. Smart Alerts & Thresholds

**Edit: `src/pages/admin/AdminDashboard.tsx`**
- Add alert banner section at the top of dashboard
- Three checks using existing data:
  - "X users haven't logged in for 7+ days" — compare profiles count vs distinct users in activity logs last 7 days
  - "Y users have pending KY forms" — profiles where `ky_form_completed = false`
  - "Low login rate" — if today's logins < 50% of 7-day daily average
- Each alert: warning/info card with icon, message, dismiss button, and "View" link to relevant page
- Dismissed alerts stored in `localStorage` with daily reset

## Files Summary

| File | Action |
|------|--------|
| `src/components/admin/AdminCommandPalette.tsx` | New |
| `src/components/admin/AdminNotifications.tsx` | New |
| `src/components/admin/AdminActivityFeed.tsx` | New |
| `src/components/admin/AdminLayout.tsx` | Edit — add Cmd+K, quick actions bar, feed/notification triggers |
| `src/pages/admin/AdminDashboard.tsx` | Edit — draggable widgets, smart alerts |
| `src/pages/admin/AdminUsers.tsx` | Edit — bulk toolbar, inline editing |

## No Database Changes
All features use existing tables and RLS policies.


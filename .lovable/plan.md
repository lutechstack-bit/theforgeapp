

# Redesign Admin Dashboard — Compact, Interactive, Non-Tech Friendly

## Problem
The current dashboard is 936 lines of dense, repetitive cards — 5 stat cards + 8 platform health cards + 4 engagement cards + 3 pie/bar charts + 1 area chart + 1 line chart + 1 funnel chart + 1 progress bar + 1 activity table + 1 feature toggles card + 1 quick actions card. It's information overload with redundant data (e.g., "Active Editions" appears twice, completion rate shown in both stat card and progress bar).

## New Layout — Clean 3-Section Dashboard

```text
┌─────────────────────────────────────────────────────┐
│ Welcome back! · Today's Date · [Refresh]            │
├─────────────────────────────────────────────────────┤
│ SMART ALERTS (collapsible, only when needed)        │
├───────────┬───────────┬───────────┬─────────────────┤
│  Users    │ Onboarded │ Profiles  │ Logins Today    │
│  42       │  85%      │  28       │  12 ↑15%        │
│  (click → │  (click → │  (click → │  (click →       │
│  /users)  │  /users)  │  /network)│  /activity)     │
├───────────┴───────────┴───────────┴─────────────────┤
│                                                      │
│  ┌─ Tabs: [Overview] [Engagement] [Controls] ──┐    │
│  │                                               │    │
│  │  Overview tab:                                │    │
│  │   - Signups sparkline (compact, 120px tall)  │    │
│  │   - Cohort + Payment donuts side-by-side     │    │
│  │                                               │    │
│  │  Engagement tab:                              │    │
│  │   - Login trend line chart                    │    │
│  │   - Funnel bar chart                          │    │
│  │   - Recent activity table (5 rows default)   │    │
│  │                                               │    │
│  │  Controls tab:                                │    │
│  │   - Feature toggles (compact grid)            │    │
│  │   - Quick action buttons                      │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Key Design Decisions

1. **Clickable KPI cards** — Each card navigates to its detail page on click (cursor-pointer, hover scale). Only 4 cards instead of 13.
2. **Tabbed sections** — Instead of scrolling through everything, organize into 3 tabs. Less overwhelming.
3. **Remove duplicates** — Kill "Platform Health" section (redundant counts), kill separate "Profile Completion" bar (merged into KPI card as percentage), kill duplicate "Active Editions" stat.
4. **Compact charts** — Reduce chart heights from 220px to 160px. Use sparkline style for growth chart.
5. **Feature toggles as compact grid** — 2-column grid instead of stacked full-width cards.
6. **Friendly language** — "Welcome back!" header, plain labels like "People signed up" instead of "Total Users".

## Changes — `src/pages/admin/AdminDashboard.tsx`

### Remove
- `PlatformCard` component and entire "Platform Health" section (8 cards of static counts)
- Standalone "Profile Completion Rate" card (merged into KPI)
- `usePlatformCounts` hook (no longer needed)
- Duplicate stat row (5 → 4 KPI cards)

### Restructure KPI Row (4 cards)
- **People** — total users count, click → `/admin/users`
- **Onboarded** — completion % with "X of Y" subtitle, click → `/admin/users`
- **Profiles** — creative profiles count, click → `/admin/network`
- **Logins Today** — today's count with trend badge, click → `/admin/activity`
- Each card: `cursor-pointer hover:scale-[1.02] hover:border-primary/30 transition-all`

### Add Tabs Component
Use existing `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` from shadcn.

**Overview tab** (default):
- User Growth area chart (height reduced to 160px)
- Side-by-side: Payment donut + Cohort bar chart (each 160px)

**Engagement tab**:
- Daily Logins line chart (160px)
- Engagement Funnel bar chart (160px)
- Recent Activity table (show 5 rows, expandable)

**Controls tab**:
- Feature toggles in 2-column grid (compact)
- Quick actions row

### Hooks Cleanup
- Remove `usePlatformCounts`
- Keep: `useUserStats`, `useGrowthData`, `useCohortDistribution`, `useLoginStats`, `useEngagementFunnel`, `useRecentActivity`, `useSmartAlerts`

## File
`src/pages/admin/AdminDashboard.tsx` — full rewrite of the render section, removal of unused hooks/components


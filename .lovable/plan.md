

# Consolidate Admin Sidebar into Grouped Navigation

## Current State
27 flat navigation items in the admin sidebar — overwhelming and hard to scan.

## Proposed Grouping (27 items → 6 collapsible groups)

```text
📊 Overview
   ├─ Dashboard
   └─ User Activity

👥 Users & Data
   ├─ Users
   ├─ Editions
   ├─ KY Forms
   └─ Payments

📱 App Content
   ├─ Homepage
   ├─ Today's Focus
   ├─ Announcements
   ├─ Perks
   └─ Events

🎓 Curriculum
   ├─ Roadmap
   ├─ Roadmap Sidebar
   ├─ Equipment
   ├─ Nightly Rituals
   ├─ Journey Stages
   ├─ Journey Tasks
   └─ Learn

🤝 Community
   ├─ Network
   ├─ Community Highlights
   ├─ Alumni Showcase
   ├─ Mentors
   └─ Explore Programs

⚙️ System
   ├─ Auto Updates
   ├─ Documentation
   └─ Changelog
```

## Implementation

### File: `src/components/admin/AdminLayout.tsx`
- Replace the flat `adminNavItems` array with a grouped structure: `{ label, icon, items[] }`
- Use the existing `Collapsible` component from `@radix-ui/react-collapsible` (already in the project)
- Each group header shows icon + label + chevron toggle
- Clicking a group expands/collapses its children
- Auto-expand the group containing the current active route
- When sidebar is collapsed (icon-only mode), groups flatten — show only group icons with tooltip, and sub-items appear in a flyout tooltip on hover
- Store open/closed state in `localStorage` so it persists across sessions

### No other file changes
Routes and pages remain exactly the same — this is purely a sidebar UI reorganization.


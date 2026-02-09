

# Homepage Reconstruction - Premium Layout with Admin Control

## Overview

Rebuild the homepage to match the reference design: a clean, vertical, card-based layout with distinct sections for Today's Focus, Onboarding Steps, Journey Timeline (with date-pill selectors), Batchmates, Mentors, Alumni Showcase, and Travel & Stay. Every section will be admin-customizable.

This is a large effort. To keep it manageable and testable, it is broken into **4 phases**, each delivering a working increment.

---

## Section Order (Top to Bottom)

```text
1. Countdown Timer (existing - keep as-is)
2. Today's Focus Card (NEW - smart priority CTA)
3. Complete Your Onboarding (NEW - sequential locked steps)
4. Your Forge Journey (REDESIGNED - date pill selectors + session detail cards)
5. Your Batchmates (NEW - avatar grid of cohort members)
6. Meet Your Mentors (EXISTING - layout tweaks)
7. Alumni Showcase (EXISTING - relabel, add film metadata)
8. Travel & Stay (MOVED from sidebar to inline card)
```

---

## Phase 1: Today's Focus + Onboarding Steps

### New Database Table: `today_focus_cards`

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (PK) | |
| title | text | e.g. "Complete your Filmmaker Profile" |
| description | text | e.g. "Tell us about your filmmaking journey" |
| cta_text | text | e.g. "Start Now" |
| cta_route | text | e.g. "/kyf-form" |
| icon_emoji | text | e.g. "target" |
| priority | integer | Higher = shown first |
| auto_detect_field | text | Profile field to check (e.g. "ky_form_completed") |
| cohort_types | text[] | Which cohorts see this |
| is_active | boolean | |
| order_index | integer | |
| created_at | timestamptz | |

This lets admins create priority-based focus cards. The system auto-selects the highest-priority card whose `auto_detect_field` is not yet completed by the user.

### New Component: `TodaysFocusCard`
- Gold-accented banner with icon, title, description, "Start Now" CTA button
- Shows steps remaining count based on related onboarding tasks
- Matches the "TODAYS FOCUS / Priority" badge design from the reference

### Redesigned Component: `OnboardingStepsSection`
- Replaces the current horizontal scroll cards with a vertical accordion-style list
- Shows progress bar segments (0 of 3) at the top
- Each step shows: number, title, description, "Start >" or lock icon
- Steps unlock sequentially (step 2 locked until step 1 is complete)
- Uses existing `ky_form_steps` data (already admin-managed) OR the `journey_tasks` from the Pre-Registration stage
- Collapsible with chevron toggle

### New Admin Page: `AdminTodaysFocus`
- CRUD for `today_focus_cards`
- Set priority, cohort targeting, auto-detect logic
- Preview which card would show for a given user state

### Files

| File | Action |
|------|--------|
| `src/components/home/TodaysFocusCard.tsx` | CREATE |
| `src/components/home/OnboardingStepsSection.tsx` | CREATE |
| `src/hooks/useTodaysFocus.ts` | CREATE |
| `src/pages/admin/AdminTodaysFocus.tsx` | CREATE |
| `src/pages/Home.tsx` | MODIFY - add new sections |

---

## Phase 2: Journey Redesign with Date Pill Selectors

### Redesigned Component: `HomeJourneySection`

Replace the current timeline card layout with the reference design:

**Structure:**
```text
"Your Forge Journey"
"7 online sessions + 8 days in Goa"

--- Online Sessions --- Jan 29 - Feb 7
[ 29 ] [ 31 ] [ 1 ] [ 3 ] [ 4 ] [ 6 ] [ 7 ]   <-- date pills
  Wed    Fri    Sat   Mon   Tue   Thu   Fri

  ┌─ Session Detail Card ──────────────────┐
  │ Session 1                              │
  │ The Forge for Filmmakers: Orientation   │
  │ Jan 29 - 7:30 PM - 8:30 PM            │
  │ Description...                         │
  │ [Add to Calendar]  [Via Zoom Link]     │
  └────────────────────────────────────────┘

--- Goa Bootcamp --- Feb 9 - 16
[ 9 ] [ 10 ] [ 11 ] ... [ 16 ]   <-- date pills
 Day1  Day2   Day3       Day8

  ┌─ Day Detail Card ──────────────────────┐
  │ "Everything Everywhere All At Once"    │
  │ Orientation + Meet & Greet             │
  │ Feb 9 - 5 activities                   │
  │                                        │
  │ ● Arrival & Check-in  2:00 PM          │
  │ ● Orientation         4:00 PM          │
  │ ● Ice-breaker         5:30 PM          │
  │ ● Dinner              8:30 PM          │
  └────────────────────────────────────────┘
```

**Key features:**
- Splits `roadmap_days` into two groups: Online Sessions (day_number < 0 or is_virtual) and Bootcamp (day_number > 0)
- Horizontal scrollable date pills with gold highlight on selected/current day
- Clicking a date pill reveals the session detail inline (no modal needed)
- Session detail shows schedule items, "Add to Calendar" button, and Zoom link
- All data already exists in `roadmap_days` table - fully admin-managed

### New Components

| File | Action |
|------|--------|
| `src/components/home/DatePillSelector.tsx` | CREATE - reusable date pill strip |
| `src/components/home/SessionDetailCard.tsx` | CREATE - inline session detail |
| `src/components/home/HomeJourneySection.tsx` | REWRITE - new date-pill layout |

---

## Phase 3: Batchmates + Alumni Showcase Redesign

### New Component: `BatchmatesSection`

- Shows avatar grid of cohort members (same edition_id)
- Each card: avatar/initial, name, city
- Shows up to 5 members + "+N more" pill
- Clicking "+N more" navigates to community page
- Data comes from existing `profiles` table filtered by `edition_id`
- Admin controls: Toggle visibility per edition, max display count (can be added to `editions` table as `show_batchmates` boolean)

### Redesigned: Alumni Showcase

- Rename from "Alumni Spotlight" to "Alumni Showcase"
- Add "View all >" link navigating to a dedicated page or the Learn section
- Show film-style cards with: thumbnail, play icon, duration, title, author name, edition label
- Uses existing `student_films` table (already admin-managed) or `alumni_testimonials` depending on data
- Add `edition_name` field to `student_films` if not present for the "E2 Goa" label

### Files

| File | Action |
|------|--------|
| `src/components/home/BatchmatesSection.tsx` | CREATE |
| `src/components/home/AlumniShowcaseSection.tsx` | CREATE |
| `src/pages/Home.tsx` | MODIFY - integrate new sections |

---

## Phase 4: Inline Travel & Stay + Homepage Section Admin

### Travel & Stay Section (Promoted from Sidebar)

- Move the stay location display from the right sidebar to an inline section on the homepage
- Card layout: Image carousel (left) + property details (right)
- Shows property name, address, description, "Open in Maps" button
- All data from existing `stay_locations` table (already admin-managed)
- Keep the sidebar for desktop but remove stay location from it (moments + student work remain)

### New Database Table: `homepage_sections`

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (PK) | |
| section_key | text | e.g. "countdown", "todays_focus", "onboarding", "journey", "batchmates", "mentors", "alumni", "travel_stay" |
| title | text | Display title (editable) |
| subtitle | text | Optional subtitle |
| is_visible | boolean | Show/hide toggle |
| order_index | integer | Section ordering |
| cohort_types | text[] | Which cohorts see this section |
| created_at | timestamptz | |

This gives admins full control to:
- Reorder homepage sections
- Hide/show sections per cohort
- Customize section titles

### New Admin Page: `AdminHomepage`

- Drag-and-drop section reordering
- Toggle visibility per section
- Edit section titles/subtitles
- Link to each section's detailed admin (e.g., click "Mentors" row to jump to AdminMentors)

### Files

| File | Action |
|------|--------|
| `src/components/home/TravelStaySection.tsx` | CREATE |
| `src/hooks/useHomepageSections.ts` | CREATE |
| `src/pages/admin/AdminHomepage.tsx` | CREATE |
| `src/pages/Home.tsx` | MODIFY - dynamic section rendering |
| `src/components/roadmap/RoadmapSidebar.tsx` | MODIFY - remove stay from sidebar |

---

## Removed from Homepage

| Current Section | Action |
|----------------|--------|
| Prep Highlight Card | REMOVE from homepage (stays in Roadmap > Prep) |
| Desktop Right Sidebar | KEEP but only for Moments + Student Work (no Stay) |
| Events carousel | REMOVE (events have their own tab) |
| Learn carousel | REMOVE (learn has its own tab) |

---

## Technical Approach

### Database Migrations (3 migrations)
1. `today_focus_cards` table with RLS policies
2. `homepage_sections` table with seed data for default section order
3. Add `show_batchmates` to `editions` table (optional toggle)

### RLS Policies
- `today_focus_cards`: SELECT for authenticated users, ALL for admins
- `homepage_sections`: SELECT for authenticated users, ALL for admins

### Component Architecture
- Each section is a self-contained component with its own loading skeleton
- `useHomepageSections` hook fetches section config and renders sections in order
- Home.tsx becomes a thin orchestrator that maps section keys to components

### Routing Updates
- Add `/admin/homepage` route for the new admin page
- Add to admin sidebar navigation

---

## Implementation Order

**Phase 1** (Today's Focus + Onboarding) should be implemented first as it provides the most impactful user-facing change. Each subsequent phase builds on the previous without breaking existing functionality.


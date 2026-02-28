

# Admin Panel Audit: Tab-by-Frontend Connection Status

## All 21 Admin Tabs — Status

### FULLY CONNECTED (Admin manages data → Frontend renders it dynamically)

| # | Tab | Backend Table | Frontend Consumer |
|---|------|--------------|-------------------|
| 1 | **Dashboard** | Multiple tables | Admin-only analytics view |
| 2 | **Homepage** | `homepage_sections` | `Home.tsx` — dynamic section ordering/visibility |
| 3 | **Today's Focus** | `today_focus_cards` | `TodaysFocusCard.tsx` on Home |
| 4 | **Users** | `profiles` | Profile pages, community, batchmates |
| 5 | **Editions** | `editions` | Cohort filtering across entire app |
| 6 | **KY Forms** | `kyf_responses`, `kyc_responses`, `kyw_responses` | KYF/KYC/KYW form pages |
| 7 | **Journey Stages** | `journey_stages` | `StageNavigationStrip`, Journey page |
| 8 | **Journey Tasks** | `journey_tasks` | `JourneyTaskItem`, Journey page |
| 9 | **Announcements** | `notifications` (hero) | `AnnouncementBanner` on Home via `useSmartAnnouncements` |
| 10 | **Roadmap** | `roadmap_days` | Roadmap Journey page, day detail modals |
| 11 | **Roadmap Sidebar** | `roadmap_sidebar_content` | `RoadmapSidebar` carousels |
| 12 | **Equipment** | `forge_equipment` | `EquipmentSection` on Roadmap |
| 13 | **Nightly Rituals** | `nightly_rituals` | `NightlyRitualSection` on Roadmap Prep |
| 14 | **Events** | `events` | Events page, Home upcoming events |
| 15 | **Learn** | `learn_content`, `learn_programs` | Learn page, course detail |
| 16 | **Mentors** | `mentors` | Mentor cards on Home + Learn |
| 17 | **Community Highlights** | `community_highlights` | `CompactHighlights`, `HighlightsCard` in Community |
| 18 | **Auto Updates** | `notifications` (auto_update=true) | `MasterNotificationCenter` notification feed |

### PARTIALLY CONNECTED — Admin exists, frontend consumer is weak or missing

| # | Tab | Issue |
|---|------|-------|
| 19 | **Alumni Testimonials** | Admin manages `alumni_testimonials` table. `AlumniShowcaseSection` on Home exists but pulls from `user_works` (student portfolio), NOT from `alumni_testimonials`. The admin-managed testimonial videos are **never shown** on the frontend. |
| 20 | **Documentation** | Admin manages `app_doc_versions`. Only consumed by the admin panel itself (`AdminDocs`). No user-facing documentation page exists. This is admin-internal tooling — arguably valid. |
| 21 | **Changelog** | Admin manages `app_changelog`. Only consumed by `AdminChangelog` itself. The user-facing `Updates.tsx` page uses **hardcoded mock data**, not the `app_changelog` table. |

---

## Summary

**19 of 21 tabs are fully functional** with real backend-to-frontend connections.

**2 tabs have disconnected frontend:**

1. **Alumni Testimonials** — Admin CRUD works, but the Home page's "Alumni Showcase" section reads from `user_works` instead of `alumni_testimonials`. Fix: wire `AlumniShowcaseSection` to pull from `alumni_testimonials`.

2. **Changelog** — Admin CRUD works, but the `/updates` page uses mock notifications. Fix: rewrite `Updates.tsx` to pull from `app_changelog` table.

**Documentation** is intentionally admin-internal (version-controlled app docs for the team) — this is valid and does not need a user-facing page.

---

## Proposed Fixes

### Fix 1: Wire `Updates.tsx` to use `app_changelog`
Replace the mock notification data with a real query to `app_changelog`. Show version history, categories, and status from the database.

### Fix 2: Wire `AlumniShowcaseSection` to use `alumni_testimonials`
Update the Home page's alumni section to fetch from `alumni_testimonials` (admin-managed video testimonials) instead of or in addition to `user_works`.

### Fix 3: No tabs need removal
All 21 tabs manage real database tables with proper RLS policies. None are orphaned.


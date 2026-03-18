

# Rebuild Community Page: Creatives Directory + Gigs Board

This is a large feature spanning database schema, KY form integration, and a complete Community page rebuild. I recommend implementing this in **3 phases** across multiple prompts to avoid overwhelming any single change.

---

## Phase 1: Database Schema + Community Profile KY Section

### New Tables

**`gigs`** — Job/opportunity board
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | poster |
| title | text | e.g. "Cinematographer needed for 3-day brand shoot" |
| category | text | e.g. Cinematography, Direction, Editing |
| gig_type | text | Freelance/Gig, Full-time, Internship |
| description | text | |
| roles_needed | text[] | Multi-select from occupations |
| pay_type | text | paid, revenue_share, credit_only |
| budget | text | Free-form e.g. "₹5,000/day" |
| duration | text | |
| location | text | |
| visibility | text | all, cohort_only |
| contact_info | text | Email or application link |
| status | text | draft, published, closed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

RLS: Authenticated can view published gigs; users can CRUD own gigs; admins can manage all.

**`saved_profiles`** — Bookmark/save creatives
| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid |
| saved_user_id | uuid |
| created_at | timestamptz |

RLS: Users can CRUD own saves.

### Alter `collaborator_profiles`
Add columns:
- `tagline` text — "The Soul of the Story" cinematic elevator pitch
- `about` text — longer bio
- `available_for_hire` boolean default false
- `portfolio_url` text
- `portfolio_type` text — "Portfolio", "Reel", "Website"

### KY Form Integration
Add a new `KYSection` called **"Community Profile"** to each cohort's section config (KYF, KYC, KYW) in `KYSectionConfig.ts`. This section writes to `collaborator_profiles` table (not the KY response tables). It will have 3 steps:

**Step 1 — The Basics** (pre-filled from profile + KY data):
- Name (disabled, from `profiles.full_name`)
- City (disabled, from `profiles.city`)
- Tagline (textarea, 100 char max) — "Your cinematic elevator pitch"
- The "Soul of the Story" helper text

**Step 2 — Your Professional Soul**:
- Roles (multi-select from `collaborator_occupations`, max 4)
- Forge Edition (disabled, pre-filled from edition)
- About Your Work (textarea, 500 char) — "Tell us about the projects you've worked on..."

**Step 3 — Connect & Share**:
- Available for Hire toggle
- Open to Remote toggle
- Portfolio link type (select: Portfolio, Reel, Website)
- Portfolio URL
- Publish profile action

This section is **optional** — it does not block KY form completion. It also appears as a `+ Post Profile` CTA on the Community page.

---

## Phase 2: Rebuild Community Page UI

### Top-level Layout
```text
┌─────────────────────────────────────────┐
│  [Creatives]  [Gigs]     [Saved] [Avatar]│
├─────────────────────────────────────────┤
│ • Announcement banner (feature flag)     │
├─────────────────────────────────────────┤
│ Creatives                    Stats row   │
│ "Collaborate with..."   [+ Post Profile] │
├─────────────────────────────────────────┤
│ ┌─────────┐  ┌──────────────────────┐   │
│ │ SEARCH   │  │ [All] [Your cohort]  │   │
│ │ ─────── │  │ [Recently active ▾]  │   │
│ │ ROLE     │  │                      │   │
│ │ [pills]  │  │ Cohort header bar    │   │
│ │          │  │ ┌────┐ ┌────┐       │   │
│ │AVAILAB.  │  │ │Card│ │Card│       │   │
│ │ □ Remote │  │ └────┘ └────┘       │   │
│ │ □ Hire   │  │                      │   │
│ └─────────┘  └──────────────────────┘   │
└─────────────────────────────────────────┘
```

On mobile: sidebar filters collapse into a horizontal scroll row + sheet.

### Components to Create/Modify

| Component | Action |
|-----------|--------|
| `src/pages/Community.tsx` | Rebuild — top pills (Creatives/Gigs), keep Chat behind `community_chat_enabled` flag |
| `src/components/community/CreativesDirectory.tsx` | **New** — main directory with sidebar filters, "All creatives" / "Your cohort" toggle, sort dropdown |
| `src/components/community/CreativeCard.tsx` | **New** — redesigned card matching reference (avatar with role icon, availability badge, intro, occupation pills, last project, edition badge) |
| `src/components/community/CreativeDetailModal.tsx` | **New** — full profile popup (Dialog on desktop, Drawer on mobile) with About, Roles, Work Samples, At a Glance stats, Details grid, Contact + Save buttons |
| `src/components/community/GigsBoard.tsx` | **New** — gig listing page with filters |
| `src/components/community/GigCard.tsx` | **New** — individual gig card |
| `src/components/community/GigPostForm.tsx` | **New** — gig creation form (title, category, type, description, roles needed, pay type, budget, duration, location, visibility, contact) |
| `src/components/community/ContactPitchModal.tsx` | **New** — "Pitch your project" modal (replaces simple CollaboratorRequestModal) with name, pitch textarea (500 char), "To: Name" chip |
| `src/components/community/CreativeFilters.tsx` | **New** — sidebar/collapsible filters (search, role pills, availability checkboxes) |
| `src/components/community/CollaboratorDirectory.tsx` | **Delete** — replaced by CreativesDirectory |
| `src/components/community/CollaboratorCard.tsx` | **Delete** — replaced by CreativeCard |
| `src/components/community/CollaboratorRequestModal.tsx` | **Delete** — replaced by ContactPitchModal |
| `src/components/community/CollaboratorStepIndicator.tsx` | Can be kept for KY section |
| `src/pages/CollaboratorSetup.tsx` | **Delete** — replaced by KY section integration |

### "Your Cohort" vs "All Creatives" Logic
- "Your cohort": filter `collaborator_profiles` joined with `profiles.edition_id` matching logged-in user's `edition_id`
- "All creatives": show all published profiles
- Show cohort header: "★ Your cohort · Forge Filmmaking Ed. 15 · Goa · X members"

---

## Phase 3: Gigs Feature Details

- Gig cards show: title, category, gig_type, pay_type badge, roles needed pills, poster name, posted date
- "New listing" form accessible via `+ Post Gig` button on Gigs tab
- Form layout: 2-column on desktop (main form left, sidebar with pay type / logistics / visibility / contact right)
- "Save draft" and "Publish gig" buttons
- Visibility selector: "All of LevelUp" or "My cohort only"
- "COHORT SEES IT FIRST · 48 HRS" badge when poster chooses cohort-first

---

## Implementation Order

Given the size, I recommend splitting implementation across prompts:

1. **This prompt**: Database migrations (gigs table, saved_profiles table, alter collaborator_profiles) + Community Profile KY section config
2. **Next prompt**: CreativesDirectory, CreativeCard, CreativeDetailModal, rebuild Community.tsx
3. **Following prompt**: GigsBoard, GigCard, GigPostForm, ContactPitchModal

Shall I proceed with this phased approach, or would you prefer I attempt everything at once?


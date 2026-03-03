

# Creative Network — Full System with Admin Panel

## Overview
Build a "Find Collaborator" network inside the Community tab with a multi-step profile setup wizard, searchable directory, collaboration request inbox, and a dedicated admin tab for managing everything.

## Database (4 new tables)

### `collaborator_profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid unique | NOT NULL, references auth.users ON DELETE CASCADE |
| intro | text | Max ~100 chars, punchy one-liner |
| occupations | text[] | e.g. `['Cinematographer','Editor']` |
| open_to_remote | boolean | default false |
| is_published | boolean | default false |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

RLS: Users CRUD own row. All authenticated SELECT where `is_published = true`. Admins ALL.

### `collaborator_works`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | NOT NULL, references auth.users ON DELETE CASCADE |
| title | text | |
| work_type | text | "Short Film", "Documentary", etc. |
| year | text | |
| description | text | |
| order_index | int | default 0 |
| created_at | timestamptz | default now() |

RLS: Users CRUD own. Authenticated SELECT where user has published collaborator profile. Admins ALL.

### `collaboration_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| from_user_id | uuid | NOT NULL |
| to_user_id | uuid | NOT NULL |
| message | text | |
| status | text | default 'unread' (unread/read/accepted/declined) |
| created_at | timestamptz | default now() |

RLS: Users INSERT as from_user. Users SELECT own sent + received. Users UPDATE received (status changes). Admins ALL.

### `collaborator_occupations` (lookup/reference)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | unique, e.g. "Cinematographer" |
| order_index | int | default 0 |
| is_active | boolean | default true |
| created_at | timestamptz | default now() |

RLS: Authenticated SELECT where active. Admins ALL.

Seed with defaults: Photographer, Cinematographer, Editor, Director, Colorist, Writer, Illustrator, Animator, Sound Designer, Producer.

Enable realtime on `collaboration_requests` for live inbox updates.

## New Files

### Collaborator Setup Wizard
**`src/pages/CollaboratorSetup.tsx`** — 4-step full-page wizard

- **Step 1 — Identity**: Pre-fills name + city from `profiles`. New fields: intro textarea (100 char limit with counter), open-to-remote toggle.
- **Step 2 — Craft**: Multi-select occupation pills fetched from `collaborator_occupations`. Pill grid UI.
- **Step 3 — Work**: Add up to 4 project cards (title, type, year, description). "+Add another" button.
- **Step 4 — Forge Edition**: Shows pre-assigned edition from `profiles.edition_id` → `editions`. Confirmation checkbox. PUBLISH button.

On publish: upserts `collaborator_profiles` with `is_published = true`, upserts `collaborator_works`, redirects to `/community` Network tab.

**`src/components/community/CollaboratorStepIndicator.tsx`** — horizontal numbered stepper (Identity → Craft → Work → Forge)

**`src/components/community/OccupationPillSelector.tsx`** — reusable multi-select pill grid

### Community Network Tab
**`src/components/community/CollaboratorDirectory.tsx`** — main directory
- Search bar (name, occupation, city)
- Filter pills from `collaborator_occupations`
- Grid of CollaboratorCards (1→2→3 columns responsive)
- CTA banner for users without a published collaborator profile ("Set up your network profile")

**`src/components/community/CollaboratorCard.tsx`** — rich member card
- Avatar with cohort-colored ring (amber FORGE, pink CREATORS, emerald WRITING)
- Name, occupation tags, city, intro quote
- Edition badge
- PORTFOLIO / CONTACT CTAs
- "Contact" opens request composer

**`src/components/community/CollaboratorRequestModal.tsx`** — modal to send request
- Recipient info header
- Message textarea
- Inserts into `collaboration_requests`

**`src/components/community/CollaboratorInbox.tsx`** — inbox accessible from Network header
- Tabs: All / Unread / Actioned
- Request cards with sender info, message preview, timestamp
- Accept/Decline actions

### Admin Tab
**`src/pages/admin/AdminNetwork.tsx`** — full CRUD admin page with 3 sub-tabs:

**Tab 1: Occupations** — manage the `collaborator_occupations` table
- Table view with name, order, active toggle
- Add/Edit/Delete occupations
- Drag-reorder or order_index editing

**Tab 2: Profiles** — view/manage all collaborator profiles
- Table: User name, occupations, intro, city, works count, published status, created date
- Toggle publish/unpublish
- View details modal
- Delete collaborator profile
- Search + filter by occupation

**Tab 3: Requests** — view all collaboration requests
- Table: From user, To user, Message preview, Status, Date
- Filter by status (all/unread/read/accepted/declined)
- View full message
- Delete request
- Stats: total requests, acceptance rate

Dashboard integration: Add collaborator profile count + request count to `AdminDashboard` platform health section.

### Edited Files

**`src/pages/Community.tsx`**
- Add `Chat | Network` toggle at top (two pill buttons)
- When Network is active, render `CollaboratorDirectory`
- Existing chat logic untouched

**`src/App.tsx`**
- Add route: `/collaborator-setup` (ProtectedRoute + ProfileSetupCheck)
- Add admin route: `network` → `AdminNetwork`

**`src/components/admin/AdminLayout.tsx`**
- Add nav item: `{ to: '/admin/network', icon: Handshake, label: 'Network' }`

## Data Flow
- Collaborator setup pulls existing data from `profiles` (name, city, edition_id) and `editions` (name, cohort_type, city)
- Directory queries `collaborator_profiles` joined with `profiles` (avatar, city, full_name) and `editions` (cohort badge)
- Works loaded from `collaborator_works`
- Occupations loaded from `collaborator_occupations` for both filter pills and setup wizard
- All admin operations use standard Supabase CRUD with admin RLS

## Files Summary

| Action | File |
|--------|------|
| Migration | 4 tables + RLS + seed occupations + realtime |
| Create | `src/pages/CollaboratorSetup.tsx` |
| Create | `src/components/community/CollaboratorStepIndicator.tsx` |
| Create | `src/components/community/OccupationPillSelector.tsx` |
| Create | `src/components/community/CollaboratorDirectory.tsx` |
| Create | `src/components/community/CollaboratorCard.tsx` |
| Create | `src/components/community/CollaboratorRequestModal.tsx` |
| Create | `src/components/community/CollaboratorInbox.tsx` |
| Create | `src/pages/admin/AdminNetwork.tsx` |
| Edit | `src/pages/Community.tsx` |
| Edit | `src/App.tsx` |
| Edit | `src/components/admin/AdminLayout.tsx` |
| Edit | `src/pages/admin/AdminDashboard.tsx` (add network stats) |


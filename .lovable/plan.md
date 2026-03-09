

# Add "Explore Other Programs" Admin Tab

## What we're building
A new **"Explore Other Programs"** tab in the Admin Learn page that lets you manage program banners (both Online and Offline) with image upload and redirect URL fields. This replaces the currently hardcoded program data on the Learn page.

## Database

### New table: `explore_programs`
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid PK | |
| title | text | Program name (e.g. "Forge Writing") |
| description | text | Short description |
| label | text | Top label (e.g. "FORGE RESIDENCY") |
| image_url | text | Uploaded banner image |
| redirect_url | text | External link |
| gradient | text | Fallback CSS gradient if no image |
| program_tab | text | `'online'` or `'offline'` |
| order_index | int | Sort order |
| is_active | boolean | Show/hide toggle |
| created_at | timestamptz | |

RLS: Read for authenticated, write for admins (using `has_role`).

## Admin Changes (`src/pages/admin/AdminLearn.tsx`)

Add a third tab **"Explore Programs"** next to Community Sessions and Pre Forge Sessions.

The tab content shows:
- Sub-toggle: **Online Programs** / **Offline Residencies** (filters by `program_tab`)
- A simple card list showing each program with thumbnail, title, redirect URL
- **Add Program** button opens a dialog with:
  - Title, Description, Label inputs
  - Image upload (using existing `FileUpload` component to `learn-thumbnails` bucket)
  - Redirect URL input
  - Online/Offline select
  - Order index
- Edit/Delete actions per card

## Frontend Changes (`src/pages/Learn.tsx`)

Replace the hardcoded `forgeResidencies` array and hardcoded `ProgramBanner` components with a query to `explore_programs` table, filtered by `program_tab` matching the current toggle state and `is_active = true`.

## Files changed
1. **Migration SQL** — create `explore_programs` table + RLS policies
2. **`src/pages/admin/AdminLearn.tsx`** — add "Explore Programs" tab with CRUD UI
3. **`src/pages/Learn.tsx`** — replace hardcoded programs with DB query


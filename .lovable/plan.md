

# Admin Changelog Page

## Goal
Create a dedicated **Changelog** tab in the admin dashboard to track app changes in a structured table format (matching your reference image), with CSV export functionality.

## What We'll Build

### 1. New Database Table: `app_changelog`
Store changelog entries with these fields:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| version | TEXT | Version number (e.g., "1.2.0") |
| title | TEXT | Short feature name |
| description | TEXT | Detailed description |
| category | TEXT | Feature category (e.g., "UI", "Backend", "Bug Fix") |
| status | TEXT | Status (e.g., "Completed", "In Progress") |
| date_added | TIMESTAMP | When the change was made |
| added_by | TEXT | Team member who made the change |
| created_at | TIMESTAMP | Record creation time |

### 2. New Admin Page: `AdminChangelog.tsx`
Features:
- **Table View** matching your reference image format
- **Add Entry Form** with fields for version, title, description, category, status, date, added_by
- **Edit/Delete** capabilities for existing entries
- **CSV Export Button** to download all changelog entries

### 3. Navigation Integration
Add "Changelog" to the admin sidebar with a `History` icon

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| Database Migration | CREATE | New `app_changelog` table with RLS |
| `src/pages/admin/AdminChangelog.tsx` | CREATE | New changelog management page |
| `src/components/admin/AdminLayout.tsx` | UPDATE | Add nav item for Changelog |
| `src/App.tsx` | UPDATE | Add route for `/admin/changelog` |

## Technical Implementation

### Database Table
```sql
CREATE TABLE app_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Feature',
  status TEXT NOT NULL DEFAULT 'Completed',
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Admin only
ALTER TABLE app_changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage changelog"
  ON app_changelog FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### CSV Export Function
```typescript
const exportToCSV = () => {
  const headers = ['Version', 'Title', 'Description', 'Category', 'Status', 'Date', 'Added By'];
  const rows = changelog.map(entry => [
    entry.version,
    entry.title,
    entry.description,
    entry.category,
    entry.status,
    format(new Date(entry.date_added), 'MMM d, yyyy'),
    entry.added_by || ''
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  // Download as file
};
```

### UI Layout (matching reference)
```text
+--------------------------------------------------------------+
| Changelog                                    [+ Add] [Export] |
+--------------------------------------------------------------+
| Version | Title           | Description | Category | Status  |
|---------|-----------------|-------------|----------|---------|
| 1.2.0   | Countdown Timer | Split-number| UI       |Completed|
| 1.1.0   | Sticky Notes    | Journey...  | Feature  |Completed|
+--------------------------------------------------------------+
```

## Pre-populated Sample Data
We'll seed the table with the 4 changes you listed:
1. Compact Countdown Timer
2. Sticky Notes + Announcements + Note Taker
3. Mobile Floating Button
4. UI Alignment Fixes


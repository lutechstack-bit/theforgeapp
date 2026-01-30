

# Add Multi-Edition Selection to Stay Locations

## Summary

The Stay Locations admin already has the updated UI (single address textarea, image upload tabs) - you may need to **refresh the page** or **clear browser cache** to see these changes.

However, the **multi-edition selection** feature is still missing. This plan implements it following the existing pattern from `AdminRoadmapSidebar.tsx`.

---

## Current State

| Feature | Status |
|---------|--------|
| Single `full_address` textarea | ✅ Already implemented |
| Featured Image Upload/URL tabs | ✅ Already implemented |
| Gallery Images Upload/URL tabs | ✅ Already implemented |
| Multi-select editions | ❌ Missing - still uses single Select |

---

## What Will Change

**Before:**
```text
Edition
┌──────────────────────────────────────┐
│ ▼ Select edition                     │
│   • Global (All Editions)            │
│   • Forge Creators - Mumbai          │  ← Single selection
│   • Forge Writing - Hyderabad        │
└──────────────────────────────────────┘
```

**After:**
```text
Editions
┌──────────────────────────────────────┐
│ ☑ Forge Creators - Mumbai            │
│ ☑ Forge Writing - Hyderabad          │  ← Multi-select checkboxes
│ ☐ Forge Filmmaking - Goa             │
└──────────────────────────────────────┘
│ Leave empty = visible to all editions
│
│ [Forge Creators ×] [Forge Writing ×]  ← Badge display
└──────────────────────────────────────┘
```

---

## Technical Changes

### 1. Database Migration

Create a junction table following the `roadmap_sidebar_content_editions` pattern:

```sql
-- Create junction table for multi-edition support
CREATE TABLE stay_location_editions (
  stay_location_id UUID REFERENCES stay_locations(id) ON DELETE CASCADE,
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  PRIMARY KEY (stay_location_id, edition_id)
);

-- Enable RLS
ALTER TABLE stay_location_editions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow read for authenticated" 
ON stay_location_editions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for admin" 
ON stay_location_editions FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Migrate existing single edition_id data to junction table
INSERT INTO stay_location_editions (stay_location_id, edition_id)
SELECT id, edition_id FROM stay_locations WHERE edition_id IS NOT NULL;

-- Drop the old column (optional - can keep for backward compatibility)
ALTER TABLE stay_locations DROP COLUMN edition_id;
```

---

### 2. Admin UI Update (`AdminStayLocations.tsx`)

**Changes:**

| Section | Current | New |
|---------|---------|-----|
| Interface | `edition_id: string \| null` | `edition_ids: string[]` |
| Form state | Single value | Array of IDs |
| Form UI | Single `<Select>` | Checkbox list in `<ScrollArea>` |
| Create mutation | Direct insert | Insert + junction table insert |
| Update mutation | Direct update | Update + delete old mappings + insert new |
| Display on cards | Single edition badge | "X editions" or "All Editions" badge |

**UI Component (following AdminRoadmapSidebar pattern):**

```tsx
{/* Multi-Edition Selection */}
<div className="md:col-span-2 space-y-2">
  <Label>Editions</Label>
  <p className="text-xs text-muted-foreground">
    Select editions where this location should appear. 
    Leave empty for all editions.
  </p>
  <Card className="p-0">
    <ScrollArea className="h-[140px]">
      {editions.map(edition => (
        <label
          key={edition.id}
          className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer"
        >
          <Checkbox
            checked={formData.edition_ids.includes(edition.id)}
            onCheckedChange={() => handleEditionToggle(edition.id)}
          />
          <span className="text-sm">{edition.name} ({edition.city})</span>
        </label>
      ))}
    </ScrollArea>
  </Card>
  
  {/* Selected editions as badges */}
  {formData.edition_ids.length > 0 && (
    <div className="flex flex-wrap gap-1 mt-2">
      {formData.edition_ids.map(id => {
        const edition = editions.find(e => e.id === id);
        return edition ? (
          <Badge key={id} variant="secondary" className="gap-1 text-xs">
            {edition.name}
            <X 
              className="w-3 h-3 cursor-pointer" 
              onClick={() => handleEditionToggle(id)} 
            />
          </Badge>
        ) : null;
      })}
    </div>
  )}
  
  {formData.edition_ids.length === 0 && (
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      <Check className="w-3 h-3 text-green-500" />
      Will show for all editions
    </p>
  )}
</div>
```

---

### 3. Frontend Filtering (`RoadmapSidebar.tsx`)

Update the stay locations query to use the junction table:

```tsx
// Fetch edition mappings for current edition
const { data: stayLocationEditions } = useQuery({
  queryKey: ['stay-location-editions', editionId],
  queryFn: async () => {
    const { data } = await supabase
      .from('stay_location_editions')
      .select('stay_location_id')
      .eq('edition_id', editionId);
    return data?.map(d => d.stay_location_id) || [];
  }
});

// Fetch all mappings to identify global items
const { data: allMappings } = useQuery({
  queryKey: ['stay-location-editions-all'],
  queryFn: async () => {
    const { data } = await supabase
      .from('stay_location_editions')
      .select('stay_location_id');
    return [...new Set(data?.map(d => d.stay_location_id) || [])];
  }
});

// Filter: show edition-specific + global (no mappings)
const filteredLocations = stayLocations.filter(loc => 
  stayLocationEditions?.includes(loc.id) || 
  !allMappings?.includes(loc.id)
);
```

---

## Files to Modify

| File | Change |
|------|--------|
| **Database** | Create `stay_location_editions` junction table, migrate data, drop `edition_id` column |
| `src/pages/admin/AdminStayLocations.tsx` | Replace single Select with checkbox list, update mutations for junction table |
| `src/components/roadmap/RoadmapSidebar.tsx` | Update query to filter by junction table |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |

---

## Quick Fix: See Current Changes

If you're not seeing the upload tabs and single address field, try:
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache** for the site
3. The changes are already in the code - just need the browser to load them


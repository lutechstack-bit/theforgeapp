

## Updated Plan: Bidirectional Task Sync + Popup Modal + Cohort-Specific Stages

### New Requirement: FORGE_WRITING Has No Online Forge Stage

The Writing cohort has a **5-stage journey** instead of 6:

| Stage | FORGE (Filmmakers) | FORGE_WRITING (Writers) | FORGE_CREATORS |
|-------|-------------------|------------------------|----------------|
| 1 | Pre-Registration | Pre-Registration | Pre-Registration |
| 2 | Pre-Travel | Pre-Travel | Pre-Travel |
| 3 | Final Prep | Final Prep | Final Prep |
| 4 | Online Forge (Days 1-3) | **SKIPPED** | Online Forge |
| 5 | Physical Forge (Day 4+) | Physical Forge (Day 1+) | Physical Forge |
| 6 | Post Forge | Post Forge | Post Forge |

---

### Part 1: Cohort-Aware Stage Detection

Update `useStudentJourney.ts` to skip Online Forge for Writers:

```typescript
const getCurrentStage = (): string => {
  if (!edition?.forge_start_date || !edition?.forge_end_date) {
    return 'pre_registration';
  }

  const now = new Date();
  const forgeStart = new Date(edition.forge_start_date);
  const forgeEnd = new Date(edition.forge_end_date);
  const daysUntilStart = differenceInDays(forgeStart, now);
  const daysSinceStart = differenceInDays(now, forgeStart);

  if (now > forgeEnd) return 'post_forge';
  
  // Writers go directly to physical_forge (no online stage)
  if (cohortType === 'FORGE_WRITING') {
    if (daysSinceStart >= 0) return 'physical_forge';
  } else {
    // FORGE and FORGE_CREATORS have online forge for first 3 days
    if (daysSinceStart >= 3) return 'physical_forge';
    if (daysSinceStart >= 0) return 'online_forge';
  }
  
  if (daysUntilStart <= 15) return 'final_prep';
  if (daysUntilStart <= 30) return 'pre_travel';
  return 'pre_registration';
};
```

Update stages filtering to exclude Online Forge for Writers:

```typescript
// Filter out online_forge stage for Writers
const filteredStages = stages?.filter(stage => {
  if (cohortType === 'FORGE_WRITING' && stage.stage_key === 'online_forge') {
    return false;
  }
  return true;
}) || [];
```

---

### Part 2: Database Migration

Add `linked_prep_category` column and create `user_task_preferences` table:

```sql
-- Add linked_prep_category to journey_tasks
ALTER TABLE journey_tasks 
ADD COLUMN linked_prep_category TEXT DEFAULT NULL;

-- Update existing tasks with their category links
UPDATE journey_tasks 
SET linked_prep_category = 'packing' 
WHERE title ILIKE '%pack your bags%';

UPDATE journey_tasks 
SET linked_prep_category = 'script_prep' 
WHERE title ILIKE '%script/content prep%' 
AND 'FORGE' = ANY(cohort_types)
AND NOT 'FORGE_WRITING' = ANY(cohort_types);

UPDATE journey_tasks 
SET linked_prep_category = 'writing_prep' 
WHERE title ILIKE '%script/content prep%' 
AND 'FORGE_WRITING' = ANY(cohort_types);

UPDATE journey_tasks 
SET linked_prep_category = 'content_prep' 
WHERE title ILIKE '%script/content prep%' 
AND 'FORGE_CREATORS' = ANY(cohort_types)
AND NOT 'FORGE' = ANY(cohort_types);
```

---

### Part 3: Bidirectional Sync Logic

**Hook updates (`useStudentJourney.ts`):**

1. Add queries to fetch prep progress and items
2. Add `isPrepCategoryComplete(category)` function
3. Add `getPrepCategoryProgress(category)` function  
4. Update `toggleTask` mutation to sync with prep tables

**Sync flow:**

```text
User ticks "Pack your bags" on sticky note
         ↓
Check if task has linked_prep_category = 'packing'
         ↓
If completing: Mark ALL packing items in user_prep_progress as done
If uncompleting: Remove ALL packing items from user_prep_progress
         ↓
Invalidate both query caches
         ↓
Both Hero sticky notes AND Prep checklist show updated state
```

---

### Part 4: Sticky Note Detail Modal

Create `StickyNoteDetailModal.tsx` - opens when clicking any sticky note:

```text
+----------------------------------------------------------+
|                                                    [X]   |
|     FINAL PREP                          Stage 3 of 5     |
|     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 3/5 complete        |
+----------------------------------------------------------+
|                                                          |
|  [✓] Complete your writing prep                  [Go →]  |
|      ━━━━━━━━━━━━ 3/3 items • Auto-synced               |
|                                                          |
|  [✓] Review Day 0 arrival instructions           [Go →]  |
|      Check the roadmap for your schedule                 |
|                                                          |
|  [ ] Note emergency contacts                             |
|      Save important numbers to your phone                |
|                                                          |
|  [ ] Download offline content                    [Go →]  |
|      Access materials without WiFi                       |
|                                                          |
|  [ ] Pack your bags using checklist              [Go →]  |
|      ━━━░░░░░░░░░░░ 12/45 items                         |
|                                                          |
+----------------------------------------------------------+
|         [  View Full Prep Checklist  ]                   |
+----------------------------------------------------------+
```

**Features:**
- All tasks can be ticked directly in the modal
- Prep-linked tasks show inline progress bars
- Deep link buttons for navigation
- Ticking syncs to both tables

---

### Part 5: Component Wiring

**JourneyBentoHero.tsx changes:**
- Add modal state (`selectedStage`, `isModalOpen`)
- Pass `onClick` handler to each `StickyNoteCard`
- Render `StickyNoteDetailModal` when open
- Use filtered stages that exclude Online Forge for Writers

**StickyNoteCard.tsx changes:**
- Ensure `onClick` prop is connected and clickable

**StageNavigationStrip.tsx changes:**
- Accept filtered stages (5 for Writers, 6 for others)
- Adjust dot rendering accordingly

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/journey/StickyNoteDetailModal.tsx` | Full-screen popup for stage task details with sync controls |

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useStudentJourney.ts` | Cohort-aware stage detection, prep progress queries, bidirectional sync mutation, stage filtering for Writers |
| `src/components/journey/JourneyBentoHero.tsx` | Modal state, onClick handlers, filtered stages, render modal |
| `src/components/journey/StageNavigationStrip.tsx` | Accept dynamic stage count (5 or 6) |
| `src/components/journey/index.ts` | Export new modal component |
| Database migration | Add `linked_prep_category` column, update task mappings |

---

### User Experience Summary

**For FORGE_WRITING students:**
1. See 5-stage journey (no Online Forge)
2. On Day 1 of Forge, jump directly to Physical Forge stage
3. All other features work identically

**For all cohorts:**
1. Click any sticky note → Opens detail modal
2. Tick any task in modal → Saved to database
3. If task has prep link → All items in that category sync
4. Visit `/roadmap/prep` → See synced checkboxes
5. Complete prep items individually → Journey task auto-completes when all done




# Final Implementation Plan: Dynamic City Labels + New Editions + Data Fixes

## Part 1: Code Changes — Make Bootcamp Toggle Dynamic

### 1a. `src/pages/roadmap/RoadmapJourney.tsx`
- Destructure `edition` from `useRoadmapData()` (already returned by the hook)
- Replace all 3 hardcoded "Goa" references with `edition?.city || 'Goa'`:
  - Line 184: `` `${bootcampCount} days in ${edition?.city || 'Goa'}` ``
  - Line 191: same pattern
  - Line 234: `` `${edition?.city || 'Goa'} Bootcamp` ``

### 1b. `src/components/home/HomeJourneySection.tsx`
- Destructure `edition` from `useRoadmapData()` (already used in this component)
- Replace all 2 hardcoded "Goa" references:
  - Line 206: `` `${bootcampCount} days in ${edition?.city || 'Goa'}` ``
  - Line 250: `` `${edition?.city || 'Goa'} Bootcamp` ``

---

## Part 2: Data Operations — Fix Journey Tasks for Writers

Update 2 journey tasks to remove `FORGE_WRITING` from their `cohort_types` (Writers have no online sessions):

| Task | ID | New cohort_types |
|------|----|-----------------|
| Attend Day 1 online session | `3d15305b-...` | `{FORGE, FORGE_CREATORS}` |
| Pick your slot/team | `a30252ca-...` | `{FORGE, FORGE_CREATORS}` |

---

## Part 3: Data Operations — Create 6 New Editions

Insert into `editions` table:

| Name | cohort_type | City | forge_start_date | forge_end_date |
|------|-------------|------|-----------------|----------------|
| Forge Writing - Edition 5 - Dehradun | FORGE_WRITING | Dehradun | 2026-03-07 | 2026-03-12 |
| Forge Filmmaking - Edition 16 - Goa | FORGE | Goa | 2026-04-25 | 2026-05-02 |
| Forge Filmmaking - Edition 17 - Goa | FORGE | Goa | 2026-04-27 | 2026-05-04 |
| Forge Creators - Edition 5 - Goa | FORGE_CREATORS | Goa | 2026-05-04 | 2026-05-10 |
| Forge Creators - Edition 6 - Goa | FORGE_CREATORS | Goa | 2026-05-10 | 2026-05-16 |
| Forge Creators - Edition 7 - Bali | FORGE_CREATORS | Bali | 2026-06-01 | 2026-06-07 |

The `create_cohort_group_for_edition` trigger auto-creates cohort groups.

---

## Part 4: Data Operations — Clone Roadmap Templates

For each new edition, clone all `roadmap_days` rows from the master template of the same cohort type:

- **Writing Ed 5 Dehradun** ← Clone 7 days from Writing Ed 5 Goa (`cf2b9fd2-...`, days 0-6)
- **Filmmaking Ed 16 & 17** ← Clone 15 days each from Filmmaking Ed 15 (`ec048e00-...`, days -7 to 8)
- **Creators Ed 5, 6, 7** ← Clone 13 days each from Creators Ed 3 (`2fd72d93-...`, days -6 to 6)

All cloned rows get: new UUID, new `edition_id`, `date = NULL`, `is_active = false`. Total: ~72 rows.

For Creators Ed 7 (Bali), the template already has Bali-specific content (e.g., "Cretya Ubud", "Nuanu") since it was built from the Bali brochure.

For Goa editions of Creators (Ed 5 & 6), location-specific content like "Cretya Ubud" will need admin review later — the template is cloned as-is from the Bali-based Ed 3.

---

## Part 5: Data Operations — Bali-Specific Prep Items

Insert 3 packing items into `prep_checklist_items` for FORGE_CREATORS with the Bali edition ID:
- Passport (valid 6+ months)
- Visa on Arrival / e-VOA
- Digital Arrival Card (SATUSEHAT)

---

## Summary of Changes

- **2 files edited** (RoadmapJourney.tsx, HomeJourneySection.tsx) — dynamic city in toggle/heading
- **2 journey_tasks updated** — remove FORGE_WRITING from online-only tasks
- **6 editions inserted** — new upcoming cohorts
- **~72 roadmap_days cloned** — template content for each new edition
- **3 prep items inserted** — Bali passport/visa items
- **No schema changes needed**


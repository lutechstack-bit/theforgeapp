

# Smart Announcement Center + Personal User Sticky Note

## Architecture Clarification - No Impact on Existing Sticky Notes

The new features are **completely independent** from your existing journey sticky notes:

| Component | Purpose | Impact on StickyNoteCard |
|-----------|---------|--------------------------|
| `AnnouncementBanner.tsx` | NEW - Hero notification banner | None - separate component |
| `PersonalNoteCard.tsx` | NEW - User's personal memo | None - separate component |
| `StickyNoteCard.tsx` | EXISTING - Journey stage cards | **Unchanged** |

The `StickyNoteCard` component with its distinct colored borders (yellow, emerald, orange, blue, gold, purple) remains exactly as-is.

---

## Feature 1: Announcement Banner (Admin + Smart Triggers)

### Three Announcement Sources

1. **Manual Admin Announcements**
   - Created via new Admin panel section
   - Marked as `is_hero_announcement: true`
   - Full control over message, icon, link, expiry

2. **Smart Automatic Triggers**
   - Computed client-side based on user state
   - Examples:
     - KYF deadline approaching
     - Forge countdown milestones (7, 3, 1, 0 days)
     - Stage transition welcome
     - Streak celebrations (7, 14, 30 days)

3. **Admin-Configurable Trigger Rules**
   - Enable/disable specific triggers
   - Customize message templates
   - Set timing parameters

### Visual Design

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  📋  Complete your KYF form before Jan 30! →                       ✕   │
└─────────────────────────────────────────────────────────────────────────┘
     ↑ Gold glass banner (bg-primary/10, border-primary/30)
```

### Features
- Auto-cycles through multiple announcements (5s)
- Dismissible (stored in localStorage)
- Click navigates to deep_link
- Priority ordering: Pinned > Urgent > Stage-specific > General

---

## Feature 2: Personal User Sticky Note

A small, editable memo card for users - **completely separate** from journey sticky notes.

### Visual Design

```text
┌────────────────────────────────────┐
│  📝 My Notes               [Edit] │
│  ─────────────────────────────────│
│  "Remember to pack charger        │
│   and download Day 0 video"       │
│                                   │
│  Updated 2 hours ago              │
└────────────────────────────────────┘
     ↑ Rose accent border (#F43F5E)
```

### Features
- Inline editing (click to edit)
- Auto-save (debounced 500ms)
- 200 character limit
- Syncs across devices
- Rose color distinguishes from journey sticky notes

---

## Database Changes

### New Table: `user_notes`

```sql
CREATE TABLE public.user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes"
  ON public.user_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### New Table: `announcement_triggers`

```sql
CREATE TABLE public.announcement_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT,
  deep_link TEXT,
  icon_emoji TEXT DEFAULT '📢',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.announcement_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view triggers"
  ON public.announcement_triggers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage triggers"
  ON public.announcement_triggers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
```

### Modify: `notifications` Table

```sql
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS is_hero_announcement BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_style TEXT DEFAULT 'card',
  ADD COLUMN IF NOT EXISTS icon_emoji TEXT DEFAULT '📢',
  ADD COLUMN IF NOT EXISTS target_stage TEXT;
```

---

## New Files

| File | Purpose |
|------|---------|
| `src/components/journey/AnnouncementBanner.tsx` | Hero notification banner |
| `src/components/journey/PersonalNoteCard.tsx` | User's personal memo card |
| `src/hooks/useSmartAnnouncements.ts` | Compute smart triggers client-side |
| `src/hooks/usePersonalNote.ts` | User note CRUD operations |
| `src/pages/admin/AdminAnnouncements.tsx` | Admin page for announcements + triggers |

## Modified Files

| File | Change |
|------|--------|
| `src/components/journey/JourneyBentoHero.tsx` | Integrate AnnouncementBanner + PersonalNoteCard |
| `src/components/journey/index.ts` | Export new components |
| `src/components/admin/AdminLayout.tsx` | Add Announcements nav item |

## Files NOT Modified

| File | Status |
|------|--------|
| `src/components/journey/StickyNoteCard.tsx` | **Unchanged** - journey stage cards stay as-is |
| `src/components/journey/StickyNoteCardStack.tsx` | **Unchanged** |
| `src/components/journey/StickyNoteDetailModal.tsx` | **Unchanged** |

---

## Hero Section Layout

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  Good morning, Prashanth! 👋                   🔥 7-day streak         │
│  14 days until Forge                                    Stage 3 of 6    │
├─────────────────────────────────────────────────────────────────────────┤
│  📋  Complete your KYF form before Jan 30 →                        ✕   │  ← NEW: AnnouncementBanner
├─────────────────────────────────────────────────────────────────────────┤
│  [Stage Navigation Strip: ✓1 ✓2 ●3 ○4 ○5 ○6]                            │
├───────────────────────────────────────────────┬─────────────────────────┤
│                                               │                         │
│  ┌─ CURRENT: Final Prep ─────────┐            │  ┌─ 📝 My Notes ───────┐│  ← NEW: PersonalNoteCard
│  │  [Orange border - UNCHANGED]  │            │  │  [Rose border]      ││
│  │  3/5 tasks                    │            │  │  "Pack camera..."   ││
│  │  [✓] Review Day 0 arrival     │            │  └─────────────────────┘│
│  │  [ ] Download offline content │            │                         │
│  └───────────────────────────────┘            │  ┌─ Pre-Travel ────────┐│
│                                               │  │  [Emerald border]   ││
│  EXISTING STICKY NOTES UNCHANGED              │  │  ✓ 6/6 complete     ││
│                                               │  └─────────────────────┘│
└───────────────────────────────────────────────┴─────────────────────────┘
```

---

## Smart Trigger Types (Pre-configured)

| Trigger | Template | Config |
|---------|----------|--------|
| `kyf_deadline` | "📋 KYF deadline in {days} days!" | days_before: [3, 2, 1] |
| `forge_countdown` | "⏰ {days} days until Forge!" | days: [14, 7, 3, 1, 0] |
| `stage_entry` | "🎯 Welcome to {stage}!" | all_stages: true |
| `streak_milestone` | "🔥 {days}-day streak!" | days: [3, 7, 14, 30] |
| `event_reminder` | "🎬 {event} in {hours} hours" | hours_before: [24, 2] |

---

## Summary

- **Existing journey sticky notes**: Completely unchanged
- **AnnouncementBanner**: New gold-accented banner for notifications
- **PersonalNoteCard**: New rose-accented card for user memos
- **Admin control**: Full management of manual + automatic announcements
- **Smart triggers**: System-generated based on user journey state


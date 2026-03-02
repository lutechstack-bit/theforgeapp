

# Fix: Show Day 1 Content by Default Instead of Static Pre-Forge Card

## Problem
The `HomeJourneySection` auto-selects the "current" day from **all** roadmap days. In PRE_FORGE mode, `day_number === 0` is marked "current" by `getDayStatus`. But day 0 isn't in either tab (online = `day_number < 0`, bootcamp = `day_number > 0`), so the pills show days 1-6 but the card below shows the static "Pre-Forge Preparation" content. This affects Writing and Creators cohorts. Filmmaking works because it has online sessions (negative day numbers) that get selected first.

## Fix — `src/components/home/HomeJourneySection.tsx`

Two changes to the auto-select logic:

**1. Initial auto-select (lines 78-83):** Instead of searching all `roadmapDays` for a "current" day, search within the **active tab's days** only. This prevents day 0 from being selected.

```typescript
useEffect(() => {
  if (!roadmapDays || selectedDayId) return;
  const days = activeTab === 'online' ? onlineSessions : bootcampDays;
  const currentDay = days.find(d => getDayStatus(d) === 'current');
  if (currentDay) setSelectedDayId(currentDay.id);
  else if (days.length > 0) setSelectedDayId(days[0].id);
}, [roadmapDays, getDayStatus, selectedDayId, activeTab, onlineSessions, bootcampDays]);
```

**2. Tab-change effect (lines 86-89):** Also prefer the "current" day within the new tab, not just the first day.

```typescript
useEffect(() => {
  const days = activeTab === 'online' ? onlineSessions : bootcampDays;
  const currentDay = days.find(d => getDayStatus(d) === 'current');
  if (currentDay) setSelectedDayId(currentDay.id);
  else if (days.length > 0) setSelectedDayId(days[0].id);
}, [activeTab]);
```

This ensures:
- Writing (no online sessions) → auto-selects to bootcamp tab → shows Day 1 content
- Creators → same behavior
- Filmmaking → has online sessions → shows current online session or Day 1
- During forge → shows the actual current day
- All three cohorts show real day content immediately, not the pre-forge placeholder

**One file changed, two small edits. No database changes.**


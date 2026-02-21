

# Add Segmented Control Toggle -- Cohort-Aware (No Icons)

## Goal
Add an iOS-style segmented control to toggle between "Online Sessions" and "Goa Bootcamp" in the HomeJourneySection, without any icons in the toggle labels.

## Changes in `src/components/home/HomeJourneySection.tsx`

### 1. Add `activeTab` state
- Type: `'online' | 'bootcamp'`
- Default: `'online'` if online sessions exist, otherwise `'bootcamp'`
- When tab switches, auto-select the first day of that tab

### 2. Segmented Control UI
Rendered only when both `onlineSessions.length > 0` AND `bootcampDays.length > 0`:

```text
+------------------------------------------+
|  [ Online Sessions ]  [ Goa Bootcamp ]   |
+------------------------------------------+
```

- Container: `bg-muted rounded-full p-1 flex`
- Active segment: `bg-background text-foreground shadow-sm rounded-full font-medium`
- Inactive segment: `text-muted-foreground`
- Text-only labels, no icons
- Smooth transition via `transition-all duration-200`

### 3. Conditional rendering
- If toggle visible: show only the active tab's date range subtitle and DatePillSelector
- If toggle hidden (Writers cohort or only one type): show the available section directly without toggle
- Remove the per-section sub-headers (Camera/MapPin icon + label rows) since the toggle replaces them

### 4. Tab switch resets selection
When `activeTab` changes, `selectedDayId` is set to the first day in that tab's list.

## Cohort Behavior

| Cohort | Online Sessions | Toggle Visible | Default Tab |
|--------|----------------|----------------|-------------|
| Filmmakers | 3 | Yes | Online |
| Creators | 6 | Yes | Online |
| Writers | 0 | No | Bootcamp |

## Files Modified

| File | Change |
|------|--------|
| `src/components/home/HomeJourneySection.tsx` | Add activeTab state, segmented control (text-only, no icons), conditional rendering, remove Camera/MapPin sub-headers |




# Fix Calendar Styling + Proficiency Grid Overflow

## Issues

1. **Calendar white blocks**: The `captionLayout="dropdown-buttons"` renders native `<select>` elements for month/year which appear as white blocks on the dark theme. Need to style these dropdowns or replace with custom dark-themed selectors.

2. **Proficiency grid overflow**: The grid's `min-w-[380px]` combined with the container `max-w-lg` (512px) minus padding leaves insufficient space. Skill labels like "Screenwriting" and "Cinematography" get clipped, and a horizontal scrollbar appears. The fix is to remove the min-width constraint, reduce the skill column size, use abbreviated level headers on mobile, and widen the form container.

## Changes

### 1. Calendar.tsx -- Style the dropdown selects for dark theme

Add `classNames` overrides for the `caption_dropdowns`, `dropdown_month`, `dropdown_year`, and `dropdown` classes used by react-day-picker when `captionLayout="dropdown-buttons"` is set. These need dark backgrounds, gold text, and proper border styling instead of the default white browser selects.

Add these classNames:
```
caption_dropdowns: "flex items-center gap-2"
dropdown_month: "relative"
dropdown_year: "relative"  
dropdown: "appearance-none bg-card border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-forge-gold/50 cursor-pointer"
```

Also hide the default `caption_label` when dropdowns are active since both show simultaneously (causing the duplicate "February 2026" + dropdown display).

### 2. ProficiencyGrid.tsx -- Fix overflow and spacing

- Remove `min-w-[380px]` from both header and skill rows (this forces horizontal scroll)
- Change grid template to use smaller skill column: `minmax(80px, 1fr) repeat(N, 1fr)` so columns share space equally
- Use shorter level labels on mobile via abbreviations: display "BEG" / "AMA" / "OK" / "GOOD" / "PRO" on small screens (or just make text smaller at `text-[9px]`)
- Reduce radio button cell padding: `p-2 md:p-3` to fit within the container
- Make radio buttons slightly smaller on mobile: `w-6 h-6 md:w-7 md:h-7`

### 3. KYSectionForm.tsx -- Widen form container

Change `max-w-lg` (512px) to `max-w-xl` (576px) for the card stack area to give the proficiency grid more room. This small increase helps all form content breathe better.

## Files Changed

| File | Change |
|------|--------|
| `src/components/ui/calendar.tsx` | Add dark-themed dropdown classNames for month/year selectors, hide duplicate caption_label |
| `src/components/onboarding/ProficiencyGrid.tsx` | Remove min-width, adjust grid columns, reduce padding, smaller mobile buttons |
| `src/pages/KYSectionForm.tsx` | Widen card container from `max-w-lg` to `max-w-xl` |

## Technical Notes
- The `captionLayout="dropdown-buttons"` prop in react-day-picker v8 uses native `<select>` elements that need CSS overrides via `classNames`
- The `caption_label` class needs `hidden` when dropdowns are shown to prevent the duplicate month/year text
- No database or config changes needed

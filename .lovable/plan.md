

# Simplify Homepage: Clean Amber Borders + Refreshed Section Headers

## Two changes

### 1. Replace gradient glow wrappers with a simple static amber border

Every homepage card currently has a heavy nested gradient wrapper (`p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 ... hover:shadow-[0_0_20px...]`). Replace all of these with a single `border border-[#FFBF00]/20` on the card container itself. No hover effect, no gradient, no shadow, no extra wrapper div.

**Files affected:**

| File | What changes |
|---|---|
| `TodaysFocusCard.tsx` (lines 23-24, 64-65) | Remove outer glow div, add `border border-[#FFBF00]/20` to inner div, restore `rounded-2xl` |
| `KYProfileCard.tsx` (lines 32-33, 109-110) | Remove outer glow div, add `border border-[#FFBF00]/20` to inner div, restore `rounded-2xl` |
| `SessionDetailCard.tsx` (lines 30-31, 124-125) | Remove outer glow div, add `border border-[#FFBF00]/20` to inner div, restore `rounded-2xl` |
| `TravelStaySection.tsx` (lines 87-88, 170-171) | Remove outer glow div, add `border border-[#FFBF00]/20` to inner div, restore `rounded-2xl` |
| `BatchmatesSection.tsx` (lines 102-103, 142-143) | Remove outer glow div, add `border border-[#FFBF00]/20` to inner div, restore `rounded-2xl` |
| `AlumniShowcaseSection.tsx` (lines 51, 72-76, 81, 113) | Remove glow wrappers from film cards. Add `border border-[#FFBF00]/20` to the outer section card. Restore `rounded-2xl` on inner elements. |

---

### 2. Clean up section headers — remove generic lucide icon boxes, use the Forge icon instead

Currently each section header uses different lucide icons in rounded boxes (`Users`, `Film`, `MapPin`) which look generic and repetitive. Instead, use a small Forge brand icon (`src/assets/forge-icon.png`) as a subtle section marker — a tiny 16-20px logo mark next to the title text, no background box.

This approach is inspired by the reference sites where the Level Up / Forge branding is used as a subtle visual anchor rather than generic stock icons.

**Header pattern — before vs after:**

```text
BEFORE (Batchmates):              AFTER (all sections):
┌────────┐                        [forge-icon] Your Batchmates    View All >
│ Users  │ ┃ Your Batchmates
│  icon  │ ┃
└────────┘

BEFORE (Alumni):                  AFTER:
🎬 Alumni Showcase  View all >    [forge-icon] Alumni Showcase    View all >

BEFORE (Travel):                  AFTER:
📍 Travel & Stay    Details >     [forge-icon] Travel & Stay      Details >
```

The Forge icon is a small brand mark (the existing `forge-icon.png` asset) rendered at 16x16 or 18x18px with `opacity-60`. No colored background boxes, no rounded containers, no left-border accents. Just: icon + bold title + optional subtitle below.

**Files affected for header changes:**

| File | What changes |
|---|---|
| `BatchmatesSection.tsx` (lines 76-89) | Remove the icon box div (`<div className="p-2 rounded-lg bg-primary/15 ..."><Users ...>`), remove `border-l-3 border-primary pl-3`. Replace with `<img src={forgeIcon} className="w-4 h-4 opacity-60" />` + clean `text-lg font-bold` title. |
| `AlumniShowcaseSection.tsx` (lines 53-56) | Remove inline `<Film>` icon. Replace with `<img src={forgeIcon} className="w-4 h-4 opacity-60" />` before title text. |
| `TravelStaySection.tsx` (lines 90-94) | Remove inline `<MapPin>` icon. Replace with `<img src={forgeIcon} className="w-4 h-4 opacity-60" />` before title text. |
| `HomeJourneySection.tsx` (lines 216-221) | Already clean text-only header. Add the same small Forge icon before the title for consistency. |

**Not changed:** `TodaysFocusCard` (it's a special priority card with badge pills, not a standard section), `KYProfileCard` (self-contained onboarding card), `CompactCountdownTimer` (special widget).

---

## Summary

- 6 files for border simplification
- 4 files for header cleanup
- Total: ~7 unique files modified (some overlap)
- No color palette changes, no font changes, no layout restructuring


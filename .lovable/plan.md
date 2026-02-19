

# Make "Understanding You" Fit in One Card (No Scroll)

## Goal
Match the wireframe exactly: all 4 fields (tags, MBTI, chronotype, intent) on a single card without scrolling. The current layout overflows because components use too much vertical space.

## Root Cause
The card overflows because:
1. **TagInput** has `min-h-[80px]` and generous padding even when empty
2. **MBTI grid** buttons use `py-1.5` + `gap-1.5` -- slightly too tall
3. **Chronotype** renders as small radio pills instead of the wireframe's larger emoji buttons (like the meal-preference style shown: sunrise emoji "Early bird" / moon emoji "Night owl")
4. **Forge intent** renders as a 2-column grid of bordered cards instead of compact inline wrap pills
5. Step header (`title` + `subtitle` + gold line) adds ~50px overhead

## Changes

### 1. `src/components/kyform/KYSectionConfig.ts`
- Change `chronotype` field type from `radio` to a new `chronotype` type (to render the emoji-style buttons from the wireframe)
- Change `forge_intent` field type from `radio` to a new `pill-select` type (compact horizontal wrap pills without borders, matching the wireframe)
- Remove `columns: 2` from both fields since they'll use custom renderers

### 2. `src/components/kyform/KYSectionFields.tsx`
Add two new compact renderers:

**`chronotype` renderer**: Two side-by-side buttons with emojis, matching the wireframe:
- Sunrise emoji + "Early bird" (left)
- Moon emoji + "Night owl" (right)
- Uses the same 2-column grid as meal-preference but with horizontal layout (icon + text side-by-side, not stacked)

**`pill-select` renderer**: Compact horizontal wrap pills:
- `flex flex-wrap gap-2` layout
- Small rounded-full pills (`px-4 py-1.5 rounded-full`)
- No descriptions, just labels
- Matches the wireframe's "Make a film", "Learn", "Find crew", "Portfolio" style

### 3. `src/components/onboarding/TagInput.tsx`
- Reduce `min-h-[80px]` to `min-h-[56px]` to save vertical space when empty
- Reduce padding from `p-3` to `p-2.5`

### 4. `src/components/kyform/KYSectionFields.tsx` (MBTI grid)
- Reduce MBTI button padding from `py-1.5` to `py-1` and grid gap from `gap-1.5` to `gap-1`

### 5. `src/components/kyform/KYSectionConfig.ts` (type update)
Add `chronotype` and `pill-select` to the `SectionStepField` type union.

## Updated Field Type Union
```
'text' | 'date' | ... | 'mbti' | 'chronotype' | 'pill-select' | 'country-state'
```

## Visual Result (matching wireframe)
```text
+----------------------------------+
| Understanding You                |
| To assign you to compatible...   |
| ________________________________ |
|                                  |
| Your top 3 movies *        0/3  |
| [Type movie name and press Enter]|
|                                  |
| Your MBTI *                      |
| [ISTJ][ISFJ][INFJ][INTJ]       |
| [ISTP][ISFP][INFP][INTP]       |
| [ESTP][ESFP][ENFP][ENTP]       |
| [ESTJ][ESFJ][ENFJ][ENTJ]       |
|                                  |
| You are *                        |
| [sunrise Early bird][moon Night owl]|
|                                  |
| What brings you here? *          |
| (Make a film)(Learn)(Find crew)  |
| (Portfolio)                      |
+----------------------------------+
```

## Files Modified

| File | Change |
|------|--------|
| `src/components/kyform/KYSectionConfig.ts` | Change chronotype type to `chronotype`, forge_intent type to `pill-select`; update type union |
| `src/components/kyform/KYSectionFields.tsx` | Add `chronotype` and `pill-select` renderers; make MBTI grid more compact |
| `src/components/onboarding/TagInput.tsx` | Reduce min-height and padding |

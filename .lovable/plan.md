

# Fix Hidden Fields: Split "Understanding You" Into Two Steps

## Problem
The "Understanding You" step has too much content for one card: tags input + 16-button MBTI grid + chronotype + forge_intent. The card hides its scrollbar (`hide-scrollbar` CSS), so on desktop users literally cannot scroll to reach "You are" and "What brings you here?" -- those fields are completely inaccessible.

## Solution
Split into two smaller steps so every field is visible without scrolling.

### Step 1: "Favorites & Personality"
- Your Top 3 Movies/Creators/Writers (tags input)
- Your MBTI (4x4 grid)

### Step 2: "Your Vibe"
- You are (chronotype -- 2 emoji buttons)
- What brings you here? (pill-select)

## Changes

### `src/components/kyform/KYSectionConfig.ts`

For all 3 cohorts (KYF, KYC, KYW), replace the single `understanding_you` step with two steps:

```
{
  key: 'favorites_personality',
  title: 'Favorites & Personality',
  subtitle: 'To assign you to compatible groups',
  fields: [
    // tags input (top_3_movies / top_3_creators / top_3_writers_books)
    // mbti_type
  ],
},
{
  key: 'your_vibe',
  title: 'Your Vibe',
  subtitle: 'One last thing about you',
  fields: [
    // chronotype (emoji buttons)
    // forge_intent (pill-select)
  ],
}
```

**Result per cohort profile section:**
- Before: 4 steps (general, address, proficiency, understanding_you)
- After: 5 steps (general, address, proficiency, favorites_personality, your_vibe)

Progress bars and navigation update automatically.

## File Modified

| File | Change |
|------|--------|
| `src/components/kyform/KYSectionConfig.ts` | Split understanding_you into favorites_personality + your_vibe for all 3 cohorts |

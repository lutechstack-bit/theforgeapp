

# Merge "Your Vibe" into "Favorites & Personality" for All Cohorts

## What Changes

Remove the separate "Your Vibe" step from all three cohorts (KYF, KYC, KYW) and merge its fields into the preceding "Favorites & Personality" step, creating a single combined final step titled **"Understanding You"** that matches the reference wireframe.

## Reference Layout (Second Image)

The final step should show all these fields in one card:
1. **Top 3 movies/creators/writers** (tags input)
2. **Your MBTI** (4x4 pill grid)
3. **You are** (2 compact horizontal pills: Early bird / Night owl)
4. **What brings you here?** (compact horizontal wrap pills)

## Changes to `src/components/kyform/KYSectionConfig.ts`

### For all 3 cohorts (KYF lines 188-206, KYC lines 363-381, KYW lines 485-503):

**Delete** the `your_vibe` step entirely and **merge** its fields into the `favorites_personality` step. Rename the combined step:

- **key**: `understanding_you`
- **title**: "Understanding You"
- **subtitle**: "To assign you to compatible groups"

**Fields in the merged step (in order):**
1. `top_3_movies` / `top_3_creators` / `top_3_writers_books` (tags, maxItems: 3)
2. `mbti_type` (mbti grid)
3. `chronotype` (radio, columns: 2) -- simplified to 2 options: Early bird and Night owl (remove "Somewhere in between")
4. `forge_intent` (radio) -- keep cohort-specific options but remove `forge_intent_other` text field to save space

**Simplify chronotype options** (shared across all cohorts):
- From 3 options with descriptions to 2 compact options: `{ value: 'early_bird', label: 'Early bird' }` and `{ value: 'night_owl', label: 'Night owl' }`
- Use `columns: 2` for side-by-side layout

**Simplify forge_intent options** per cohort:
- KYF: Keep top 4 (Make a film, Learn, Find crew, Portfolio) -- remove verbose labels, drop "Other"
- KYC: Keep top 4 similarly
- KYW: Keep top 4 similarly

**Remove** `forge_intent_other` field from all cohorts (no longer needed without "Other" option).

### Net result per cohort profile section:
- **Before**: 5 steps (general, address, proficiency, favorites_personality, your_vibe)
- **After**: 4 steps (general, address, proficiency, understanding_you)

## Files Modified

| File | Change |
|------|--------|
| `src/components/kyform/KYSectionConfig.ts` | Merge your_vibe into favorites_personality for KYF, KYC, KYW; simplify chronotype to 2 options; remove forge_intent_other |


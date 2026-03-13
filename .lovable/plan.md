
Goal: Make KY forms behave like KYF “fit-in-screen” experience at your current viewport (789×593), so users don’t need to scroll to reach required questions.

What I found from code + screenshots
- Your screenshot is already the new `/ky-section/:sectionKey` flow.
- The overflow is mainly from KYC “General Details”:
  - `current_status` is still rendering as a 1-column radio stack (4 tall rows).
  - In this viewport, card + top bar + bottom CTA leaves too little vertical room, so content overflows.
- Proficiency grid is already correctly configured for KYC/KYW.

Implementation plan

1) Fix KYC step density first (primary blocker)
- File: `src/components/kyform/KYSectionConfig.ts`
- Change `current_status` to compact two-column layout (`columns: 2`).
- Split KYC `general_details` into two smaller steps so each screen fits without scroll:
  - Step A: name + current status
  - Step B: instagram + date of birth
- Keep data keys unchanged (only step grouping changes), so persistence remains compatible.

2) Add viewport-fit compact mode for all cohorts
- Files:
  - `src/pages/KYSectionForm.tsx`
  - `src/components/kyform/KYFormCard.tsx`
  - `src/components/kyform/KYSectionFields.tsx`
  - `src/components/onboarding/RadioSelectField.tsx`
- Add a compact mode for short-height screens (like 593px height), and apply across KYF/KYC/KYW:
  - tighter top-bar spacing
  - slightly smaller card internal paddings
  - reduced field gaps
  - slightly smaller radio option padding
  - keep bottom CTA visible while reclaiming vertical space for the card
- Keep internal scroll as safety fallback, but design target is “no required scrolling” on each step.

3) Global radio auto-density safeguard
- File: `src/components/onboarding/RadioSelectField.tsx`
- If a radio field has 4+ options and no explicit `columns`, auto-use 2 columns.
- Prevents future tall single-column stacks from reintroducing this issue.

4) Validate across all 3 cohorts by actually filling forms
- Test matrix:
  - Cohorts: Filmmaker, Creator, Writer
  - Viewports: 789×593 and mobile size (390×844)
- For each step, verify:
  - All required fields are visible without scrolling
  - Bottom CTA does not cover inputs
  - Proficiency UI remains KYF-style matrix in all cohorts
  - Data save/next/back behavior still works

Technical notes
- No backend/database changes needed.
- No schema/data migration needed (field keys stay same).
- Scope is purely UI/layout + step composition for consistency and fit.

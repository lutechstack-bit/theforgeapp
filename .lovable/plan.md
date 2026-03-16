

# Add Batchmates as a Tab in the Community Page

## Approach
Instead of creating a separate `/batchmates` route, integrate the Batchmates directory as a third tab within the existing Community page. The toggle becomes **Chat | Batchmates | Network** (or **Batchmates | Network** when chat is disabled). This keeps everything under the Community nav item users already know.

## Changes

### 1. Community Page (`src/pages/Community.tsx`)
- Add `'batchmates'` to the `activeView` state type
- Add a third pill button "Batchmates" in the toggle row
- When `activeView === 'batchmates'`, render a new `<BatchmatesDirectory />` component
- Support URL param `?tab=batchmates` for deep-linking from the homepage

### 2. New Component: `src/components/community/BatchmatesDirectory.tsx`
Full directory view showing all same-edition members in a searchable grid:
- Search bar (filter by name/city)
- Responsive card grid (2 cols mobile, 3-4 cols desktop)
- Each card: avatar, name, city, specialty, MBTI badge
- Clicking a card opens the detail modal

### 3. New Component: `src/components/community/BatchmateDetailSheet.tsx`
Bottom sheet (mobile) / dialog (desktop) showing rich KY form data:
- Header: avatar, full name, city, Instagram
- Sections pulled from the correct KY table based on cohort:
  - **KYF** (Filmmakers): occupation, proficiencies, top 3 films, MBTI, chronotype
  - **KYC** (Creators): content type, platforms, proficiencies, favorites
  - **KYW** (Writers): writing types, genres, proficiencies, favorites
- Proficiency bars component for visual display

### 4. Update `src/components/home/BatchmatesSection.tsx`
- Change "View All" and "+N more" navigation from `/community` to `/community?tab=batchmates`

### 5. No Database Changes
All data already exists in `profiles`, `kyf_responses`, `kyc_responses`, `kyw_responses`.

## File Summary

| Action | File |
|--------|------|
| Create | `src/components/community/BatchmatesDirectory.tsx` |
| Create | `src/components/community/BatchmateDetailSheet.tsx` |
| Edit | `src/pages/Community.tsx` — add batchmates tab |
| Edit | `src/components/home/BatchmatesSection.tsx` — update nav targets |


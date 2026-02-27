

# Add Batchmate Profile Popup on Click

## Approach
Reuse the existing `MemberModal` (bottom sheet) from `src/components/community/MemberModal.tsx` — it already shows avatar, name, city, and specialty in a clean popup.

## Changes

### 1. `src/components/home/BatchmatesSection.tsx`
- **Import** `MemberModal` from `@/components/community/MemberModal`
- **Add state**: `selectedMember` to track which batchmate was clicked
- **Update query**: add `specialty` to the select fields (`id, full_name, avatar_url, city, specialty`)
- **Make each avatar clickable**: wrap the avatar `div` (line 101-119) in a `button` with `onClick` setting `selectedMember`
- **Render `MemberModal`** at the bottom of the component with `isOnline={false}` (no online status tracking on homepage) and `onClose` clearing the state

### Technical detail
The `MemberModal` expects `{ id, full_name, avatar_url, city, specialty }` — the batchmates query currently selects `id, full_name, avatar_url, city`. Adding `specialty` to the select is the only data change needed.


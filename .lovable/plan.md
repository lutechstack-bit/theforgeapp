

## Two Changes

### 1. Fix "Travel & Stay" Header Copy in Database
The homepage section title/subtitle is stored in the `homepage_sections` table and currently reads **"Travel & Stay" / "Your accommodation details"**. The component defaults are correct (`"Your Venue"` / `"Where you'll be living..."`) but get overridden by the DB values. 

**Fix:** Update the DB row to match the branded copy.

**Migration:**
```sql
UPDATE homepage_sections 
SET title = 'Your Venue', subtitle = 'Where you''ll be living, breathing, eating and creating' 
WHERE section_key = 'travel_stay';
```

### 2. Add Admin Toggle for Community Chat

Add a `community_chat_enabled` feature flag to `app_feature_flags`. When disabled, the Community page shows only the Network view (no Chat toggle).

**Migration:**
```sql
INSERT INTO app_feature_flags (feature_key, is_enabled) 
VALUES ('community_chat_enabled', true);
```

**`src/pages/Community.tsx`:**
- Import `useFeatureFlags`
- Check `isFeatureEnabled('community_chat_enabled')`
- If disabled: skip Chat/Network toggle, hide chat-related state/setup, default to Network view
- Show header: **"Network"** / **"Collaborate with like-minded creators"**
- Show only `<CollaboratorDirectory />` + `<CollaboratorInbox />`

**Admin panel** (existing feature flags UI will auto-pick up the new row — no admin code changes needed).

### Files Modified
| File | Change |
|------|--------|
| DB migration | Update `homepage_sections` row + insert feature flag |
| `src/pages/Community.tsx` | Conditionally hide chat based on feature flag |


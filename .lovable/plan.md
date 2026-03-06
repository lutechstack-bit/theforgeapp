

# Add Community Chat Toggle to Admin Dashboard

The `community_chat_enabled` feature flag exists in the database and the Community page already reads it, but the Admin Dashboard UI only renders toggles for `events_enabled` and `updates_enabled`. We need to add a third toggle.

## Change

**`src/pages/admin/AdminDashboard.tsx`** (after the Updates Toggle block, ~line 430):
- Add a "Community Chat" toggle identical in style to the existing ones
- Icon: `MessageSquare` (from lucide-react)
- Label: **"Community Chat"**
- Description: **"Show or hide Chat in Community"**
- Wired to `community_chat_enabled` flag via the same `toggleFeature.mutate` pattern

No other files need changes — the flag already exists in the DB and the Community page already consumes it.


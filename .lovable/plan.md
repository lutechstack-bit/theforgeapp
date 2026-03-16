
What’s actually blocking login

- Your email/password login is succeeding. The backend returns `200` for the `/token` request.
- The app breaks immediately after that when it tries to load the signed-in user’s `profiles` row.
- The exact failure is: `42P17 infinite recursion detected in policy for relation "profiles"`.
- This started because the recent batchmates migration added a `profiles` SELECT policy that queries `public.profiles` from inside a policy on `public.profiles`:

```sql
edition_id in (
  select p.edition_id
  from public.profiles p
  where p.id = auth.uid()
)
```

Why the app shows “Connection Issue”

- `AuthContext` signs the user in, then calls `fetchProfile()`.
- That `profiles` query now returns `500` because of the recursive RLS policy.
- Since `ProfileSetupCheck` depends on profile data, it falls into the recovery screen, so it feels like “login failed” even though authentication itself worked.

Marker.io status

- Marker.io is not the login blocker.
- It is separately loaded from `index.html` and mounted globally through `MarkerProvider` in `src/App.tsx`.
- Right now it also logs `MarkerProvider: Marker.io did not load within expected time`, so removing it is a good cleanup.

Implementation plan

1. Restore login first
- Add a database hotfix migration to remove the recursive same-edition policies from:
  - `profiles`
  - `kyf_responses`
  - `kyc_responses`
  - `kyw_responses`
- Keep only safe existing policies for:
  - own profile / own KY rows
  - admin access

2. Rebuild batchmates access safely
- Do not re-add direct same-edition `SELECT` policies on base tables.
- Instead, create secure backend functions for batchmates:
  - `get_batchmates_for_my_edition()`
  - `get_batchmate_details(member_id uuid)`
- These functions will:
  - validate same-edition access server-side
  - avoid recursive RLS
  - return only intentionally allowed fields
- This is safer than exposing raw `profiles`/KY tables, which currently risks leaking private fields like email/phone and other sensitive data.

3. Update the batchmates UI to use the safe data source
- Change `BatchmatesDirectory.tsx` to load members from the new function instead of querying `profiles` directly.
- Change `BatchmateDetailSheet.tsx` to load the selected member’s approved details from the new function instead of querying raw KY tables.

4. Remove Marker.io completely
- Remove the Marker snippet from `index.html`
- Remove `MarkerProvider` from `src/App.tsx`
- Delete or stop using `src/components/feedback/MarkerProvider.tsx`
- Search once more for any leftover `Marker`, `markerConfig`, or Marker.io references

5. Cleanup pass
- Re-test login flow after the RLS hotfix
- Confirm `/auth -> /welcome` or `/` works again
- If still needed, separately clean up the non-blocking React ref warning around `UserDataRecovery`

Files / areas involved

- `supabase/migrations/...` — hotfix + secure batchmates backend functions
- `src/components/community/BatchmatesDirectory.tsx`
- `src/components/community/BatchmateDetailSheet.tsx`
- `src/App.tsx`
- `index.html`
- `src/components/feedback/MarkerProvider.tsx`

Technical note

- I do not think the main issue is session restoration timing here, because the logs clearly show successful token issuance followed by a failing `profiles` read.
- So the first fix should be the database policy rollback/hardening, not auth boot refactoring.
- If you want, I’d keep the batchmates feature but reintroduce it through safe backend functions rather than direct table policies.

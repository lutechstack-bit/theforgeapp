
Fix: Live session still fails because the meeting number is stored with spaces and the current signature code truncates it.

What I found
- The `zoom-signature` call is now succeeding with HTTP 200, so this is no longer a CORS/deployment problem.
- The current live session record for `/live-session/1ad0d0ec-68f4-472d-9f3b-629623d51c41` stores:
  ```text
  zoom_meeting_number = "880 4949 9009"
  ```
- In `supabase/functions/zoom-signature/index.ts`, the code currently does:
  ```ts
  mn: parseInt(meetingNumber, 10)
  ```
- That means:
  ```ts
  parseInt("880 4949 9009", 10) === 880
  ```
- So the signature is being generated for meeting `880`, not for the real meeting `88049499009`. Zoom then rejects the join and shows “Failed to join meeting”.

Root cause
```text
Stored value:        "880 4949 9009"
Edge function signs: 880
Client joins with:   "880 4949 9009"
Result: mismatch -> Zoom join fails
```

Implementation plan
1. Normalize the meeting number everywhere with:
   ```ts
   raw.replace(/\D/g, '')
   ```
   so spaces/dashes never break the join flow.
2. Update `supabase/functions/zoom-signature/index.ts` to:
   - clean the incoming meeting number first
   - validate the cleaned value
   - sign with:
     ```ts
     mn: Number(normalizedMeetingNumber)
     ```
   instead of parsing the raw formatted string.
3. Update `src/pages/LiveSession.tsx` to use the same normalized meeting number for:
   - the edge function request
   - `client.join({ meetingNumber })`
   - the mobile Zoom URL
4. Update `src/pages/admin/AdminLiveSessions.tsx` to sanitize the meeting number before insert/update so future sessions are stored correctly even if pasted with spaces.
5. Add small admin input guidance like “spaces are okay, they’ll be cleaned automatically” or enforce numeric-only input formatting.

Files to change
- `supabase/functions/zoom-signature/index.ts`
- `src/pages/LiveSession.tsx`
- `src/pages/admin/AdminLiveSessions.tsx`

Technical details
- Do not use `parseInt()` on the raw admin-entered meeting number.
- Clean first, then sign/join with the cleaned value.
- No database schema change is required.
- Existing sessions with spaced meeting numbers will start working once runtime normalization is added.

Expected result
- The current broken session should join correctly.
- Newly created sessions will no longer save a Zoom-incompatible meeting number format.
- This fixes the real cause, not the earlier CORS/signature symptom.

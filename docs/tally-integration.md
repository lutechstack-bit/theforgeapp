# Tally integration for the Forge submissions pipeline

When a student submits one of the three Forge forms on Tally (Premise / First
Draft Script / Production Schedule), Tally posts to our webhook. We insert a
`submissions` row; the mentor reviews from the mentor workspace.

**The Tally answer payload is never stored in our database.** We keep only
the event (who submitted what form, when) and a link back to the Tally
dashboard where the content lives. The mentor opens it there to read.

---

## One-time setup

### 1. Secrets

Set these on the Supabase project:

```bash
supabase secrets set TALLY_WEBHOOK_SECRET=<generate-a-random-32-char-string>
supabase secrets set TALLY_FORM_PREMISE=<premise-form-id>
supabase secrets set TALLY_FORM_SCRIPT=<script-form-id>
supabase secrets set TALLY_FORM_PRODUCTION=<production-schedule-form-id>
```

The form ID is the suffix of the share URL — `https://tally.so/r/<ID>`.

> **Don't set `TALLY_API_KEY` unless/until you decide to pull answers into
> the app.** The webhook flow doesn't need it. See "Optional: pulling
> answers" at the bottom.

### 2. Add a hidden `student_id` field to each of the 3 Tally forms

In Tally: form → Settings → Hidden fields → add one named exactly
`student_id`. This is how the webhook knows *who* submitted.

### 3. Configure the webhook in each Tally form

In Tally: form → Integrations → Webhooks → Add webhook.

- **URL:** `https://<project-ref>.supabase.co/functions/v1/tally-webhook`
- **Secret:** paste the same value you set as `TALLY_WEBHOOK_SECRET`.
- Enable for the event: "On new response"

Do this for all 3 forms.

### 4. Deploy the edge function

```bash
supabase functions deploy tally-webhook --no-verify-jwt
```

(`config.toml` already sets `verify_jwt = false` for this function — the
`--no-verify-jwt` flag is just belt-and-suspenders.)

Test:

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/tally-webhook
# → 401 Invalid signature (good; means it's live and rejecting unsigned calls)
```

### 5. Student-side: build form URLs with the hidden field populated

Your app needs to open the Tally form with `student_id` in the URL so the
hidden field gets prefilled. The helper in `src/hooks/useSubmissions.ts`
does this:

```ts
import { buildTallyFormUrl } from '@/hooks/useSubmissions';

const url = buildTallyFormUrl(
  'https://tally.so/r/mRE0p9',  // premise form
  user.id,
);
// Resulting URL: https://tally.so/r/mRE0p9?student_id=<uuid>
// Tally auto-populates the `student_id` hidden field from the query param.
```

On the student side, the "Submit your premise" card/button on Home,
Roadmap, or the student-facing submissions block should use this helper
when generating its `href`.

---

## What lives in the app vs. what lives in Tally

| Data | Where |
|---|---|
| Fact of submission (who, which form, when, response ID) | our DB (`submissions`) |
| Mentor's Approved/Revisions decision + ≤500 char feedback note | our DB (`submission_feedback`) |
| The actual question answers the student filled in | Tally |

The mentor's workspace has an **"Open in Tally"** button on each pending
submission that links directly to the Tally response page. Mentors read
the answers there, then come back to the app to approve or send revisions.

---

## Data flow

```
Student submits a form on Tally
        │
        ▼
Tally POSTs to /functions/v1/tally-webhook  (signed with TALLY_WEBHOOK_SECRET)
        │
        ▼
Edge function:
  1. Verify HMAC signature
  2. Map Tally formId → form_key (premise / script / production)
  3. Extract student_id from hidden fields
  4. Look up student's current mentor + edition
  5. Check for previous submission on the same form → set revision_of
  6. INSERT INTO public.submissions (status='pending', ...)
        │
        ▼
Mentor opens workspace → Submissions tab shows the pending item
Mentor clicks "Open in Tally" to read answers
Mentor clicks Approve or Send revisions
        │
        ▼
INSERT INTO submission_feedback (decision, body)
UPDATE submissions SET status='approved'|'revisions', reviewed_at=now()
        │
        ▼
Student sees the status flip on their side (Phase 6 — student home card)
```

---

## Idempotency / retries

Tally retries webhooks on failure. The `submissions.tally_response_id`
column is `UNIQUE`, so a duplicate POST for the same response returns a
200 ("Already processed") instead of creating a second row.

---

## Troubleshooting

**Invalid signature** → `TALLY_WEBHOOK_SECRET` in Supabase doesn't match
the one set in Tally's webhook settings. Regenerate both.

**Missing student_id hidden field** → Tally form isn't carrying the
hidden field. Confirm (a) the hidden field `student_id` exists on the
form, (b) you're linking to the form with `?student_id=<uuid>` as a query
param, (c) the query param key exactly matches the hidden field name.

**Unknown form (ignored)** → the Tally formId isn't in the
`TALLY_FORM_*` env mapping. The webhook returns 200 so Tally stops
retrying — add the form id and redeploy.

**Nothing shows up in the mentor workspace** → the student's
`mentor_assignments` row is missing for the current edition. Check
Admin → Mentor assignments. The submission still inserts with
`mentor_user_id = NULL`, but RLS prevents mentors from seeing it because
`is_my_student()` returns false. Fix by assigning the student.

---

## Optional: pulling Tally answers into the app later

If you eventually want the answers searchable inside the app (not just
visible in Tally's dashboard), you'd:

1. Set `supabase secrets set TALLY_API_KEY=<your-key>`
2. Extend the webhook (or add a batch cron) to call
   `GET https://api.tally.so/forms/<formId>/submissions/<responseId>`
   with `Authorization: Bearer $TALLY_API_KEY`, and store the returned
   answers in a new `submission_answers` JSONB column.

Until you do that, the app stays well within privacy bounds: we know a
student submitted, but not what they wrote.

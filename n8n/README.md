# Forge n8n Automation — Sheet → App Onboarding & Payment Sync

This replaces the old DB-trigger / `pg_net` approach. n8n polls the Google Sheet
every 5 minutes and:

1. **Onboards** any student whose payment is confirmed → calls the
   `forge-onboard-student` edge function, which creates the account, resolves or
   **auto-creates the edition**, sends the welcome email, and logs everything to
   `email_sends` + `onboarding_automation_logs` (so it shows in
   **Admin → Automation → Onboarding Status**).
2. **Syncs payment status** back into `profiles` (₹15k ↔ balance paid) for
   students who already exist.

> One-way only: **Sheet → App**. The app never writes to the sheet.
> Razorpay already feeds the sheet, so the sheet stays the payment source of truth.

---

## 1. Import the workflow

n8n → **Workflows → Import from File** → select
[`forge-onboarding.workflow.json`](./forge-onboarding.workflow.json).

## 2. No setup needed — everything is hardcoded ✅

This workflow needs **no environment variables and no Google OAuth**. Every value
is baked into the nodes already:

| What | Value (already in the JSON) |
|---|---|
| Source sheet | `1_c4401Lm039N-szlSTjYFzpzhJxqrcrhR6D0n7Eu-AA`, tab `Sheet1` |
| Supabase URL | `https://tprvyhzpecopryylxznm.supabase.co` |
| `x-forge-secret` | `forge123` |
| Log destination | Apps Script Web App (`…/exec`) → appends to the `Logs` tab |

> The source sheet must be shared **"Anyone with the link → Viewer"** so the CSV
> fetch works without auth.
>
> **If anything changes later** — edit it directly in the node:
> - New secret → update `x-forge-secret` on **Onboard Student** + **Sync Payment Status**.
> - Redeployed Apps Script → paste the new `…/exec` URL into **Write Onboard Log** + **Write Payment Log**.
> - Different sheet/tab → update the URL in **Fetch Sheet CSV**.

## 3. Map your sheet columns (one-time)

Open the **"Parse & Classify Rows"** node and edit the `COL` object at the top so
each key points at your sheet's **exact header text**:

```js
const COL = {
  email:        'Email',
  full_name:    'Name',
  phone:        'Phone',
  city:         'City',
  product:      'Product',        // FFM / FC / FW (optional, defaults FFM)
  payment:      'Payment Status', // the column your team updates
  edition_id:   'Edition Id',     // optional: assign to an existing edition
  edition_name: 'Edition',        // optional: enables auto-create of a NEW edition
  edition_city: 'Edition City',
  cohort_type:  'Cohort Type',    // FORGE | FORGE_CREATORS | FORGE_WRITING
};
```

Also adjust the value lists just below if your payment column uses different
wording:

```js
const BALANCE_PAID_VALUES  = ['balance paid', 'full paid', 'paid 50', '50000', 'completed'];
const CONFIRMED_15K_VALUES = ['15k', 'deposit paid', 'confirmed', '15000', 'slot confirmed'];
const DEFERRED_VALUES      = ['defer', 'waitlist', 'postpone'];
```

### Edition resolution (no product mapping needed)
Per student row, the edition is resolved in this order:
1. `Edition Id` column (if it holds a real edition UUID) → assigns to it.
2. Otherwise `Edition` + `Edition City` + `Cohort Type` → **auto-creates** that
   edition the first time a student of it appears, then reuses it.

If your sheet has neither, pre-create the edition in **Admin → Editions** and put
its name in the `Edition` column.

## 4. Test, then activate

- Click **Execute Workflow** once with the sheet populated. Check executions:
  - `Onboard Student` should return `status: success` (or `duplicate` for
    already-onboarded students — that's expected and safe; it won't re-send mail).
  - Confirm new rows appear in **Admin → Onboarding Status**.
- When happy, toggle the workflow **Active** (top-right). It now runs every 5 min.

## Notes & safety
- **Idempotent:** `forge-onboard-student` returns `duplicate` for existing
  students *before* sending email, so re-polling every 5 min never spams.
- **Failures aren't silent:** the `Log Failures` node logs any `skipped` onboard
  to the execution log. (Optional: swap it for an Email/Slack node.)
- **`DEFERRED` is Phase 2:** deferred rows are detected but skipped for now — the
  `payment_status` enum only has `CONFIRMED_15K` / `BALANCE_PAID` today. Phase 2
  adds a `DEFERRED` status + a real waitlist edition and a move step here.



# Update Payment Links and Add Grant Toggle

## Current State
- 13 students with payment_config records, all currently pointing to old `rzp.io` short links
- Sanjeev is incorrectly set as non-grant (85K/70K) but should be grant (80K/65K) per spreadsheet
- Manoj and Akash are already correctly set as grant students (80K/65K)
- Goda Prabhakar should be left untouched
- `payment_defaults` table only has E16 entry, no E17 entry, and no new links

## What Changes

### 1. Database updates (via migration + data script)

**Update payment_config for 12 students** (all except Goda):

**70K (non-grant) students** — set `payment_link` to `https://pages.razorpay.com/pl_SRqJNCWHcTp7sv/view`:
- Girish, Laxmi, Rajesh, Pavan, Madhukar, Sheshank, Marutie, Siddhardha, Aryan

**65K (grant) students** — set `programme_total=80000`, `balance_due=65000`, `payment_link` to `https://pages.razorpay.com/pl_SRqUHCieFlVyop/view`:
- Sanjeev (currently wrong at 85K — fix to 80K)
- Manoj, Akash (already correct totals, just update link)

**Update payment_defaults** for both E16 and E17 editions with the new 70K link as default, since most students are non-grant.

### 2. Admin UI: Grant toggle in edit dialog (`AdminPayments.tsx`)

Add a **"Grant Student (₹5,000)"** toggle/switch in the payment edit dialog that:
- When toggled ON: sets `programme_total = 80000`, auto-recalculates `balance_due = 65000`, sets `payment_link` to the 65K Razorpay link
- When toggled OFF: sets `programme_total = 85000`, auto-recalculates `balance_due = 70000`, sets `payment_link` to the 70K Razorpay link
- The toggle derives its initial state from whether `programme_total < edition default programme_total`

This is added as a prominent switch at the top of the edit dialog, above the existing fields.

### 3. Files changed
- `src/pages/admin/AdminPayments.tsx` — add grant toggle switch in edit dialog
- Database migration — bulk update payment_config links + fix Sanjeev + update payment_defaults

### Technical Details

**SQL migration** (single migration):
```sql
-- Fix Sanjeev to grant student
UPDATE payment_config SET programme_total = 80000, balance_due = 65000, 
  payment_link = 'https://pages.razorpay.com/pl_SRqUHCieFlVyop/view'
WHERE user_id = '69f82f8a-67ff-4bb7-b444-f5d2d3606f15';

-- Update 65K grant students' links (Manoj, Akash)
UPDATE payment_config SET payment_link = 'https://pages.razorpay.com/pl_SRqUHCieFlVyop/view'
WHERE user_id IN ('83fd23bc-...', '2e3032ac-...');

-- Update 70K non-grant students' links (9 students, excluding Goda)
UPDATE payment_config SET payment_link = 'https://pages.razorpay.com/pl_SRqJNCWHcTp7sv/view'
WHERE user_id IN (...9 IDs...);

-- Update payment_defaults
UPDATE payment_defaults SET payment_link = 'https://pages.razorpay.com/pl_SRqJNCWHcTp7sv/view' 
WHERE edition_id = 'cafb3143-...';
INSERT INTO payment_defaults (...) VALUES (E17 edition, 85000, 15000, ..., 70K link);
```

**Grant toggle in AdminPayments.tsx**:
- Add `Switch` component with label "Grant Student (₹5,000 off)"
- On toggle, auto-set `programme_total`, recalc displayed balance, and swap `payment_link` between the two Razorpay URLs
- Store the two link constants at top of file


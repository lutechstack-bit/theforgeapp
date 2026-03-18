

# Insert Payment Config for All Students + Fix Yellow Colors

## What's happening

From the screenshot, there are two groups:
1. **"Full Payment" students** (BALANCE_PAID status) — 15 users with no `payment_config` record. Need records showing they've paid in full (balance_due = 0).
2. **"Only 15K" students** (CONFIRMED_15K status) — 18 users missing `payment_config` records (only prasanna@gmail.com has one). Need records with correct balance and payment links.

Additionally, the PaymentFocusCard and PaymentDetailModal use red (`destructive`) styling instead of the app's yellow/amber (`primary`) theme.

## Changes

### 1. Database: Insert `payment_config` for 15K students

For each "Only 15K" user (by email → user_id lookup):

| Email | Balance | Payment Link |
|-------|---------|-------------|
| girishreddy.veluru@gmail.com | 70,000 | https://rzp.io/rzp/lqegb1u |
| sanjeevmattoo@gmail.com | 65,000 | https://rzp.io/rzp/T0kUgAOh |
| laxmibhushan@gmail.com | 70,000 | https://rzp.io/rzp/lqegb1u |
| drykdvizag@gmail.com | 65,000 | https://rzp.io/rzp/T0kUgAOh |
| rajeshmishra.og@gmail.com | 70,000 | https://rzp.io/rzp/lqegb1u |
| pavankirkliston@gmail.com | 70,000 | https://rzp.io/rzp/lqegb1u |
| madhukar.tbps@gmail.com | 70,000 | https://rzp.io/rzp/lqegb1u |
| nileshyadav68664511@gmail.com | 65,000 | https://rzp.io/rzp/T0kUgAOh |
| sheshank23adithya@gmail.com | 70,000 | https://rzp.io/rzp/lqegb1u |
| manoj.kinger@outlook.com | 65,000 | https://rzp.io/rzp/T0kUgAOh |
| akash.sebastian@gmail.com | 65,000 | https://rzp.io/rzp/T0kUgAOh |
| pvmarutie@gmail.com | 70,000 | https://rzp.io/rzp/lqegb1u |
| surojusiddhardha@gmail.com | 70,000 | https://rzp.io/rzp/lqegb1u |
| aryan.ceo@gsfmoney.org | 70,000 | https://rzp.io/rzp/lqegb1u |
| aliquadri007@gmail.com | 65,000 | https://rzp.io/rzp/T0kUgAOh |
| ketan@movedproduction.com | 70,000 | https://rzp.io/rzp/lqegb1u |
| rsah9118@gmail.com | 65,000 | https://rzp.io/rzp/T0kUgAOh |
| godaprabhu@gmail.com | 70,000 | https://rzp.io/rzp/lqegb1u |

Each: `programme_total = balance + 15000`, `deposit_paid = 15000`, `deposit_label = 'Slot confirmation fee'`

Skip prasanna@gmail.com (already has a record).

### 2. Database: Insert `payment_config` for Full Payment students

For each "Full Payment" user (BALANCE_PAID): `programme_total = 85000`, `deposit_paid = 85000`, `deposit_label = 'Full payment'`, `balance_due = 0`

Users: aadish1304, aryanpsrivastava, sunny.bagde.scholar, sanchi.shah.04.25, suraj.kr2317, bharadwaj.indrala7, raj.vudali, reddysbindu, anshulkarasi009, mukuldas77, hrithik.sh28, gowthamlakhinana99, nvsneo, lewisprincejr, priyadarshanlaltc, sreekeshreddymadadi

(Skipping admin@admin.in — test account)

### 3. `PaymentFocusCard.tsx` — Yellow colors

Replace all `destructive` with `primary`:
- `border-destructive/20` → `border-primary/20`
- `from-destructive/10` → `from-primary/10`
- `text-destructive` → `text-primary`
- `bg-destructive/15` → `bg-primary/15`
- `variant="destructive"` → remove (default uses primary)
- `bg-destructive/5` → `bg-primary/5`

### 4. `PaymentDetailModal.tsx` — Yellow colors

- Line 75: `text-destructive` → `text-primary`
- Line 123: `bg-destructive/10 text-destructive border-destructive/20` → `bg-primary/10 text-primary border-primary/20`

### Files & Actions
| Target | Action |
|--------|--------|
| Database (insert tool) | Insert 18 `payment_config` rows for 15K students |
| Database (insert tool) | Insert 16 `payment_config` rows for full-payment students |
| `PaymentFocusCard.tsx` | Replace red → yellow/primary colors |
| `PaymentDetailModal.tsx` | Replace red → yellow/primary colors |


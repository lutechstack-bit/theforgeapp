

# Payment System: Admin Management + User-Facing Payment Card

## What We're Building

A complete payment tracking system with:
1. **A dedicated Admin Payments page** for detailed per-user payment management, edition defaults, and Razorpay link configuration
2. **A payment summary badge in the Users table** (already partially exists — will enhance it to link to the Payments page)
3. **A user-facing "Payment Due" card** on the homepage matching your screenshot design exactly

## Database Changes

### 1. `payment_config` table — per-user payment details (admin-managed)

| Column | Type | Purpose |
|--------|------|---------|
| `user_id` | uuid (unique, FK → profiles) | One record per user |
| `programme_total` | numeric (default 50000) | Total programme fee |
| `deposit_paid` | numeric (default 15000) | Amount already paid |
| `deposit_label` | text (default 'Slot confirmation fee') | Label for the deposit line |
| `balance_due` | numeric (generated: total - deposit) | Auto-calculated |
| `payment_deadline` | date | Deadline shown in red |
| `payment_link` | text | Razorpay "Pay now" redirect URL |
| `installment_link` | text | Optional "Pay in instalments" URL |
| `is_deposit_verified` | boolean (default true) | Admin verification flag |
| `notes` | text | Admin notes |

RLS: Admins can manage all; users can SELECT their own row.

### 2. `payment_defaults` table — edition-level templates for bulk setup

| Column | Type | Purpose |
|--------|------|---------|
| `edition_id` | uuid (unique, FK → editions) | One default per edition |
| `programme_total` | numeric | Default total for this edition |
| `default_deposit` | numeric | Default deposit amount |
| `deposit_label` | text | Default label |
| `default_deadline` | date | Default deadline |
| `payment_link` | text | Default Razorpay link |
| `installment_link` | text | Default installments link |

RLS: Admins full access; authenticated users can SELECT.

## Admin Panel: New Payments Page (`/admin/payments`)

### Top section — Edition Defaults
- Dropdown to select an edition
- Form to set default values (programme_total, deposit, deadline, payment_link, installment_link)
- "Apply defaults to all users in this edition" bulk action button

### Main section — Per-User Payment Table
- Filter by edition, payment status (paid/pending/partial)
- Columns: Name, Email, Edition, Programme Total, Deposit Paid, Balance Due, Deadline, Status, Actions
- Click "Edit" to open dialog with all payment fields including the Razorpay payment_link and installment_link
- Auto-update `profiles.payment_status` to `BALANCE_PAID` when deposit_paid >= programme_total

## Users Table Enhancement
- The existing Payment badge column already shows "Full" or "₹15K"
- Add a small "₹" icon/link on hover that navigates to `/admin/payments?user={id}` for quick access to that user's payment details

## User-Facing: PaymentDueCard Component

Recreates the exact design from your screenshots:
- **Left column**: "PAYMENT DUE" red badge, "Complete your programme fees" heading, edition name + dates, payment progress bar, line items (Programme total, deposit paid with checkmark, Balance due in bold, Payment deadline in red)
- **Right column**: Circular progress ring (% paid), balance amount, "Pay ₹X now →" button (opens payment_link), "Pay in instalments" link (opens installment_link), due date badge
- Only visible when `payment_status === 'CONFIRMED_15K'` (balance still due)
- Hidden when fully paid

### Homepage Integration
- Insert `PaymentDueCard` after the countdown timer, before Today's Focus
- Add a `payment` section key to `homepage_sections` for admin toggle control
- Fetches `payment_config` for the logged-in user

## Files to Create/Modify

| File | Action |
|------|--------|
| DB migration | Create `payment_config` + `payment_defaults` tables with RLS |
| `src/pages/admin/AdminPayments.tsx` | New: full payment management page |
| `src/components/home/PaymentDueCard.tsx` | New: user-facing payment card |
| `src/pages/Home.tsx` | Add PaymentDueCard between countdown and focus |
| `src/App.tsx` | Add `/admin/payments` route + import |
| `src/components/admin/AdminLayout.tsx` | Add "Payments" nav item with CreditCard icon |
| `src/pages/admin/AdminUsers.tsx` | Add clickable payment badge linking to payments page |
| `homepage_sections` data | Insert `payment` section row |


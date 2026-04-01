

# Add Grant Metrics & Filters to Admin Payments

## Context
The standard programme fee is ₹85,000, but some students receive grants that lower their `programme_total` (e.g., ₹80,000 = ₹5K grant). Currently the admin panel has no visibility into who has grants vs who doesn't. We'll derive grant status by comparing each user's `programme_total` against their edition's default total from `payment_defaults`.

## Changes (single file: `AdminPayments.tsx`)

### 1. New Stats Cards
Replace the current 4-card stats row with 6 cards:
- **Total Users** (existing)
- **Configured** (existing)
- **Balance Pending** (existing)
- **Fully Paid** (existing)
- **With Grant** — count of users whose `programme_total` < their edition's default total
- **No Grant** — count of users at the standard edition total

### 2. New Filter Option
Add grant filter options to the status filter dropdown:
- `with_grant` — students with a reduced programme total (grant applied)
- `no_grant` — students at the standard edition total

### 3. Grant Column in Table
Add a **"Grant"** column between "Total" and "Paid" that shows:
- The grant amount (e.g., "₹5,000") with a green badge if they have one
- "—" if no grant (standard fee)

Grant amount = `editionDefault.programme_total - config.programme_total`

### 4. Grant Field in Edit Dialog
Add a read-only computed "Grant Applied" line in the edit dialog summary section so admins can see the grant amount when editing.

## No Schema Changes
All derived from existing data: `payment_config.programme_total` vs `payment_defaults.programme_total` per edition.


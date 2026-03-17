

# Bulk Import E16/E17 Students from Spreadsheet

## What Changes

### 1. Edge Function: `supabase/functions/create-user/index.ts`
Add `profile_setup_completed: true` to the profile update so imported users skip the profile setup and welcome pages entirely.

### 2. Admin Users Page: `src/pages/admin/AdminUsers.tsx`

**Add student data array** (`EDITION_16_STUDENTS`) extracted from the spreadsheet screenshot. Each entry includes: `full_name`, `email`, `phone`, `payment_status`, `payment_link`, `balance_due`, `edition_id`.

**Password rule**: `{FirstName}@Forge!` — just the first name, no dot, no last name.
Examples: `Aadish@Forge!`, `Aryan@Forge!`, `Manaswini@Forge!`

**Edition assignment**:
- Rows with "E16" in the Edition column → `cafb3143-964b-42e8-a8d1-80ee1da86827` (E16)
- Blank Edition column → `fada9b20-b56e-4d8e-b67c-7c2313e7ed9e` (E17)

**Payment handling for "Only 15k" users**:
- `payment_status: "CONFIRMED_15K"`
- After user creation, insert into `payment_config` with their Razorpay payment link and balance amount (65,000 or 70,000)

**Full payment users**: `payment_status: "BALANCE_PAID"`

**Add import mutation** (`importEdition16Mutation`) following the exact same pattern as the existing `importEdition14Mutation` / `importEdition15Mutation`, but:
- Uses first-name-only password
- After each successful user creation, if `payment_status === "CONFIRMED_15K"`, also inserts a `payment_config` row with the payment link and balance

**Add import button** in the admin UI alongside the existing cohort import buttons.

### Student Data (from screenshot)

~34 students will be hard-coded. I'll extract names, emails, phones, payment status, payment links, balance amounts, and edition assignments from the uploaded spreadsheet image.

### Profile Setup Skip
The `create-user` edge function update ensures `profile_setup_completed: true` is set on the profile, so `App.tsx` line 147 won't redirect these users to `/profile-setup`.


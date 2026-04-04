

# Corrected Bulk Import: 8 E7 + 11 E5 = 19 Creator Students

From the updated screenshot, **Ajay Daniel is in E5** (not E7 as previously mapped).

**Note:** The screenshot shows **8 students in E7** and **11 in E5** (19 total). If there's a missing E7 student, let me know.

## Corrected Student List

### Edition E7 (`977a0845-da88-434f-aff1-c7301b0224a4`) — 8 students

| # | Name | Email | Password | Payment |
|---|------|-------|----------|---------|
| 1 | Kavan | kavan.hegde97@gmail.com | Kavan@Forge! | CONFIRMED_15K |
| 2 | Yash Poptani | yashpoptani00@gmail.com | Yash@Forge! | BALANCE_PAID |
| 3 | Sandeep reddy moku | sandeeppreddymoku@gmail.com | Sandeep@Forge! | BALANCE_PAID |
| 4 | Ayush Verma | ayushverma.co@gmail.com | Ayush@Forge! | BALANCE_PAID |
| 5 | Jyoshitaa | jyoshitaa@gmail.com | Jyoshitaa@Forge! | CONFIRMED_15K |
| 6 | Jasul A | jasuljasu@gmail.com | Jasul@Forge! | CONFIRMED_15K |
| 7 | Ravi Shankar | arsr319@gmail.com | Ravi@Forge! | CONFIRMED_15K |
| 8 | Bharat | bharat.bylappa@gmail.com | Bharat@Forge! | CONFIRMED_15K |

### Edition E5 (`fde7dc65-0a21-492f-989b-6256eaa011f3`) — 11 students

| # | Name | Email | Password | Payment |
|---|------|-------|----------|---------|
| 9 | Ajay Daniel | ajay@limestays.com | Ajay@Forge! | CONFIRMED_15K |
| 10 | Lahya | lahya.rch@gmail.com | Lahya@Forge! | CONFIRMED_15K |
| 11 | Mahina | sangeetajain61174@gmail.com | Mahina@Forge! | CONFIRMED_15K |
| 12 | Aishwarya | rameksn@gmail.com | Aishwarya@Forge! | CONFIRMED_15K |
| 13 | Vidhi Furia | vidhifuria@gmail.com | Vidhi@Forge! | CONFIRMED_15K |
| 14 | Timir patel | timir@antimtechnologies.com | Timir@Forge! | CONFIRMED_15K |
| 15 | Amey Katkar | amey.k.katkar@gmail.com | Amey@Forge! | CONFIRMED_15K |
| 16 | Aditya Tyagi | adityatyagivlogs@gmail.com | Aditya@Forge! | CONFIRMED_15K |
| 17 | Shashank | shashank.duraisamy@gmail.com | Shashank@Forge! | CONFIRMED_15K |
| 18 | Vignesh waran | indiancraftcompany13@gmail.com | Vignesh@Forge! | CONFIRMED_15K |
| 19 | Vyjayanti Adiga | vyj.adiga@gmail.com | Vyjayanti@Forge! | CONFIRMED_15K |

## Approach
1. Create temporary `supabase/functions/bulk-import-users/index.ts` edge function
2. Add `[functions.bulk-import-users]` to `supabase/config.toml` with `verify_jwt = false`
3. Deploy, call with all 19 students, verify results
4. Delete the function and config entry after success

## What the function does per student
- `auth.admin.createUser()` with `email_confirm: true`
- Update `profiles` with: `edition_id`, `payment_status`, `unlock_level` (FULL for BALANCE_PAID, PREVIEW for CONFIRMED_15K), `profile_setup_completed: true`




# Auto-Create payment_config When payment_status Changes

## Problem
The `payment_status` field on the `profiles` table and the `payment_config` table are completely disconnected. When you assign a user as "15K paid" or "full paid" in the admin panel, only the `payment_status` column updates — no `payment_config` row is created. Without that row, the PaymentFocusCard returns null and the user sees nothing.

The only place `payment_config` gets auto-created is during bulk user creation (AdminUsers line 897), but if you later change a user's status manually, nothing happens.

## Solution
Create a database trigger on the `profiles` table that automatically inserts/updates a `payment_config` row whenever `payment_status` changes.

### Database Migration — Trigger Function

```sql
CREATE OR REPLACE FUNCTION public.sync_payment_config_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edition_defaults record;
BEGIN
  -- Only fire when payment_status actually changes
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN

    -- Look up edition defaults for this user's edition
    SELECT * INTO edition_defaults
    FROM public.payment_defaults
    WHERE edition_id = NEW.edition_id
    LIMIT 1;

    IF NEW.payment_status = 'CONFIRMED_15K' THEN
      -- Insert or update payment_config with defaults (balance pending)
      INSERT INTO public.payment_config (user_id, programme_total, deposit_paid, balance_due, deposit_label, payment_link, installment_link)
      VALUES (
        NEW.id,
        COALESCE(edition_defaults.programme_total, 85000),
        COALESCE(edition_defaults.default_deposit, 15000),
        COALESCE(edition_defaults.programme_total, 85000) - COALESCE(edition_defaults.default_deposit, 15000),
        COALESCE(edition_defaults.deposit_label, 'Slot confirmation fee'),
        edition_defaults.payment_link,
        edition_defaults.installment_link
      )
      ON CONFLICT (user_id) DO UPDATE SET
        programme_total = EXCLUDED.programme_total,
        deposit_paid = EXCLUDED.deposit_paid,
        balance_due = EXCLUDED.balance_due,
        payment_link = EXCLUDED.payment_link;

    ELSIF NEW.payment_status = 'BALANCE_PAID' THEN
      -- Insert or update as fully paid
      INSERT INTO public.payment_config (user_id, programme_total, deposit_paid, balance_due, deposit_label)
      VALUES (
        NEW.id,
        COALESCE(edition_defaults.programme_total, 85000),
        COALESCE(edition_defaults.programme_total, 85000),
        0,
        'Full payment'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        deposit_paid = EXCLUDED.programme_total,
        balance_due = 0,
        deposit_label = 'Full payment';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_payment_status_change
  AFTER UPDATE OF payment_status ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_payment_config_on_status_change();
```

This requires a **unique constraint on `payment_config.user_id`** for `ON CONFLICT` to work. Need to check if one exists; if not, add it in the same migration.

### What This Fixes
- Any time you change a user's `payment_status` in AdminUsers, a matching `payment_config` row is automatically created with sensible defaults from the edition's `payment_defaults`
- No more manually inserting payment_config rows
- The PaymentFocusCard will immediately show for that user

### No Code Changes Needed
The trigger handles everything at the database level. Existing admin pages and frontend components work as-is.

| Target | Action |
|--------|--------|
| Database migration | Add `sync_payment_config_on_status_change()` trigger function |
| Database migration | Create trigger on `profiles.payment_status` column |
| Database migration | Add unique constraint on `payment_config.user_id` if missing |
| Insert `payment_config` for `g@g.in` | So the test user sees the card immediately |


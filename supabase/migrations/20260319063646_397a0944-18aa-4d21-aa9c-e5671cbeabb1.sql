CREATE OR REPLACE FUNCTION public.sync_payment_config_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edition_defaults record;
BEGIN
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    SELECT * INTO edition_defaults
    FROM public.payment_defaults
    WHERE edition_id = NEW.edition_id
    LIMIT 1;

    IF NEW.payment_status = 'CONFIRMED_15K' THEN
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
        payment_link = EXCLUDED.payment_link,
        installment_link = EXCLUDED.installment_link,
        updated_at = now();

    ELSIF NEW.payment_status = 'BALANCE_PAID' THEN
      INSERT INTO public.payment_config (user_id, programme_total, deposit_paid, balance_due, deposit_label)
      VALUES (
        NEW.id,
        COALESCE(edition_defaults.programme_total, 85000),
        COALESCE(edition_defaults.programme_total, 85000),
        0,
        'Full payment'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        deposit_paid = EXCLUDED.deposit_paid,
        balance_due = 0,
        deposit_label = 'Full payment',
        updated_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_payment_status_change
  AFTER UPDATE OF payment_status ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_payment_config_on_status_change();
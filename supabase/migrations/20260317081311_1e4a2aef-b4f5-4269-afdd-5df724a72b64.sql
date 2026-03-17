
-- Payment config table (per-user, admin-managed)
CREATE TABLE public.payment_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  programme_total numeric NOT NULL DEFAULT 50000,
  deposit_paid numeric NOT NULL DEFAULT 15000,
  deposit_label text NOT NULL DEFAULT 'Slot confirmation fee',
  balance_due numeric GENERATED ALWAYS AS (programme_total - deposit_paid) STORED,
  payment_deadline date,
  payment_link text,
  installment_link text,
  is_deposit_verified boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment_config" ON public.payment_config
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own payment_config" ON public.payment_config
  FOR SELECT TO public USING (auth.uid() = user_id);

-- Payment defaults table (edition-level templates)
CREATE TABLE public.payment_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id uuid NOT NULL UNIQUE REFERENCES public.editions(id) ON DELETE CASCADE,
  programme_total numeric NOT NULL DEFAULT 50000,
  default_deposit numeric NOT NULL DEFAULT 15000,
  deposit_label text NOT NULL DEFAULT 'Slot confirmation fee',
  default_deadline date,
  payment_link text,
  installment_link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payment_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment_defaults" ON public.payment_defaults
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view payment_defaults" ON public.payment_defaults
  FOR SELECT TO authenticated USING (true);

-- Auto-update updated_at on payment_config
CREATE TRIGGER update_payment_config_updated_at
  BEFORE UPDATE ON public.payment_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

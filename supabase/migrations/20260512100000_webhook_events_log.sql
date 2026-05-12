-- webhook_events_log — audit trail for every inbound Resend webhook event.
-- Records both verified and rejected events so we can detect replay attacks
-- and debug delivery issues without losing data.

CREATE TABLE IF NOT EXISTS public.webhook_events_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at         timestamptz DEFAULT now(),
  source_ip           text,
  svix_id             text,           -- svix-id header — unique per event
  svix_timestamp      text,           -- svix-timestamp header — for replay protection
  event_type          text,           -- e.g. email.delivered
  resend_message_id   text,           -- data.email_id from payload
  verification_status text NOT NULL,  -- 'verified' | 'rejected' | 'skipped'
  raw_payload         jsonb,
  processing_error    text,
  created_at          timestamptz DEFAULT now()
);

-- Most common queries: recent events and filtering by status/message
CREATE INDEX IF NOT EXISTS idx_webhook_log_received
  ON public.webhook_events_log(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_log_status
  ON public.webhook_events_log(verification_status);
CREATE INDEX IF NOT EXISTS idx_webhook_log_message_id
  ON public.webhook_events_log(resend_message_id);
CREATE INDEX IF NOT EXISTS idx_webhook_log_svix_id
  ON public.webhook_events_log(svix_id);

-- RLS: admins only (read + insert from service role in edge function)
ALTER TABLE public.webhook_events_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_webhook_log"
  ON public.webhook_events_log
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

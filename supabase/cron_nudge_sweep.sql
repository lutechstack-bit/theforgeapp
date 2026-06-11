-- Schedule the daily nudge sweep. Run in the Lovable SQL editor AFTER:
--   (1) running 20260611150000_nudge_engine.sql,
--   (2) adding edge secret  CRON_KEY = bccaea516834870b8046bc41ac4a741a53302866f78f8aae
--   (3) deploying the notification-nudge-sweep function.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 10:00 IST == 04:30 UTC. Body is empty so each rule's own test_only flag
-- governs (test_only=true → admins only). Flip rules live later (see bottom).
select cron.schedule('nudge-daily-sweep', '30 4 * * *', $$
  select net.http_post(
    url     := 'https://tprvyhzpecopryylxznm.supabase.co/functions/v1/notification-nudge-sweep',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-key','bccaea516834870b8046bc41ac4a741a53302866f78f8aae'),
    body    := '{}'::jsonb
  );
$$);

-- To GO LIVE (send to real students, not just admins), run when ready:
--   UPDATE public.notification_rules SET test_only = false WHERE name LIKE 'Nudge:%';
-- To unschedule:  select cron.unschedule('nudge-daily-sweep');

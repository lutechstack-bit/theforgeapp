-- Enable REPLICA IDENTITY FULL for complete row data on updates
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;

-- Add community_messages to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Also enable for cohort_groups
ALTER TABLE public.cohort_groups REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cohort_groups;
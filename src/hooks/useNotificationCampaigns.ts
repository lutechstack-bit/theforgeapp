import { useQuery } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;

export function useNotificationCampaigns(opts?: { limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['notif-campaigns', opts?.limit, opts?.status],
    queryFn: async () => {
      let q = supabase
        .from('notification_campaigns')
        .select('*, template:notification_templates(title,category), audience:notification_audiences(label)')
        .order('created_at', { ascending: false });
      if (opts?.status && opts.status !== 'all') q = q.eq('status', opts.status);
      if (opts?.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useNotificationCampaign(id?: string) {
  return useQuery({
    queryKey: ['notif-campaign', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_campaigns')
        .select('*, template:notification_templates(title,category,body), audience:notification_audiences(label)')
        .eq('id', id).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCampaignDeliveries(campaignId?: string, opts?: { limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['notif-deliveries', campaignId, opts?.status, opts?.limit],
    enabled: !!campaignId,
    queryFn: async () => {
      let q = supabase.from('notification_deliveries').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false });
      if (opts?.status && opts.status !== 'all') q = q.eq('status', opts.status);
      if (opts?.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

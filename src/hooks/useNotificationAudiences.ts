import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const supabase = supabaseTyped as any;

export function useNotificationAudiences() {
  return useQuery({
    queryKey: ['notif-audiences'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notification_audiences').select('*').order('is_system', { ascending: false }).order('label');
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateNotificationAudience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const { data, error } = await supabase.from('notification_audiences').insert({ ...input, is_system: false }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-audiences'] }); toast.success('Audience created'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateNotificationAudience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const { error } = await supabase.from('notification_audiences').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-audiences'] }); toast.success('Audience saved'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteNotificationAudience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notification_audiences').delete().eq('id', id).eq('is_system', false);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-audiences'] }); toast.success('Audience deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

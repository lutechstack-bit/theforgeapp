import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const supabase = supabaseTyped as any;

export function useNotificationRules() {
  return useQuery({
    queryKey: ['notif-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_rules')
        .select('*, template:notification_templates(id,title,category), audience:notification_audiences(id,label,estimated_size_cache), trigger:notification_triggers(id,label,event_type)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const { data, error } = await supabase.from('notification_rules').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-rules'] }); toast.success('Rule created'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const { error } = await supabase.from('notification_rules').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-rules'] }); toast.success('Rule saved'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('notification_rules').update({ is_active, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notif-rules'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notification_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-rules'] }); toast.success('Rule deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

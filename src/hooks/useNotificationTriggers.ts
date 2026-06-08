import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const supabase = supabaseTyped as any;

export function useNotificationTriggers() {
  return useQuery({
    queryKey: ['notif-triggers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notification_triggers').select('*').order('event_type').order('label');
      if (error) throw error;
      return data || [];
    },
  });
}

export function useToggleNotificationTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('notification_triggers').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notif-triggers'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

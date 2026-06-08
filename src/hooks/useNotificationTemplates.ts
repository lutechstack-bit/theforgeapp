import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const supabase = supabaseTyped as any;

/** Extract [TOKEN_NAME] patterns from text, returns unique list. */
export function parseTokens(...texts: (string | undefined)[]): string[] {
  const set = new Set<string>();
  for (const t of texts) {
    for (const m of (t || '').matchAll(/\[([A-Z0-9_]+)\]/g)) set.add(m[1]);
  }
  return [...set];
}

export function useNotificationTemplates(filters?: { category?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['notif-templates', filters?.category, filters?.isActive],
    queryFn: async () => {
      let q = supabase.from('notification_templates').select('*').order('category').order('title');
      if (filters?.category && filters.category !== 'all') q = q.eq('category', filters.category);
      if (filters?.isActive !== undefined) q = q.eq('is_active', filters.isActive);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useNotificationTemplate(id?: string) {
  return useQuery({
    queryKey: ['notif-template', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('notification_templates').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateNotificationTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { ...input, tokens_used: parseTokens(input.title, input.body, input.deep_link), created_by: user?.id ?? null };
      const { data, error } = await supabase.from('notification_templates').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-templates'] }); toast.success('Template created'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateNotificationTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const payload = { ...input, tokens_used: parseTokens(input.title, input.body, input.deep_link), updated_at: new Date().toISOString() };
      const { error } = await supabase.from('notification_templates').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-templates'] }); toast.success('Template saved'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleNotificationTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('notification_templates').update({ is_active, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notif-templates'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteNotificationTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notification_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-templates'] }); toast.success('Template deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

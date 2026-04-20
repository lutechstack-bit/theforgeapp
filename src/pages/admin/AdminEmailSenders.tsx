import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AtSign, ExternalLink, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminEmailSenders() {
  const queryClient = useQueryClient();

  const { data: senders = [], isLoading } = useQuery({
    queryKey: ['admin-email-senders-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sender_identities')
        .select('*')
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      const { error } = await supabase.from('email_sender_identities').update({ is_active: next }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { next }) => {
      toast.success(next ? 'Sender activated' : 'Sender deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin-email-senders-full'] });
      queryClient.invalidateQueries({ queryKey: ['admin-email-senders'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      // Clear existing default first (only one allowed by unique index).
      await supabase.from('email_sender_identities').update({ is_default: false }).eq('is_default', true);
      const { error } = await supabase.from('email_sender_identities').update({ is_default: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Default sender updated');
      queryClient.invalidateQueries({ queryKey: ['admin-email-senders-full'] });
      queryClient.invalidateQueries({ queryKey: ['admin-email-senders'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AtSign className="h-6 w-6 text-primary" /> Sender Identities
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          The From addresses we can send from. Adding more senders is a DB insert for now — admin add-form ships in Phase 1.5.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 px-4 text-xs text-muted-foreground flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            Verify your sending domain at{' '}
            <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              Resend dashboard <ExternalLink className="h-3 w-3" />
            </a>
            {' '}before sending real emails. The domain must show "Verified" there — this page can't check it automatically.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Loading…</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {senders.map(s => (
            <Card key={s.id} className={s.is_default ? 'border-primary/40' : ''}>
              <CardContent className="py-3 px-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{s.display_name}</p>
                    {s.is_default && <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 text-[10px]">Default</Badge>}
                    {!s.is_active && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{s.email}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    Domain: {s.domain} · Created {s.created_at ? format(new Date(s.created_at), 'MMM d, yyyy') : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {!s.is_default && s.is_active && (
                    <button
                      onClick={() => setDefaultMutation.mutate(s.id)}
                      disabled={setDefaultMutation.isPending}
                      className="text-xs text-primary hover:underline"
                    >
                      Set default
                    </button>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={s.is_active}
                      disabled={s.is_default && s.is_active} // can't deactivate the default
                      onCheckedChange={(v) => toggleActiveMutation.mutate({ id: s.id, next: v })}
                    />
                    <span className="text-[10px] text-muted-foreground">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { AtSign, ExternalLink, Plus, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AddSenderForm {
  display_name: string;
  email: string;
  reply_to_email: string;
}

const EMPTY_FORM: AddSenderForm = { display_name: '', email: '', reply_to_email: '' };

function extractDomain(email: string) {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
}

export default function AdminEmailSenders() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddSenderForm>(EMPTY_FORM);

  const addMutation = useMutation({
    mutationFn: async () => {
      const email = form.email.trim().toLowerCase();
      const domain = extractDomain(email);
      if (!form.display_name.trim()) throw new Error('Display name is required');
      if (!email.includes('@') || !domain) throw new Error('Enter a valid email address');
      const { error } = await supabase.from('email_sender_identities').insert({
        display_name: form.display_name.trim(),
        email,
        domain,
        reply_to_email: form.reply_to_email.trim() || null,
        is_active: false, // inactive until domain is verified in Resend
        is_default: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Sender added — verify the domain in Resend before activating');
      queryClient.invalidateQueries({ queryKey: ['admin-email-senders-full'] });
      queryClient.invalidateQueries({ queryKey: ['admin-email-senders'] });
      setForm(EMPTY_FORM);
      setShowAdd(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

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
      {/* Add sender dialog */}
      <Dialog open={showAdd} onOpenChange={(o) => { setShowAdd(o); if (!o) setForm(EMPTY_FORM); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sender Identity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label>Display name *</Label>
              <Input
                value={form.display_name}
                onChange={(e) => setForm(f => ({ ...f, display_name: e.target.value }))}
                placeholder="The Forge"
              />
            </div>
            <div className="space-y-1.5">
              <Label>From email address *</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="noreply@theforge.in"
                type="email"
              />
              {form.email && extractDomain(form.email) && (
                <p className="text-[11px] text-muted-foreground">
                  Domain: <span className="font-mono">{extractDomain(form.email)}</span>
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Reply-to address <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                value={form.reply_to_email}
                onChange={(e) => setForm(f => ({ ...f, reply_to_email: e.target.value }))}
                placeholder="hello@theforge.in"
                type="email"
              />
            </div>
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-400 flex items-start gap-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                The sender is added as <strong>inactive</strong>. Verify the domain at{' '}
                <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  resend.com/domains
                </a>{' '}
                first, then activate it here.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
              {addMutation.isPending ? 'Adding…' : 'Add sender'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AtSign className="h-6 w-6 text-primary" /> Sender Identities
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            The From addresses we can send from. New senders are inactive until the domain is verified in Resend.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" /> Add sender
        </Button>
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

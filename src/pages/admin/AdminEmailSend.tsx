import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { PreviewIframe } from '@/components/admin/email/PreviewIframe';
import { buildMergeValues, extractTags, resolveMergeTags } from '@/lib/mergeTags';
import { Send, Users, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const COHORT_TYPES = ['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'] as const;

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  edition_id: string | null;
}

export default function AdminEmailSend() {
  const navigate = useNavigate();

  const [templateId, setTemplateId] = useState<string>('');
  const [tab, setTab] = useState<'filter' | 'individuals'>('filter');

  // Filter tab
  const [editionIds, setEditionIds] = useState<string[]>([]);
  const [cohortTypes, setCohortTypes] = useState<string[]>([]);

  // Individuals tab
  const [emailsInput, setEmailsInput] = useState('');

  // Per-recipient variables (e.g. temp passwords)
  const [perRecipientInput, setPerRecipientInput] = useState('');

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Data ---------------------------------------------------------------
  const { data: templates = [] } = useQuery({
    queryKey: ['admin-email-templates', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, html_content, default_sender_id, category, cohort_types, forge_mode')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: editions = [] } = useQuery({
    queryKey: ['admin-editions-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name, cohort_type, forge_start_date')
        .eq('is_archived', false)
        .order('forge_start_date', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data || [];
    },
  });

  const template = useMemo(
    () => templates.find(t => t.id === templateId) || null,
    [templates, templateId]
  );

  const requiredTags = useMemo(
    () => (template ? extractTags(`${template.subject} ${template.html_content}`) : []),
    [template]
  );
  const needsTempPassword = requiredTags.includes('user.temp_password');

  // Filter recipients --------------------------------------------------
  const filterQuery = useMemo(() => {
    const params = {
      editionIds: editionIds.length > 0 ? editionIds : null,
      cohortTypes: cohortTypes.length > 0 ? cohortTypes : null,
    };
    return params;
  }, [editionIds, cohortTypes]);

  const { data: filterRecipients = [] } = useQuery({
    queryKey: ['admin-email-send-filter', filterQuery],
    queryFn: async (): Promise<Profile[]> => {
      // At least one filter must be set to avoid accidentally returning every profile.
      if (!filterQuery.editionIds && !filterQuery.cohortTypes) return [];
      let q = supabase
        .from('profiles')
        .select('id, full_name, email, phone, city, edition_id')
        .eq('is_admin', false)
        .not('email', 'is', null);
      if (filterQuery.editionIds) q = q.in('edition_id', filterQuery.editionIds);
      if (filterQuery.cohortTypes) {
        // cohort_type lives on editions, so we filter by joining via edition_id
        const { data: matching } = await supabase
          .from('editions').select('id').in('cohort_type', filterQuery.cohortTypes);
        const ids = (matching || []).map(e => e.id);
        if (ids.length === 0) return [];
        q = q.in('edition_id', ids);
      }
      const { data, error } = await q.order('full_name');
      if (error) throw error;
      return (data || []) as Profile[];
    },
    enabled: tab === 'filter',
  });

  // Parse individual emails
  const parsedEmails = useMemo(() => {
    return Array.from(
      new Set(
        emailsInput
          .split(/[\s,;]+/)
          .map(s => s.trim().toLowerCase())
          .filter(s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
      )
    );
  }, [emailsInput]);

  // Resolved recipient list (what we'll send to)
  const recipients = useMemo(() => {
    if (tab === 'filter') {
      return filterRecipients.map(r => ({
        id: r.id,
        email: (r.email || '').toLowerCase(),
        name: r.full_name || r.email || '',
      }));
    }
    return parsedEmails.map(email => ({ id: null, email, name: email }));
  }, [tab, filterRecipients, parsedEmails]);

  // Parse per-recipient `email,temp_password` lines
  const perRecipientMap = useMemo(() => {
    const out: Record<string, Record<string, string>> = {};
    for (const raw of perRecipientInput.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const [emailPart, pwd] = line.split(/[,;\t]/).map(s => s && s.trim());
      if (!emailPart || !pwd) continue;
      out[emailPart.toLowerCase()] = { temp_password: pwd };
    }
    return out;
  }, [perRecipientInput]);

  // Preview first recipient
  const previewHtml = useMemo(() => {
    if (!template || recipients.length === 0) return '';
    const first = recipients[0];
    const profile = tab === 'filter'
      ? filterRecipients.find(r => r.id === first.id) || null
      : null;
    const values = buildMergeValues(profile, null, perRecipientMap[first.email] || {});
    return resolveMergeTags(template.html_content, values).rendered;
  }, [template, recipients, filterRecipients, tab, perRecipientMap]);

  const unresolvedInPreview = useMemo(() => {
    if (!template || recipients.length === 0) return [];
    const first = recipients[0];
    const profile = tab === 'filter'
      ? filterRecipients.find(r => r.id === first.id) || null
      : null;
    const values = buildMergeValues(profile, null, perRecipientMap[first.email] || {});
    const { unresolvedTags: subTags } = resolveMergeTags(template.subject, values);
    const { unresolvedTags: htmlTags } = resolveMergeTags(template.html_content, values);
    return Array.from(new Set([...subTags, ...htmlTags]));
  }, [template, recipients, filterRecipients, tab, perRecipientMap]);

  // Send ---------------------------------------------------------------
  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!template) throw new Error('Pick a template');
      if (recipients.length === 0) throw new Error('No recipients selected');

      const body: any = { templateId: template.id };
      if (tab === 'filter') {
        body.recipientUserIds = recipients.map(r => r.id).filter(Boolean);
      } else {
        body.recipientEmails = recipients.map(r => r.email);
      }

      // Pass per-recipient overrides keyed by email (and by id for filter tab)
      const keyed: Record<string, Record<string, string>> = {};
      for (const r of recipients) {
        const v = perRecipientMap[r.email];
        if (!v) continue;
        keyed[r.email] = v;
        if (r.id) keyed[r.id] = v;
      }
      if (Object.keys(keyed).length > 0) body.overrides = { perRecipientVariables: keyed };

      const { data, error } = await supabase.functions.invoke('send-email', { body });
      if (error) throw error;
      if (!data) throw new Error('No response from send-email');
      return data;
    },
    onSuccess: (data: any) => {
      setConfirmOpen(false);
      if (data.failureCount > 0) {
        toast.error(
          `${data.successCount} sent, ${data.failureCount} failed`,
          { description: data.failures?.slice(0, 3).map((f: any) => `${f.recipient}: ${f.reason}`).join('\n') }
        );
      } else {
        toast.success(`All ${data.successCount} emails sent ✓`);
      }
      navigate('/admin/email/history');
    },
    onError: (e: Error) => {
      setConfirmOpen(false);
      toast.error(e.message);
    },
  });

  const toggleEditionId = (id: string) => {
    setEditionIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleCohort = (c: string) => {
    setCohortTypes(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const canSend = template !== null && recipients.length > 0 && (!needsTempPassword || Object.keys(perRecipientMap).length > 0);

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Send className="h-6 w-6 text-primary" /> Compose & Send
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pick a template, choose recipients, review, and send.
        </p>
      </div>

      {/* Step 1 — template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">1. Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger><SelectValue placeholder="Pick a template…" /></SelectTrigger>
            <SelectContent>
              {templates.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} {t.category && <span className="text-muted-foreground"> — {t.category}</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {template && (
            <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
              <p><strong className="text-foreground">Subject:</strong> {template.subject}</p>
              <p><strong className="text-foreground">Tags used:</strong> {requiredTags.map(t => `{{${t}}}`).join(', ') || 'none'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2 — recipients */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" /> 2. Recipients
            <Badge variant="outline" className="ml-2">
              {recipients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="filter">Filter</TabsTrigger>
              <TabsTrigger value="individuals">Individuals</TabsTrigger>
            </TabsList>

            <TabsContent value="filter" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Editions</Label>
                <div className="flex flex-wrap gap-1.5">
                  {editions.map(e => (
                    <Badge
                      key={e.id}
                      variant="outline"
                      onClick={() => toggleEditionId(e.id)}
                      className={`cursor-pointer select-none py-1 px-2.5 ${
                        editionIds.includes(e.id)
                          ? 'bg-primary/20 text-primary border-primary/50'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {e.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Cohort types</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COHORT_TYPES.map(c => (
                    <Badge
                      key={c}
                      variant="outline"
                      onClick={() => toggleCohort(c)}
                      className={`cursor-pointer select-none py-1 px-2.5 ${
                        cohortTypes.includes(c)
                          ? 'bg-primary/20 text-primary border-primary/50'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                {recipients.length} match{recipients.length === 1 ? '' : 'es'}. Pick at least one edition OR cohort.
              </p>
            </TabsContent>

            <TabsContent value="individuals" className="space-y-2 pt-3">
              <Label className="text-xs">Emails (comma- or newline-separated)</Label>
              <Textarea
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                placeholder="one@example.com, two@example.com&#10;three@example.com"
                rows={4}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">{parsedEmails.length} valid emails parsed.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Step 3 — per-recipient variables (only if template needs them) */}
      {needsTempPassword && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              3. Per-recipient values for {`{{user.temp_password}}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Paste <code>email,password</code> lines (the same shape as the E17 contacts CSV).
              Each recipient needs a matching line or they'll be skipped.
            </p>
            <Textarea
              value={perRecipientInput}
              onChange={(e) => setPerRecipientInput(e.target.value)}
              placeholder="naren2047@gmail.com,Narendra@Forge!&#10;nasarmuhammed@gmail.com,Nasar@Forge!"
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              {Object.keys(perRecipientMap).length} of {recipients.length} recipients have a password mapped.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4 — Preview + Send */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" /> 4. Review & send
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {template && recipients.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Sending to <strong>{recipients.length}</strong> recipients — preview shows first one's values
              </div>
              {unresolvedInPreview.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    Some merge tags will be empty for the first recipient:{' '}
                    <code className="font-mono">{unresolvedInPreview.join(', ')}</code>.
                    Check per-recipient overrides or profile data.
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-border/40 overflow-hidden">
                <PreviewIframe html={previewHtml} className="w-full h-[500px] bg-white" />
              </div>
              <div className="flex justify-end">
                <Button
                  size="lg"
                  disabled={!canSend || sendMutation.isPending}
                  onClick={() => setConfirmOpen(true)}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send to {recipients.length} recipient{recipients.length === 1 ? '' : 's'}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Pick a template and at least one recipient to see the preview.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm send</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              You're about to send "<strong className="text-foreground">{template?.name}</strong>"
              to <strong className="text-foreground">{recipients.length}</strong> recipients.
            </p>
            <p>This cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={sendMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending} className="gap-1.5">
              <Send className="h-4 w-4" />
              {sendMutation.isPending ? 'Sending…' : 'Send now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

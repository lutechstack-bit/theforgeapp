import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Copy, Eye, Send, Archive, Edit, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  category: string | null;
  cohort_types: string[] | null;
  forge_mode: string | null;
  is_active: boolean;
  current_version: number;
  updated_at: string;
  html_content: string;
}

export default function AdminEmailTemplates() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [testDialog, setTestDialog] = useState<{ open: boolean; template: EmailTemplate | null }>({ open: false, template: null });
  const [testEmail, setTestEmail] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['admin-email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as EmailTemplate[];
    },
  });

  const categories = useMemo(
    () => Array.from(new Set(templates.map(t => t.category).filter(Boolean))) as string[],
    [templates]
  );

  const filtered = useMemo(() => {
    return templates.filter(t => {
      if (statusFilter === 'active' && !t.is_active) return false;
      if (statusFilter === 'archived' && t.is_active) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q) && !t.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [templates, search, categoryFilter, statusFilter]);

  // Duplicate ----------------------------------------------------------------
  const duplicateMutation = useMutation({
    mutationFn: async (src: EmailTemplate) => {
      const { data: newRow, error } = await supabase
        .from('email_templates')
        .insert({
          name: `${src.name} (Copy)`,
          slug: `${src.slug}-copy-${Date.now().toString(36)}`,
          subject: src.subject,
          html_content: src.html_content,
          category: src.category,
          cohort_types: src.cohort_types,
          forge_mode: src.forge_mode,
          is_active: false,
          current_version: 1,
        })
        .select('id')
        .single();
      if (error) throw error;
      return newRow;
    },
    onSuccess: (row) => {
      toast.success('Template duplicated');
      queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] });
      if (row?.id) navigate(`/admin/email/templates/${row.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Archive / restore --------------------------------------------------------
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      const { error } = await supabase.from('email_templates').update({ is_active: next }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { next }) => {
      toast.success(next ? 'Template restored' : 'Template archived');
      queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Send test ---------------------------------------------------------------
  const sendTestMutation = useMutation({
    mutationFn: async ({ templateId, email }: { templateId: string; email: string }) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { templateId, recipientEmails: [email] },
      });
      if (error) throw error;
      if (data?.failureCount > 0) {
        throw new Error(data.failures?.[0]?.reason || 'Send failed');
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Test email queued — check the inbox in ~30 seconds');
      setTestDialog({ open: false, template: null });
      setTestEmail('');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Templates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Author reusable email templates with merge tags.</p>
        </div>
        <Button className="gap-1.5" onClick={() => navigate('/admin/email/templates/new')}>
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, subject, slug…"
            className="pl-8 h-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Loading…</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto" />
            <p className="text-sm text-muted-foreground">No templates yet.</p>
            <Button size="sm" onClick={() => navigate('/admin/email/templates/new')}>
              <Plus className="h-4 w-4 mr-1" /> Create your first template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <Card key={t.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-3 px-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">{t.name}</p>
                    {t.category && <Badge variant="outline" className="text-[10px] py-0 px-1.5">{t.category}</Badge>}
                    {t.forge_mode && <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/30">{t.forge_mode}</Badge>}
                    {(t.cohort_types || []).map(c => (
                      <Badge key={c} variant="outline" className="text-[10px] py-0 px-1.5">{c}</Badge>
                    ))}
                    {!t.is_active && <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-muted/40">Archived</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{t.subject}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    /{t.slug} · v{t.current_version} · Updated {format(new Date(t.updated_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    size="icon" variant="ghost" className="h-8 w-8"
                    title="Send test"
                    onClick={() => { setTestDialog({ open: true, template: t }); setTestEmail(''); }}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="h-8 w-8"
                    title="Duplicate"
                    onClick={() => duplicateMutation.mutate(t)}
                    disabled={duplicateMutation.isPending}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="h-8 w-8"
                    title={t.is_active ? 'Archive' : 'Restore'}
                    onClick={() => toggleActiveMutation.mutate({ id: t.id, next: !t.is_active })}
                    disabled={toggleActiveMutation.isPending}
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm" variant="outline" className="h-8 gap-1"
                    onClick={() => navigate(`/admin/email/templates/${t.id}`)}
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Test send dialog */}
      <Dialog open={testDialog.open} onOpenChange={(open) => !open && setTestDialog({ open: false, template: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send test: {testDialog.template?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Renders the template with a sample profile and sends to one email address.
              Merge values come from a real active student so the preview is realistic.
            </p>
            <Input
              type="email"
              placeholder="your-email@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialog({ open: false, template: null })}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                testDialog.template && sendTestMutation.mutate({
                  templateId: testDialog.template.id,
                  email: testEmail.trim(),
                })
              }
              disabled={!testEmail.trim() || !testDialog.template || sendTestMutation.isPending}
            >
              {sendTestMutation.isPending ? 'Sending…' : 'Send test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HtmlEditorPane } from '@/components/admin/email/HtmlEditorPane';
import { extractTags } from '@/lib/mergeTags';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['onboarding', 'reminder', 'announcement', 'alumni'] as const;
const COHORT_TYPES = ['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'] as const;
const FORGE_MODES = ['PRE_FORGE', 'DURING_FORGE', 'POST_FORGE'] as const;

interface FormState {
  name: string;
  slug: string;
  subject: string;
  preview_text: string;
  html_content: string;
  category: string;
  cohort_types: string[];
  forge_mode: string;
  default_sender_id: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: '',
  slug: '',
  subject: '',
  preview_text: '',
  html_content: '',
  category: '',
  cohort_types: [],
  forge_mode: '',
  default_sender_id: '',
  is_active: true,
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

export default function AdminEmailTemplateEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [changeNote, setChangeNote] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Load senders
  const { data: senders = [] } = useQuery({
    queryKey: ['admin-email-senders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sender_identities')
        .select('id, email, display_name, is_active, is_default')
        .eq('is_active', true)
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Load existing template if editing
  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin-email-template', id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase.from('email_templates').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        slug: existing.slug || '',
        subject: existing.subject || '',
        preview_text: existing.preview_text || '',
        html_content: existing.html_content || '',
        category: existing.category || '',
        cohort_types: existing.cohort_types || [],
        forge_mode: existing.forge_mode || '',
        default_sender_id: existing.default_sender_id || '',
        is_active: existing.is_active ?? true,
      });
      setSlugManuallyEdited(true);
    } else if (isNew && senders.length > 0 && !form.default_sender_id) {
      // Default to the seeded default sender for new templates
      const defaultSender = senders.find(s => s.is_default) || senders[0];
      setForm(f => ({ ...f, default_sender_id: defaultSender.id }));
    }
  }, [existing, isNew, senders.length]);

  // Sample profile for the preview iframe
  const { data: sample } = useQuery({
    queryKey: ['admin-email-sample-recipient'],
    queryFn: async () => {
      const { data: p } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, city, edition_id')
        .eq('is_admin', false)
        .not('full_name', 'is', null)
        .limit(1)
        .maybeSingle();
      let edition = null;
      if (p?.edition_id) {
        const { data: e } = await supabase
          .from('editions')
          .select('name, cohort_type, city, forge_start_date, forge_end_date')
          .eq('id', p.edition_id)
          .maybeSingle();
        edition = e;
      }
      return { profile: p, edition };
    },
    staleTime: 5 * 60 * 1000,
  });

  const usedTags = useMemo(
    () => extractTags(`${form.subject} ${form.html_content}`),
    [form.subject, form.html_content]
  );

  // Save -----------------------------------------------------------------
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.subject.trim() || !form.html_content.trim()) {
        throw new Error('Name, subject, and HTML content are required');
      }
      if (!form.default_sender_id) throw new Error('Pick a default sender');

      const payload: any = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        subject: form.subject,
        preview_text: form.preview_text || null,
        html_content: form.html_content,
        variables: usedTags,
        category: form.category || null,
        cohort_types: form.cohort_types.length > 0 ? form.cohort_types : null,
        forge_mode: form.forge_mode || null,
        default_sender_id: form.default_sender_id,
        is_active: form.is_active,
      };

      if (isNew) {
        payload.created_by = user?.id;
        payload.current_version = 1;
        const { data: created, error } = await supabase
          .from('email_templates')
          .insert(payload)
          .select('id, current_version')
          .single();
        if (error) throw error;
        // seed v1 snapshot
        await supabase.from('email_template_versions').insert({
          template_id: created.id,
          version: 1,
          subject: form.subject,
          preview_text: form.preview_text || null,
          html_content: form.html_content,
          variables: usedTags,
          changed_by: user?.id,
          change_note: changeNote || 'initial version',
        });
        return created;
      } else {
        // Create new version atop whatever current_version is
        const nextVersion = (existing?.current_version ?? 1) + 1;
        payload.current_version = nextVersion;
        const { error } = await supabase.from('email_templates').update(payload).eq('id', id);
        if (error) throw error;
        await supabase.from('email_template_versions').insert({
          template_id: id,
          version: nextVersion,
          subject: form.subject,
          preview_text: form.preview_text || null,
          html_content: form.html_content,
          variables: usedTags,
          changed_by: user?.id,
          change_note: changeNote || null,
        });
        return { id, current_version: nextVersion };
      }
    },
    onSuccess: (res) => {
      toast.success(isNew ? 'Template created' : 'Template saved as new version');
      queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-email-template', res.id] });
      setChangeNote('');
      if (isNew && res?.id) navigate(`/admin/email/templates/${res.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const toggleCohort = (c: string) => {
    setForm(f => ({
      ...f,
      cohort_types: f.cohort_types.includes(c)
        ? f.cohort_types.filter(x => x !== c)
        : [...f.cohort_types, c],
    }));
  };

  if (!isNew && isLoading) {
    return <div className="p-6 text-muted-foreground">Loading template…</div>;
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/email/templates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? 'New Template' : `Edit: ${form.name || 'Template'}`}
            </h1>
            {!isNew && existing?.current_version && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Currently v{existing.current_version}. Saving creates v{existing.current_version + 1}.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving…' : isNew ? 'Create Template' : 'Save new version'}
          </Button>
        </div>
      </div>

      {/* Form fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                const next = e.target.value;
                setField('name', next);
                if (!slugManuallyEdited) setField('slug', slugify(next));
              }}
              placeholder="E.g. E17 Welcome Email"
            />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => {
                setField('slug', slugify(e.target.value));
                setSlugManuallyEdited(true);
              }}
              placeholder="e17-welcome"
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Subject line *</Label>
            <Input
              value={form.subject}
              onChange={(e) => setField('subject', e.target.value)}
              placeholder="Welcome to {{app.name}} — your credentials inside"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Preview text (shown in inbox after subject)</Label>
            <Input
              value={form.preview_text}
              onChange={(e) => setField('preview_text', e.target.value)}
              placeholder="Your login, your roadmap, and what happens next."
            />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={form.category || 'none'} onValueChange={(v) => setField('category', v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Forge mode (optional)</Label>
            <Select value={form.forge_mode || 'any'} onValueChange={(v) => setField('forge_mode', v === 'any' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Any mode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any mode</SelectItem>
                {FORGE_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Cohort types (optional)</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {COHORT_TYPES.map(c => (
                <Badge
                  key={c}
                  variant="outline"
                  onClick={() => toggleCohort(c)}
                  className={`cursor-pointer select-none px-2.5 py-1 ${
                    form.cohort_types.includes(c)
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {c}
                </Badge>
              ))}
              <span className="text-[10px] text-muted-foreground self-center ml-2">
                Leave empty to target all cohorts.
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Default sender *</Label>
            <Select value={form.default_sender_id} onValueChange={(v) => setField('default_sender_id', v)}>
              <SelectTrigger><SelectValue placeholder="Pick sender…" /></SelectTrigger>
              <SelectContent>
                {senders.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.display_name} &lt;{s.email}&gt; {s.is_default && '(default)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 flex items-end gap-3">
            <div className="flex items-center gap-2 pb-1">
              <Switch checked={form.is_active} onCheckedChange={(v) => setField('is_active', v)} />
              <Label className="cursor-pointer">Active</Label>
            </div>
          </div>
          {!isNew && (
            <div className="space-y-1 md:col-span-2">
              <Label>Change note (optional)</Label>
              <Textarea
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="What changed in this version?"
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* HTML editor + preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">HTML body &amp; preview</CardTitle>
        </CardHeader>
        <CardContent>
          <HtmlEditorPane
            html={form.html_content}
            onChange={(html) => setField('html_content', html)}
            sampleProfile={sample?.profile}
            sampleEdition={sample?.edition}
          />
        </CardContent>
      </Card>
    </div>
  );
}

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
import { PreviewIframe } from '@/components/admin/email/PreviewIframe';
import { MergeTagHelper } from '@/components/admin/email/MergeTagHelper';
import { extractTags, buildMergeValues, resolveMergeTags } from '@/lib/mergeTags';
import { wrapInForgeShell, simpleBodyToHtml } from '@/lib/emailShell';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, History, RotateCcw, Save, Wand2, Code2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['onboarding', 'reminder', 'announcement', 'alumni'] as const;
const COHORT_TYPES = ['FFM', 'FW', 'FC', 'FAI'] as const;
const FORGE_MODES = ['PRE_FORGE', 'DURING_FORGE', 'POST_FORGE'] as const;

type AuthorMode = 'simple' | 'advanced';

// Simple-mode source is stashed in a hidden HTML comment at the top of
// html_content so the template round-trips back into the Simple editor.
// Email clients ignore comments, so it's invisible to recipients.
const SIMPLE_MARKER = 'FORGE_SIMPLE_V1:';

interface SimpleFields {
  heading: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
}

const EMPTY_SIMPLE: SimpleFields = { heading: '', body: '', ctaText: '', ctaUrl: '' };

function encodeSimpleSource(f: SimpleFields): string {
  // base64 of UTF-8 JSON — safe inside an HTML comment
  return btoa(unescape(encodeURIComponent(JSON.stringify(f))));
}

function decodeSimpleSource(html: string): SimpleFields | null {
  const m = html.match(/<!--FORGE_SIMPLE_V1:([A-Za-z0-9+/=]+)-->/);
  if (!m) return null;
  try {
    return { ...EMPTY_SIMPLE, ...JSON.parse(decodeURIComponent(escape(atob(m[1])))) };
  } catch {
    return null;
  }
}

/** Builds the full html_content (marker + branded shell) from Simple fields. */
function buildSimpleHtml(f: SimpleFields): string {
  const shell = wrapInForgeShell(simpleBodyToHtml(f.body), {
    heading: f.heading.trim() || undefined,
    ctaText: f.ctaText.trim() || undefined,
    ctaUrl: f.ctaUrl.trim() || undefined,
  });
  return `<!--${SIMPLE_MARKER}${encodeSimpleSource(f)}-->\n${shell}`;
}

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
  const [showHistory, setShowHistory] = useState(false);
  const [mode, setMode] = useState<AuthorMode>('simple');
  const [simple, setSimple] = useState<SimpleFields>(EMPTY_SIMPLE);

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
      // If this template was authored in Simple mode, restore those fields and
      // reopen in Simple. Otherwise it's hand-written HTML → open in Advanced.
      const decoded = decodeSimpleSource(existing.html_content || '');
      if (decoded) {
        setSimple(decoded);
        setMode('simple');
      } else {
        setMode('advanced');
      }
    } else if (isNew && senders.length > 0 && !form.default_sender_id) {
      // Default to the seeded default sender for new templates
      const defaultSender = senders.find(s => s.is_default) || senders[0];
      setForm(f => ({ ...f, default_sender_id: defaultSender.id }));
    }
  }, [existing, isNew, senders.length]);

  // Version history
  const { data: versions = [] } = useQuery({
    queryKey: ['admin-email-template-versions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_template_versions')
        .select('id, version, subject, preview_text, html_content, change_note, created_at, changed_by')
        .eq('template_id', id)
        .order('version', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !isNew && showHistory,
  });

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

  // In Simple mode, html_content is generated from the simple fields so that
  // save / version / preview all read from one source (form.html_content).
  useEffect(() => {
    if (mode !== 'simple') return;
    const next = buildSimpleHtml(simple);
    setForm((f) => (f.html_content === next ? f : { ...f, html_content: next }));
  }, [mode, simple]);

  const usedTags = useMemo(
    () => extractTags(`${form.subject} ${form.html_content}`),
    [form.subject, form.html_content]
  );

  // Live preview for Simple mode (resolves merge tags with sample data).
  const simplePreviewHtml = useMemo(() => {
    const values = buildMergeValues(sample?.profile || null, sample?.edition || null, {
      'user.temp_password': '[temp_password at send time]',
    });
    return resolveMergeTags(form.html_content, values).rendered;
  }, [form.html_content, sample]);

  const setSimpleField = <K extends keyof SimpleFields>(key: K, value: SimpleFields[K]) => {
    setSimple((s) => ({ ...s, [key]: value }));
  };

  const insertTagIntoBody = (snippet: string) => {
    setSimple((s) => ({ ...s, body: `${s.body}${snippet}` }));
  };

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
          {!isNew && (
            <Button variant="outline" onClick={() => setShowHistory(true)} className="gap-1.5">
              <History className="h-4 w-4" /> History
            </Button>
          )}
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

      {/* Version history sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent className="w-[420px] sm:w-[480px] flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <History className="h-4 w-4" /> Version history
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              Restoring loads that version into the editor — save to make it the new current version.
            </p>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {versions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">No versions yet.</p>
              )}
              {versions.map((v: any) => (
                <div key={v.id} className="px-5 py-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">v{v.version}</span>
                      {v.version === existing?.current_version && (
                        <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 rounded px-1.5 py-0.5 font-medium">
                          current
                        </span>
                      )}
                    </div>
                    {v.version !== existing?.current_version && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            subject: v.subject,
                            preview_text: v.preview_text || '',
                            html_content: v.html_content,
                          }));
                          // Reopen in the mode the restored version was authored in.
                          const decoded = decodeSimpleSource(v.html_content || '');
                          if (decoded) {
                            setSimple(decoded);
                            setMode('simple');
                          } else {
                            setMode('advanced');
                          }
                          setChangeNote(`Restored from v${v.version}`);
                          setShowHistory(false);
                          toast.info(`Loaded v${v.version} into editor — save to publish`);
                        }}
                      >
                        <RotateCcw className="h-3 w-3" /> Restore
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {v.created_at ? format(new Date(v.created_at), 'MMM d, yyyy · h:mm a') : '—'}
                  </p>
                  {v.change_note && (
                    <p className="text-xs text-foreground/80 italic">"{v.change_note}"</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 font-mono truncate">{v.subject}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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

      {/* Body editor + preview */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Email body &amp; preview</CardTitle>
          {/* Simple / Advanced toggle */}
          <div className="inline-flex rounded-lg border border-border/60 p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => setMode('simple')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                mode === 'simple' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wand2 className="h-3.5 w-3.5" /> Simple
            </button>
            <button
              type="button"
              onClick={() => setMode('advanced')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                mode === 'advanced' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" /> Advanced HTML
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {mode === 'simple' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: simple authoring fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Heading</Label>
                  <Input
                    value={simple.heading}
                    onChange={(e) => setSimpleField('heading', e.target.value)}
                    placeholder="Welcome, {{user.first_name}}."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Body</Label>
                  <Textarea
                    value={simple.body}
                    onChange={(e) => setSimpleField('body', e.target.value)}
                    placeholder={
                      'Write in plain text. Leave a blank line between paragraphs.\n\nUse **bold**, [links](https://…), and start lines with "- " for bullets.\n\nMerge tags like {{user.first_name}} and {{edition.name}} work too.'
                    }
                    className="min-h-[320px] leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Plain text. Blank line = new paragraph · <code>**bold**</code> ·
                    <code>[text](url)</code> · <code>- bullet</code>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Button text (optional)</Label>
                    <Input
                      value={simple.ctaText}
                      onChange={(e) => setSimpleField('ctaText', e.target.value)}
                      placeholder="Open The Forge App →"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Button link (optional)</Label>
                    <Input
                      value={simple.ctaUrl}
                      onChange={(e) => setSimpleField('ctaUrl', e.target.value)}
                      placeholder="https://app.forgebylevelup.com"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <MergeTagHelper onInsert={insertTagIntoBody} usedTags={usedTags} />
              </div>
              {/* Right: live preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Live preview</Label>
                  <p className="text-[11px] text-muted-foreground">Rendered with sample data</p>
                </div>
                <PreviewIframe
                  html={simplePreviewHtml}
                  className="w-full h-full min-h-[520px] rounded-lg bg-white border border-border/40"
                />
              </div>
            </div>
          ) : (
            <HtmlEditorPane
              html={form.html_content}
              onChange={(html) => setField('html_content', html)}
              sampleProfile={sample?.profile}
              sampleEdition={sample?.edition}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

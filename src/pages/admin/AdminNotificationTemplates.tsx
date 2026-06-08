import React, { useState } from 'react';
import {
  useNotificationTemplates, useCreateNotificationTemplate, useUpdateNotificationTemplate,
  useToggleNotificationTemplate, useDeleteNotificationTemplate, parseTokens,
} from '@/hooks/useNotificationTemplates';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, FileText, Pencil, Send } from 'lucide-react';

const CATS = [
  { key: 'all', label: 'All' }, { key: 'onboarding', label: 'Onboarding' }, { key: 'payment', label: 'Payment' },
  { key: 'community', label: 'Community' }, { key: 'learn', label: 'Learn' }, { key: 'habit', label: 'Habit' },
  { key: 'post_residency', label: 'Post-residency' },
];

// Every token is auto-filled by the send pipeline from system data — admins never type them.
const AUTO_TOKENS: [string, string][] = [
  ['[FIRST_NAME]', 'profiles.full_name'],
  ['[COHORT_NAME]', 'editions.name'],
  ['[MESSAGE_PREVIEW]', 'community_messages.body (first 50 chars)'],
  ['[MESSAGE_ID]', 'community_messages.id'],
  ['[TIMESTAMP]', 'learn_watch_progress.position_seconds'],
  ['[VIDEO_TITLE]', 'learn_content.title'],
  ['[REMAINING_MIN]', 'computed from learn_watch_progress'],
  ['[COURSE_ID]', 'learn_content.id'],
  ['[STREAK_COUNT]', 'computed from user_activity_logs'],
  ['[TODAYS_FOCUS_TITLE]', "todays_focus.title (user's roadmap stage)"],
];
const CAT_STYLE: Record<string, string> = {
  onboarding: 'bg-sky-500/15 text-sky-400 border-sky-500/30', payment: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  community: 'bg-violet-500/15 text-violet-400 border-violet-500/30', learn: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  habit: 'bg-pink-500/15 text-pink-400 border-pink-500/30', session: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  post_residency: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};
const EMPTY = { key: '', category: 'onboarding', title: '', body: '', deep_link: '', icon: '🔔', require_ky_completion: true, require_login: true, rate_limit_per_user_minutes: 60, is_active: true };

export default function AdminNotificationTemplates() {
  const [cat, setCat] = useState('all');
  const { data: templates = [], isLoading } = useNotificationTemplates({ category: cat });
  const create = useCreateNotificationTemplate();
  const update = useUpdateNotificationTemplate();
  const toggle = useToggleNotificationTemplate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ ...EMPTY, ...t }); setOpen(true); };
  const save = () => {
    const onSuccess = () => setOpen(false);
    if (editing) update.mutate({ id: editing.id, ...form }, { onSuccess });
    else create.mutate(form, { onSuccess });
  };
  const sendTest = async (template_id: string) => {
    toast.loading('Sending test push to your device…', { id: 'sendtest' });
    const { data, error } = await supabase.functions.invoke('send-notification', { body: { templateId: template_id } });
    if (error) { toast.error(error.message || 'Send failed', { id: 'sendtest' }); return; }
    if (data?.error) { toast.error(data.error, { id: 'sendtest' }); return; }
    if (data?.sent > 0) toast.success(`Sent — check your notifications. (${data.delivered} delivered)`, { id: 'sendtest' });
    else toast.warning(data?.note || 'No active subscription — enable notifications first.', { id: 'sendtest' });
  };

  const grouped = templates.reduce((acc: Record<string, any[]>, t: any) => { (acc[t.category] ??= []).push(t); return acc; }, {});
  const tokens = parseTokens(form.title, form.body, form.deep_link);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Notification Templates</h1>
            <p className="text-sm text-muted-foreground">The push messages students receive.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> New Template</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c.key} onClick={() => setCat(c.key)}
            className={cn('rounded-full border px-3 py-1 text-xs transition', cat === c.key ? 'bg-primary/15 text-primary border-primary/30' : 'border-border/60 text-muted-foreground hover:text-foreground')}>
            {c.label}
          </button>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : templates.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><p>No templates yet.</p><Button onClick={openNew} className="mt-3 gap-2"><Plus className="h-4 w-4" /> Create one</Button></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead><TableHead>Body</TableHead><TableHead>Deep link</TableHead>
                  <TableHead>KY gate</TableHead><TableHead>Rate</TableHead><TableHead className="w-16">Active</TableHead><TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(grouped).map((g) => (
                  <React.Fragment key={g}>
                    <TableRow className="hover:bg-transparent"><TableCell colSpan={7} className="py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{g}</TableCell></TableRow>
                    {grouped[g].map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.icon} {t.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[260px] truncate">{t.body}</TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{t.deep_link || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={t.require_ky_completion ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'}>
                            {t.require_ky_completion ? 'KY required' : 'No gate'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{t.rate_limit_per_user_minutes}m</TableCell>
                        <TableCell><Switch checked={t.is_active} onCheckedChange={(v) => toggle.mutate({ id: t.id, is_active: v })} /></TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => sendTest(t.id)} title="Send test"><Send className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader><SheetTitle>{editing ? 'Edit template' : 'New template'}</SheetTitle></SheetHeader>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Key</Label>
                <Input value={form.key} disabled={!!editing} onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} placeholder="pay_d7_unlock" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATS.filter((c) => c.key !== 'all').map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Body</Label><Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Deep link</Label><Input value={form.deep_link} onChange={(e) => setForm({ ...form, deep_link: e.target.value })} placeholder="/community" /></div>
              <div className="space-y-1.5"><Label>Icon</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🔔" /></div>
            </div>

            {/* Live preview */}
            <div className="rounded-2xl border border-border/60 bg-black/40 p-3">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Preview</div>
              <div className="rounded-xl bg-[#1c1c1e] px-3 py-2.5 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-base">{form.icon || '🔔'}</div>
                  <div className="text-[11px] font-semibold text-white/80">THE FORGE · now</div>
                </div>
                <div className="mt-1.5 text-sm font-semibold text-white leading-tight">{form.title || 'Notification title'}</div>
                <div className="text-xs text-white/70 leading-snug line-clamp-2">{form.body || 'Notification body preview…'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
              <div><Label>Require KY completion</Label><p className="text-[11px] text-muted-foreground max-w-xs">Block sending to users who haven't completed KY. Turn OFF only for templates that DRIVE KY (welcome, KY nudge).</p></div>
              <Switch checked={form.require_ky_completion} onCheckedChange={(v) => setForm({ ...form, require_ky_completion: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
              <Label>Require login</Label>
              <Switch checked={form.require_login} onCheckedChange={(v) => setForm({ ...form, require_login: v })} />
            </div>
            <div className="space-y-1.5">
              <Label>Rate limit (minutes)</Label>
              <Input type="number" value={form.rate_limit_per_user_minutes} onChange={(e) => setForm({ ...form, rate_limit_per_user_minutes: Number(e.target.value) })} />
              <p className="text-[11px] text-muted-foreground">Minimum minutes between sends of THIS template to the same user.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Tokens used</Label>
              <div className="flex flex-wrap gap-1.5">{tokens.length ? tokens.map((t) => <Badge key={t} variant="outline" className="font-mono text-[10px]">[{t}]</Badge>) : <span className="text-xs text-muted-foreground">None</span>}</div>
            </div>

            {/* Read-only reference: every token is auto-filled at send time. No admin input needed. */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="text-[11px] font-semibold text-foreground mb-1">Available auto-tokens</div>
              <p className="text-[11px] text-muted-foreground mb-2">All filled automatically by the send pipeline — you never type values.</p>
              <div className="space-y-1">
                {AUTO_TOKENS.map(([tok, src]) => (
                  <div key={tok} className="flex items-baseline gap-2 text-[11px]">
                    <span className="font-mono text-primary shrink-0">{tok}</span>
                    <span className="text-muted-foreground truncate">← {src}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 p-3"><Label>Active</Label><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={!form.key || !form.title || !form.body}>Save</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

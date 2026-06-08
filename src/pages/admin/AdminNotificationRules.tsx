import React, { useState } from 'react';
import {
  useNotificationRules, useCreateNotificationRule, useUpdateNotificationRule,
  useToggleNotificationRule, useDeleteNotificationRule,
} from '@/hooks/useNotificationRules';
import { useNotificationTemplates } from '@/hooks/useNotificationTemplates';
import { useNotificationAudiences } from '@/hooks/useNotificationAudiences';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Plus, ScrollText, Pencil, Trash2 } from 'lucide-react';

const TZ = ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'];
const EMPTY = { name: '', template_id: '', audience_id: '', trigger_id: '', delay_minutes: 0, send_window_start: '09:00', send_window_end: '21:00', timezone: 'Asia/Kolkata', max_sends_per_user: 1, cancel_if_event_keys: [] as string[] };

export default function AdminNotificationRules() {
  const { data: rules = [], isLoading } = useNotificationRules();
  const { data: templates = [] } = useNotificationTemplates({ isActive: true });
  const { data: audiences = [] } = useNotificationAudiences();
  const { data: triggers = [] } = useNotificationTriggers();
  const create = useCreateNotificationRule();
  const update = useUpdateNotificationRule();
  const toggle = useToggleNotificationRule();
  const del = useDeleteNotificationRule();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ name: r.name, template_id: r.template_id, audience_id: r.audience_id, trigger_id: r.trigger_id, delay_minutes: r.delay_minutes, send_window_start: r.send_window_start, send_window_end: r.send_window_end, timezone: r.timezone, max_sends_per_user: r.max_sends_per_user, cancel_if_event_keys: r.cancel_if_event_keys || [] }); setOpen(true); };
  const save = () => {
    const onSuccess = () => setOpen(false);
    if (editing) update.mutate({ id: editing.id, ...form }, { onSuccess });
    else create.mutate(form, { onSuccess });
  };
  const toggleCancel = (key: string) => setForm((f: any) => ({ ...f, cancel_if_event_keys: f.cancel_if_event_keys.includes(key) ? f.cancel_if_event_keys.filter((k: string) => k !== key) : [...f.cancel_if_event_keys, key] }));

  const tpl = templates.find((t: any) => t.id === form.template_id);
  const aud = audiences.find((a: any) => a.id === form.audience_id);
  const trg = triggers.find((t: any) => t.id === form.trigger_id);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Notification Rules</h1>
            <p className="text-sm text-muted-foreground">Template + audience + trigger = an automated send.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> New Rule</Button>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : rules.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><p>No rules yet.</p><Button onClick={openNew} className="mt-3 gap-2"><Plus className="h-4 w-4" /> Create one</Button></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Template</TableHead><TableHead>Audience</TableHead><TableHead>Trigger</TableHead><TableHead>Delay</TableHead><TableHead>Window</TableHead><TableHead className="w-16">Active</TableHead><TableHead className="w-24 text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-sm">{r.template?.title || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.audience?.label || '—'}</TableCell>
                    <TableCell className="text-sm">{r.trigger?.label || '—'} {r.trigger?.event_type && <Badge variant="outline" className="ml-1 text-[10px]">{r.trigger.event_type}</Badge>}</TableCell>
                    <TableCell className="text-xs">{r.delay_minutes}m</TableCell>
                    <TableCell className="text-xs font-mono">{r.send_window_start}–{r.send_window_end}</TableCell>
                    <TableCell><Switch checked={r.is_active} onCheckedChange={(v) => toggle.mutate({ id: r.id, is_active: v })} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader><SheetTitle>{editing ? 'Edit rule' : 'New rule'}</SheetTitle></SheetHeader>
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Day 7 balance reminder push" /><p className="text-[11px] text-muted-foreground">Internal label.</p></div>
            <div className="space-y-1.5"><Label>Template</Label>
              <Select value={form.template_id} onValueChange={(v) => setForm({ ...form, template_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pick a template" /></SelectTrigger>
                <SelectContent>{templates.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.category} · {t.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Audience</Label>
              <Select value={form.audience_id} onValueChange={(v) => setForm({ ...form, audience_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pick an audience" /></SelectTrigger>
                <SelectContent>{audiences.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.label} (~{a.estimated_size_cache ?? '?'})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Trigger</Label>
              <Select value={form.trigger_id} onValueChange={(v) => setForm({ ...form, trigger_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pick a trigger" /></SelectTrigger>
                <SelectContent>{triggers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.label} · {t.event_type}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Delay (min)</Label><Input type="number" value={form.delay_minutes} onChange={(e) => setForm({ ...form, delay_minutes: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Max sends / user</Label><Input type="number" value={form.max_sends_per_user} onChange={(e) => setForm({ ...form, max_sends_per_user: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Window start</Label><Input type="time" value={form.send_window_start} onChange={(e) => setForm({ ...form, send_window_start: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Window end</Label><Input type="time" value={form.send_window_end} onChange={(e) => setForm({ ...form, send_window_end: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TZ.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cancel if any of these fire</Label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {triggers.map((t: any) => (
                  <button key={t.id} type="button" onClick={() => toggleCancel(t.key)}
                    className={cn('rounded-full border px-2.5 py-1 text-[11px] transition', form.cancel_if_event_keys.includes(t.key) ? 'bg-primary/15 text-primary border-primary/30' : 'border-border/60 text-muted-foreground')}>
                    {t.key}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">E.g. 'on_balance_paid' cancels all balance-reminder rules.</p>
            </div>

            <div className="rounded-lg bg-muted/30 p-3 text-xs leading-relaxed">
              <span className="font-semibold">What this means: </span>
              When <b>{trg?.label || '[trigger]'}</b> fires, wait <b>{form.delay_minutes}</b> min, then send '<b>{tpl?.title || '[template]'}</b>' to users matching '<b>{aud?.label || '[audience]'}</b>' (~{aud?.estimated_size_cache ?? '?'} users), only between <b>{form.send_window_start}–{form.send_window_end}</b> {form.timezone}.{form.cancel_if_event_keys.length ? <> Cancel if any of: <b>{form.cancel_if_event_keys.join(', ')}</b>.</> : ''}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={!form.name || !form.template_id || !form.trigger_id}>Save</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

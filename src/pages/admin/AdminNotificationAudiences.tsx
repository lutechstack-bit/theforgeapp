import React, { useState } from 'react';
import {
  useNotificationAudiences, useCreateNotificationAudience,
  useUpdateNotificationAudience, useDeleteNotificationAudience,
} from '@/hooks/useNotificationAudiences';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Target, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { key: '', label: '', description: '', filter_sql: '' };

export default function AdminNotificationAudiences() {
  const { data: audiences = [], isLoading } = useNotificationAudiences();
  const create = useCreateNotificationAudience();
  const update = useUpdateNotificationAudience();
  const del = useDeleteNotificationAudience();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (a: any) => { setEditing(a); setForm({ key: a.key, label: a.label, description: a.description || '', filter_sql: a.filter_sql }); setOpen(true); };
  const save = () => {
    if (editing) update.mutate({ id: editing.id, label: form.label, description: form.description, filter_sql: form.filter_sql }, { onSuccess: () => setOpen(false) });
    else create.mutate(form, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Notification Audiences</h1>
            <p className="text-sm text-muted-foreground">Filters that resolve to a set of students at send time.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> New Audience</Button>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : audiences.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No audiences yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Est. size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audiences.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.label}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{a.key}</TableCell>
                    <TableCell className="text-sm">{a.estimated_size_cache ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={a.is_system ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'bg-muted text-muted-foreground'}>
                        {a.is_system ? 'System' : 'Custom'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                      {!a.is_system && (
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del.mutate(a.id)}><Trash2 className="h-4 w-4" /></Button>
                      )}
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
          <SheetHeader><SheetTitle>{editing ? 'Edit audience' : 'New audience'}</SheetTitle></SheetHeader>
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Key</Label>
              <Input value={form.key} disabled={!!editing} onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} placeholder="balance_pending_d7" />
            </div>
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Filter SQL (WHERE clause body)</Label>
              <Textarea rows={6} className="font-mono text-xs" value={form.filter_sql} onChange={(e) => setForm({ ...form, filter_sql: e.target.value })} placeholder="is_admin = false AND payment_status = 'CONFIRMED_15K'" />
              <p className="text-[11px] text-muted-foreground">The system prepends <span className="font-mono">SELECT id FROM profiles WHERE</span> automatically. (Evaluator arrives in Prompt 4.)</p>
              <div className="rounded-lg border border-border/40 bg-muted/20 p-3 mt-1">
                <div className="text-[11px] font-semibold text-foreground mb-1">Available columns on <span className="font-mono">profiles</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {['id', 'email', 'ky_form_completed', 'payment_status', 'last_login_at', 'last_active_at', 'deposit_paid_at', 'edition_id', 'profile_photo_url', 'deleted_at'].map((col) => (
                    <span key={col} className="font-mono text-[10px] rounded bg-card/60 border border-border/40 px-1.5 py-0.5 text-primary">{col}</span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Joins available at eval time: editions, user_activity_logs, community_messages.</p>
              </div>
            </div>
            {editing?.is_system && <p className="text-[11px] text-amber-400">System audience — key is locked and it can't be deleted.</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={!form.key || !form.label || !form.filter_sql}>Save</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

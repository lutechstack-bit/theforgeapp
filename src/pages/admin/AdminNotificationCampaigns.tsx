import React, { useState } from 'react';
import { useNotificationCampaigns, useCampaignDeliveries } from '@/hooks/useNotificationCampaigns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Megaphone } from 'lucide-react';

const STATUSES = ['all', 'scheduled', 'sending', 'sent', 'cancelled', 'failed'];
const STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-muted text-muted-foreground', sending: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  sent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', cancelled: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30', queued: 'bg-muted text-muted-foreground',
  delivered: 'bg-sky-500/15 text-sky-400 border-sky-500/30', opened: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  clicked: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};
const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : '—');

function Funnel({ c }: { c: any }) {
  const stages = [
    ['Targeted', c.total_targeted], ['Sent', c.total_sent], ['Delivered', c.total_delivered],
    ['Opened', c.total_opened], ['Clicked', c.total_clicked], ['Converted', c.total_converted],
  ] as const;
  const max = Math.max(1, c.total_targeted || 0);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {stages.map(([label, n]) => (
        <div key={label} className="rounded-lg border border-border/40 bg-card/40 p-3 text-center">
          <div className="text-xl font-bold text-foreground">{n ?? 0}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1.5 h-1 rounded bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.round(((n ?? 0) / max) * 100)}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export default function AdminNotificationCampaigns() {
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const { data: campaigns = [], isLoading } = useNotificationCampaigns({ status });
  const { data: deliveries = [] } = useCampaignDeliveries(selected?.id);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Notification Campaigns</h1>
          <p className="text-sm text-muted-foreground">Every send, scheduled or completed.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={cn('rounded-full border px-3 py-1 text-xs capitalize transition',
              status === s ? 'bg-primary/15 text-primary border-primary/30' : 'border-border/60 text-muted-foreground hover:text-foreground')}>
            {s}
          </button>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No campaigns yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>D / O / C</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c: any) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelected(c)}>
                    <TableCell className="font-medium">{c.template?.title || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.audience?.label || (c.target_user_ids?.length ? `${c.target_user_ids.length} users` : '—')}</TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_STYLE[c.status] || ''}>{c.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmt(c.scheduled_for)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmt(c.sent_at)}</TableCell>
                    <TableCell className="text-xs">{c.total_delivered} / {c.total_opened} / {c.total_clicked}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader><SheetTitle>{selected.template?.title || 'Campaign'}</SheetTitle></SheetHeader>
              <div className="mt-5 space-y-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-[10px] uppercase text-muted-foreground">Audience</div>{selected.audience?.label || '—'}</div>
                  <div><div className="text-[10px] uppercase text-muted-foreground">Status</div><Badge variant="outline" className={STATUS_STYLE[selected.status] || ''}>{selected.status}</Badge></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground">Scheduled</div>{fmt(selected.scheduled_for)}</div>
                  <div><div className="text-[10px] uppercase text-muted-foreground">Sent</div>{fmt(selected.sent_at)}</div>
                </div>
                {selected.error_message && <p className="text-sm text-red-400">{selected.error_message}</p>}
                <div>
                  <div className="text-xs font-semibold mb-2">Funnel</div>
                  <Funnel c={selected} />
                </div>
                <div>
                  <div className="text-xs font-semibold mb-2">Deliveries</div>
                  {deliveries.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border/50 rounded-lg">No deliveries yet.</div>
                  ) : (
                    <Table>
                      <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Opened</TableHead><TableHead>Clicked</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {deliveries.map((d: any) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-mono text-xs">{String(d.user_id).slice(0, 8)}…</TableCell>
                            <TableCell><Badge variant="outline" className={STATUS_STYLE[d.status] || 'bg-muted text-muted-foreground'}>{d.status}</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{fmt(d.opened_at)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{fmt(d.clicked_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

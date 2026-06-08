import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationCampaign, useCampaignDeliveries } from '@/hooks/useNotificationCampaigns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-muted text-muted-foreground', sending: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  sent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', cancelled: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30', queued: 'bg-muted text-muted-foreground',
  delivered: 'bg-sky-500/15 text-sky-400 border-sky-500/30', opened: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', clicked: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};
const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : '—');

export default function AdminNotificationCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: c, isLoading } = useNotificationCampaign(id);
  const { data: deliveries = [] } = useCampaignDeliveries(id);

  const stages = c ? ([
    ['Targeted', c.total_targeted], ['Sent', c.total_sent], ['Delivered', c.total_delivered],
    ['Opened', c.total_opened], ['Clicked', c.total_clicked], ['Converted', c.total_converted],
  ] as const) : [];
  const max = Math.max(1, c?.total_targeted || 0);

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <button onClick={() => navigate('/admin/notifications/campaigns')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </button>

      {isLoading || !c ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold">{c.template?.title || 'Campaign'}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className={STATUS_STYLE[c.status] || ''}>{c.status}</Badge>
              <span>Audience: {c.audience?.label || (c.target_user_ids?.length ? `${c.target_user_ids.length} users` : '—')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-card/50 border-border/50"><CardContent className="py-3"><div className="text-[10px] uppercase text-muted-foreground">Scheduled</div><div className="text-sm">{fmt(c.scheduled_for)}</div></CardContent></Card>
            <Card className="bg-card/50 border-border/50"><CardContent className="py-3"><div className="text-[10px] uppercase text-muted-foreground">Sent</div><div className="text-sm">{fmt(c.sent_at)}</div></CardContent></Card>
            <Card className="bg-card/50 border-border/50"><CardContent className="py-3"><div className="text-[10px] uppercase text-muted-foreground">Category</div><div className="text-sm">{c.template?.category || '—'}</div></CardContent></Card>
            <Card className="bg-card/50 border-border/50"><CardContent className="py-3"><div className="text-[10px] uppercase text-muted-foreground">Created by</div><div className="text-sm font-mono">{c.created_by ? String(c.created_by).slice(0, 8) + '…' : '—'}</div></CardContent></Card>
          </div>
          {c.error_message && <p className="text-sm text-red-400">{c.error_message}</p>}

          <div>
            <div className="text-sm font-semibold mb-2">Funnel</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {stages.map(([label, n]) => (
                <div key={label} className="rounded-lg border border-border/40 bg-card/40 p-3 text-center">
                  <div className="text-xl font-bold">{n ?? 0}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
                  <div className="mt-1.5 h-1 rounded bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.round(((n ?? 0) / max) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-0">
              <div className="px-4 py-3 text-sm font-semibold border-b border-border/40">Deliveries ({deliveries.length})</div>
              {deliveries.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No deliveries yet.</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Sent</TableHead><TableHead>Opened</TableHead><TableHead>Clicked</TableHead><TableHead>Error</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {deliveries.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono text-xs">{String(d.user_id).slice(0, 8)}…</TableCell>
                        <TableCell><Badge variant="outline" className={STATUS_STYLE[d.status] || 'bg-muted text-muted-foreground'}>{d.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmt(d.sent_at)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmt(d.opened_at)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmt(d.clicked_at)}</TableCell>
                        <TableCell className="text-xs text-red-400 max-w-[160px] truncate">{d.error_message || ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

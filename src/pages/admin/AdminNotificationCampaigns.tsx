import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationCampaigns } from '@/hooks/useNotificationCampaigns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export default function AdminNotificationCampaigns() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('all');
  const { data: campaigns = [], isLoading } = useNotificationCampaigns({ status });

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
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/admin/notifications/campaigns/${c.id}`)}>
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
    </div>
  );
}

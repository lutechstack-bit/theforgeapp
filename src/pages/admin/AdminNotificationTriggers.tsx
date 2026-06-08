import React from 'react';
import { useNotificationTriggers, useToggleNotificationTrigger } from '@/hooks/useNotificationTriggers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Zap } from 'lucide-react';

const GROUPS: { type: string; label: string }[] = [
  { type: 'webhook', label: 'Webhook' },
  { type: 'realtime_db', label: 'Realtime' },
  { type: 'cron', label: 'Cron' },
  { type: 'manual', label: 'Manual' },
];

export default function AdminNotificationTriggers() {
  const { data: triggers = [], isLoading } = useNotificationTriggers();
  const toggle = useToggleNotificationTrigger();

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Notification Triggers</h1>
          <p className="text-sm text-muted-foreground">Events that can fire a notification rule. Read-only — expanded in a later prompt.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        GROUPS.map((g) => {
          const rows = triggers.filter((t: any) => t.event_type === g.type);
          if (rows.length === 0) return null;
          return (
            <Card key={g.type} className="bg-card/50 border-border/50">
              <CardContent className="p-0">
                <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary border-b border-border/40">{g.label}</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead className="w-20">Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.label}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{t.key}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.event_source || '—'}</TableCell>
                        <TableCell className="font-mono text-xs">{t.schedule_cron || '—'}</TableCell>
                        <TableCell>
                          <Switch checked={t.is_active} onCheckedChange={(v) => toggle.mutate({ id: t.id, is_active: v })} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Send, FileText, History, CheckCircle2, Eye, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const useEmailStats = () => {
  return useQuery({
    queryKey: ['admin-email-stats'],
    queryFn: async () => {
      // This-month boundary
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const sb = supabase as any;
      const [allSends, monthSends] = await Promise.all([
        sb
          .from('email_sends')
          .select('id, status, sent_at, delivered_at, opened_at, clicked_at, bounced_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(1000),
        sb
          .from('email_sends')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString()),
      ]);
      if (allSends.error) throw allSends.error;
      const rows: any[] = allSends.data || [];
      const sentCount = rows.filter(r => r.sent_at !== null).length;
      const delivered = rows.filter(r => r.delivered_at !== null).length;
      const opened = rows.filter(r => r.opened_at !== null).length;
      const clicked = rows.filter(r => r.clicked_at !== null).length;
      const bounced = rows.filter(r => r.bounced_at !== null).length;
      const failed = rows.filter(r => r.status === 'failed').length;

      return {
        thisMonth: monthSends.count || 0,
        totalAllTime: allSends.count || 0,
        sentCount,
        delivered,
        opened,
        clicked,
        bounced,
        failed,
        deliveryRate: sentCount > 0 ? Math.round((delivered / sentCount) * 100) : 0,
        openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
        clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
      };
    },
    staleTime: 60_000,
  });
};

const useRecentSends = () => {
  return useQuery({
    queryKey: ['admin-email-recent-sends'],
    queryFn: async () => {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('email_sends')
        .select('id, recipient_email, status, sent_at, opened_at, created_at, template_id, subject_rendered')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      const rows: any[] = data || [];
      const templateIds = [...new Set(rows.map(r => r.template_id).filter(Boolean))] as string[];
      let templatesById: Record<string, string> = {};
      if (templateIds.length > 0) {
        const { data: tpls } = await sb
          .from('email_templates').select('id, name').in('id', templateIds);
        for (const t of (tpls || []) as any[]) templatesById[t.id] = t.name;
      }
      return rows.map(r => ({
        ...r,
        templateName: r.template_id ? (templatesById[r.template_id] || '—') : '—',
      }));
    },
    staleTime: 30_000,
  });
};

const statusStyle: Record<string, string> = {
  queued:     'bg-muted/40 text-muted-foreground border-border',
  sent:       'bg-blue-500/15 text-blue-400 border-blue-500/30',
  delivered:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  opened:     'bg-primary/15 text-primary border-primary/30',
  clicked:    'bg-violet-500/15 text-violet-400 border-violet-500/30',
  bounced:    'bg-red-500/15 text-red-400 border-red-500/30',
  complained: 'bg-red-500/15 text-red-400 border-red-500/30',
  failed:     'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function AdminEmailDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useEmailStats();
  const { data: recent = [], isLoading: recentLoading } = useRecentSends();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" /> Email Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Send broadcasts, manage templates, and track delivery.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/admin/email/templates/new')} variant="outline" className="gap-1.5">
            <FileText className="h-4 w-4" /> New Template
          </Button>
          <Button onClick={() => navigate('/admin/email/send')} className="gap-1.5">
            <Send className="h-4 w-4" /> Compose & Send
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="This month" value={statsLoading ? null : stats?.thisMonth ?? 0} icon={Send} />
        <StatCard
          label="Delivery rate"
          value={statsLoading ? null : `${stats?.deliveryRate ?? 0}%`}
          icon={CheckCircle2}
          sub={stats ? `${stats.delivered}/${stats.sentCount}` : undefined}
        />
        <StatCard
          label="Open rate"
          value={statsLoading ? null : `${stats?.openRate ?? 0}%`}
          icon={Eye}
          sub={stats ? `${stats.opened}/${stats.delivered}` : undefined}
        />
        <StatCard
          label="Failed / bounced"
          value={statsLoading ? null : (stats?.failed ?? 0) + (stats?.bounced ?? 0)}
          icon={AlertTriangle}
        />
      </div>

      {/* Recent sends */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" /> Recent sends
          </CardTitle>
          <Link to="/admin/email/history" className="text-xs text-primary hover:underline">
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No emails sent yet. Create a template and send your first broadcast.
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {recent.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{r.subject_rendered || r.templateName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      → {r.recipient_email} · {r.templateName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="outline" className={statusStyle[r.status] || statusStyle.queued}>
                      {r.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground w-28 text-right">
                      {r.sent_at ? format(new Date(r.sent_at), 'MMM d, HH:mm') : format(new Date(r.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const StatCard: React.FC<{ label: string; value: number | string | null; icon: React.ElementType; sub?: string }> = ({ label, value, icon: Icon, sub }) => (
  <Card className="bg-card/60">
    <CardContent className="pt-4 pb-3 px-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        {value === null
          ? <Skeleton className="h-6 w-12" />
          : <p className="text-xl font-bold text-foreground">{value}</p>}
        {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
      </div>
    </CardContent>
  </Card>
);

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotificationCampaigns } from '@/hooks/useNotificationCampaigns';
import { Bell, FileText, Target, Zap, ScrollText, Megaphone, ChevronRight, Send, BarChart3 } from 'lucide-react';
import { EnablePushButton } from '@/components/EnablePushButton';

const since30d = () => new Date(Date.now() - 30 * 864e5).toISOString();

function useCounts() {
  return useQuery({
    queryKey: ['notif-hub-counts'],
    queryFn: async () => {
      const head = (q: any) => q.select('id', { count: 'exact', head: true });
      const [tpl, rules, camps, dels, tplTotal, audTotal, trigTotal, customAud] = await Promise.all([
        head(supabase.from('notification_templates')).eq('is_active', true),
        head(supabase.from('notification_rules')).eq('is_active', true),
        head(supabase.from('notification_campaigns')).in('status', ['sent', 'sending']).gte('created_at', since30d()),
        head(supabase.from('notification_deliveries')).in('status', ['sent', 'delivered', 'opened', 'clicked']).gte('created_at', since30d()),
        head(supabase.from('notification_templates')),
        head(supabase.from('notification_audiences')),
        head(supabase.from('notification_triggers')),
        head(supabase.from('notification_audiences')).eq('is_system', false),
      ]);
      return {
        activeTemplates: tpl.count ?? 0, activeRules: rules.count ?? 0,
        campaignsSent: camps.count ?? 0, deliveries: dels.count ?? 0,
        totalTemplates: tplTotal.count ?? 0, totalAudiences: audTotal.count ?? 0,
        totalTriggers: trigTotal.count ?? 0, customAudiences: customAud.count ?? 0,
      };
    },
  });
}

const STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-muted text-muted-foreground', sending: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  sent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', cancelled: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function AdminNotifications() {
  const navigate = useNavigate();
  const { data: c, isLoading } = useCounts();
  const { data: recent = [] } = useNotificationCampaigns({ limit: 10 });

  const tiles = [
    { icon: FileText, label: 'Active templates', value: c?.activeTemplates },
    { icon: ScrollText, label: 'Active rules', value: c?.activeRules },
    { icon: Send, label: 'Campaigns sent (30d)', value: c?.campaignsSent },
    { icon: BarChart3, label: 'Deliveries (30d)', value: c?.deliveries },
  ];
  const cards = [
    { icon: FileText, label: 'Templates', to: '/admin/notifications/templates', sub: `${c?.totalTemplates ?? '—'} templates` },
    { icon: Target, label: 'Audiences', to: '/admin/notifications/audiences', sub: `${(c?.totalAudiences ?? 0) - (c?.customAudiences ?? 0)} system · ${c?.customAudiences ?? 0} custom` },
    { icon: Zap, label: 'Triggers', to: '/admin/notifications/triggers', sub: `${c?.totalTriggers ?? '—'} triggers` },
    { icon: ScrollText, label: 'Rules', to: '/admin/notifications/rules', sub: `${c?.activeRules ?? 0} active` },
    { icon: Megaphone, label: 'Campaigns', to: '/admin/notifications/campaigns', sub: 'recent activity' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">In-App Push</h1>
          <p className="text-sm text-muted-foreground">Templates, audiences, rules and campaigns for in-app push notifications.</p>
        </div>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <div className="font-semibold">This device</div>
            <div className="text-xs text-muted-foreground">Enable push here, then hit “Send test” on any template to fire a real notification to yourself.</div>
          </div>
          <EnablePushButton />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <Card key={t.label} className="bg-card/50 border-border/50">
            <CardContent className="flex items-center gap-3 py-4">
              <t.icon className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{isLoading ? '—' : t.value}</div>
                <div className="text-xs text-muted-foreground">{t.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card) => (
          <button key={card.to} onClick={() => navigate(card.to)} className="text-left">
            <Card className="bg-card/50 border-border/50 hover:border-primary/40 transition">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <card.icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{card.label}</div>
                    <div className="text-xs text-muted-foreground">{card.sub}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <div className="px-4 py-3 text-sm font-semibold border-b border-border/40">Recent campaigns</div>
          {recent.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">No campaigns yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>D / O / C</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.template?.title || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.audience?.label || (c.target_user_ids?.length ? `${c.target_user_ids.length} users` : '—')}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.sent_at ? new Date(c.sent_at).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-xs">{c.total_delivered} / {c.total_opened} / {c.total_clicked}</TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_STYLE[c.status] || ''}>{c.status}</Badge></TableCell>
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

import React, { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, Calendar, CalendarDays, CreditCard, Zap, BookOpen, MessageSquare, 
  UserCheck, GraduationCap, Map, TrendingUp, ArrowUpRight, ArrowDownRight,
  Handshake, Info, LogIn, ClipboardCheck, Palette, PlayCircle, RefreshCw,
  Check, X, AlertTriangle, Eye, GripVertical, RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { format, subDays, parseISO, startOfDay, isToday, isYesterday } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';

// --- Hooks ---

function useUserStats() {
  return useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, payment_status, forge_mode, profile_setup_completed, created_at');
      if (error) throw error;
      const profiles = data || [];
      return {
        total: profiles.length,
        completed: profiles.filter(p => p.profile_setup_completed).length,
        balancePaid: profiles.filter(p => p.payment_status === 'BALANCE_PAID').length,
        balancePending: profiles.filter(p => p.payment_status === 'CONFIRMED_15K').length,
        preForge: profiles.filter(p => p.forge_mode === 'PRE_FORGE').length,
        duringForge: profiles.filter(p => p.forge_mode === 'DURING_FORGE').length,
        postForge: profiles.filter(p => p.forge_mode === 'POST_FORGE').length,
        profiles,
      };
    },
  });
}

function useGrowthData() {
  return useQuery({
    queryKey: ['admin-growth-data'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });
      if (error) throw error;
      
      // Group by day
      const grouped: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const day = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
        grouped[day] = 0;
      }
      (data || []).forEach(p => {
        const day = format(parseISO(p.created_at), 'yyyy-MM-dd');
        if (grouped[day] !== undefined) grouped[day]++;
      });
      
      return Object.entries(grouped).map(([date, count]) => ({
        date,
        label: format(parseISO(date), 'MMM d'),
        users: count,
      }));
    },
  });
}

function usePlatformCounts() {
  return useQuery({
    queryKey: ['admin-platform-counts'],
    queryFn: async () => {
      const [learn, events, messages, mentors, roadmap, editions, kyf, collabProfiles, collabRequests] = await Promise.all([
        supabase.from('learn_content').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('community_messages').select('id', { count: 'exact', head: true }),
        supabase.from('mentors').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('roadmap_days').select('id', { count: 'exact', head: true }),
        supabase.from('editions').select('id', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('kyf_responses').select('id', { count: 'exact', head: true }),
        supabase.from('collaborator_profiles').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('collaboration_requests').select('id', { count: 'exact', head: true }),
      ]);
      return {
        learnContent: learn.count || 0,
        events: events.count || 0,
        messages: messages.count || 0,
        mentors: mentors.count || 0,
        roadmapDays: roadmap.count || 0,
        activeEditions: editions.count || 0,
        kyForms: kyf.count || 0,
        networkProfiles: collabProfiles.count || 0,
        networkRequests: collabRequests.count || 0,
      };
    },
  });
}

function useCohortDistribution() {
  return useQuery({
    queryKey: ['admin-cohort-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name, cohort_type, is_archived')
        .eq('is_archived', false);
      if (error) throw error;
      
      // Count profiles per edition
      const { data: profiles } = await supabase
        .from('profiles')
        .select('edition_id');
      
      const editionCounts: Record<string, number> = {};
      (profiles || []).forEach(p => {
        if (p.edition_id) editionCounts[p.edition_id] = (editionCounts[p.edition_id] || 0) + 1;
      });
      
      return (data || []).map(e => ({
        name: e.name.length > 15 ? e.name.slice(0, 15) + '…' : e.name,
        users: editionCounts[e.id] || 0,
        type: e.cohort_type,
      })).filter(e => e.users > 0).sort((a, b) => b.users - a.users);
    },
  });
}

// --- Engagement Hooks ---

function useLoginStats() {
  return useQuery({
    queryKey: ['admin-login-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('created_at')
        .eq('event_type', 'login')
        .gte('created_at', thirtyDaysAgo);
      if (error) throw error;
      const logs = data || [];
      
      const todayCount = logs.filter(l => isToday(parseISO(l.created_at))).length;
      const yesterdayCount = logs.filter(l => isYesterday(parseISO(l.created_at))).length;
      const trend = yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : todayCount > 0 ? 100 : 0;

      // Group by day for chart
      const grouped: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        grouped[format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')] = 0;
      }
      logs.forEach(l => {
        const day = format(parseISO(l.created_at), 'yyyy-MM-dd');
        if (grouped[day] !== undefined) grouped[day]++;
      });
      const dailyData = Object.entries(grouped).map(([date, count]) => ({
        date,
        label: format(parseISO(date), 'MMM d'),
        logins: count,
      }));

      return { total: logs.length, todayCount, yesterdayCount, trend, dailyData };
    },
  });
}

function useEngagementFunnel() {
  return useQuery({
    queryKey: ['admin-engagement-funnel'],
    queryFn: async () => {
      const [loginRes, profileRes, collabRes, watchRes] = await Promise.all([
        supabase.from('user_activity_logs').select('user_id', { count: 'exact' }).eq('event_type', 'login'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('profile_setup_completed', true),
        supabase.from('collaborator_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('learn_watch_progress').select('user_id'),
      ]);

      // Unique login users
      const uniqueLogins = new Set((loginRes.data || []).map((l: any) => l.user_id)).size;
      const uniqueWatchers = new Set((watchRes.data || []).map((w: any) => w.user_id)).size;

      return [
        { step: 'Logged In', count: uniqueLogins, fill: 'hsl(var(--primary))' },
        { step: 'Onboarding Done', count: profileRes.count || 0, fill: 'hsl(152, 69%, 40%)' },
        { step: 'Profile Created', count: collabRes.count || 0, fill: 'hsl(217, 91%, 60%)' },
        { step: 'Video Watched', count: uniqueWatchers, fill: 'hsl(36, 88%, 50%)' },
      ];
    },
  });
}

function useRecentActivity() {
  return useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      // Get recent login logs
      const { data: logs, error } = await supabase
        .from('user_activity_logs')
        .select('user_id, created_at, event_type')
        .eq('event_type', 'login')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      // Unique user IDs from logs
      const userIds = [...new Set((logs || []).map(l => l.user_id))];
      if (!userIds.length) return [];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, profile_setup_completed');
      const profileLookup: Record<string, any> = {};
      (profiles || []).forEach(p => { profileLookup[p.id] = p; });

      // Fetch collab profiles
      const { data: collabs } = await supabase
        .from('collaborator_profiles')
        .select('user_id');
      const collabSet = new Set((collabs || []).map(c => c.user_id));

      // Fetch watch progress
      const { data: watches } = await supabase
        .from('learn_watch_progress')
        .select('user_id');
      const watchSet = new Set((watches || []).map(w => w.user_id));

      // Dedupe by user, keep latest login
      const seen = new Set<string>();
      const rows: any[] = [];
      for (const log of (logs || [])) {
        if (seen.has(log.user_id)) continue;
        seen.add(log.user_id);
        const profile = profileLookup[log.user_id];
        rows.push({
          userId: log.user_id,
          name: profile?.full_name || 'Unknown',
          email: profile?.email || '—',
          avatarUrl: profile?.avatar_url,
          loginDate: log.created_at,
          onboarding: profile?.profile_setup_completed || false,
          profileCreated: collabSet.has(log.user_id),
          videoWatched: watchSet.has(log.user_id),
        });
      }
      return rows;
    },
  });
}

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  amber: 'hsl(36, 88%, 50%)',
  emerald: 'hsl(152, 69%, 40%)',
  blue: 'hsl(217, 91%, 60%)',
  rose: 'hsl(350, 89%, 60%)',
  purple: 'hsl(270, 70%, 60%)',
};
const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.amber, CHART_COLORS.emerald, CHART_COLORS.blue, CHART_COLORS.rose];

// --- Components ---

function StatCard({ title, value, icon: Icon, color, bg, subtitle, loading }: {
  title: string; value: number | string; icon: React.ElementType; color: string; bg: string; subtitle?: string; loading?: boolean;
}) {
  return (
    <Card className="bg-card/60 border-border/40 backdrop-blur-sm hover:border-border/70 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={`p-2 rounded-xl ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20" /> : (
          <>
            <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PlatformCard({ title, value, icon: Icon, loading }: {
  title: string; value: number; icon: React.ElementType; loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        {loading ? <Skeleton className="h-6 w-12" /> : (
          <div className="text-xl font-bold text-foreground">{value}</div>
        )}
        <div className="text-xs text-muted-foreground">{title}</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          {p.name}: <span className="font-semibold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// --- Smart Alerts ---
function useSmartAlerts() {
  const { data: loginStats } = useLoginStats();
  const { data: funnelData } = useEngagementFunnel();
  
  return useQuery({
    queryKey: ['admin-smart-alerts', loginStats?.total, funnelData?.[1]?.count],
    queryFn: async () => {
      const alerts: { id: string; type: 'warning' | 'info'; message: string; link: string }[] = [];
      
      // Pending KY forms
      const { count: pendingKy } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('ky_form_completed', false);
      
      if (pendingKy && pendingKy > 0) {
        alerts.push({
          id: 'pending-ky',
          type: 'warning',
          message: `${pendingKy} users haven't completed their KY forms`,
          link: '/admin/ky-forms',
        });
      }

      // Inactive users (no login in 7 days)
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data: activeUsers } = await supabase
        .from('user_activity_logs')
        .select('user_id')
        .eq('event_type', 'login')
        .gte('created_at', sevenDaysAgo);
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      const activeCount = new Set((activeUsers || []).map(u => u.user_id)).size;
      const inactiveCount = (totalUsers || 0) - activeCount;
      
      if (inactiveCount > 0) {
        alerts.push({
          id: 'inactive-users',
          type: 'info',
          message: `${inactiveCount} users haven't logged in for 7+ days`,
          link: '/admin/activity',
        });
      }

      return alerts;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// --- Draggable Widget ---
const DEFAULT_WIDGET_ORDER = ['stats', 'growth', 'platform', 'charts', 'completion', 'engagement', 'login-charts', 'activity', 'toggles', 'quick-actions'];

function getStoredOrder(): string[] {
  try {
    const stored = localStorage.getItem('admin-dashboard-order');
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_WIDGET_ORDER;
}

// --- Main Dashboard ---

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: growthData, isLoading: growthLoading } = useGrowthData();
  const { data: platformCounts, isLoading: countsLoading } = usePlatformCounts();
  const { data: cohortData, isLoading: cohortLoading } = useCohortDistribution();
  const { isFeatureEnabled, toggleFeature } = useFeatureFlags();
  const { data: loginStats, isLoading: loginLoading, refetch: refetchLogins } = useLoginStats();
  const { data: funnelData, isLoading: funnelLoading, refetch: refetchFunnel } = useEngagementFunnel();
  const { data: activityData, isLoading: activityLoading, refetch: refetchActivity } = useRecentActivity();
  const { data: alerts } = useSmartAlerts();
  const [activityPage, setActivityPage] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [widgetOrder, setWidgetOrder] = useState<string[]>(getStoredOrder);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('admin-dismissed-alerts');
      if (stored) {
        const { date, ids } = JSON.parse(stored);
        if (date === format(new Date(), 'yyyy-MM-dd')) return new Set(ids);
      }
    } catch {}
    return new Set();
  });

  const dismissAlert = (id: string) => {
    const next = new Set(dismissedAlerts);
    next.add(id);
    setDismissedAlerts(next);
    localStorage.setItem('admin-dismissed-alerts', JSON.stringify({ date: format(new Date(), 'yyyy-MM-dd'), ids: Array.from(next) }));
  };

  const handleDragStart = (widgetId: string) => setDraggedWidget(widgetId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!draggedWidget || draggedWidget === targetId) return;
    const newOrder = [...widgetOrder];
    const fromIdx = newOrder.indexOf(draggedWidget);
    const toIdx = newOrder.indexOf(targetId);
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, draggedWidget);
    setWidgetOrder(newOrder);
    localStorage.setItem('admin-dashboard-order', JSON.stringify(newOrder));
    setDraggedWidget(null);
  };

  const resetLayout = () => {
    setWidgetOrder(DEFAULT_WIDGET_ORDER);
    localStorage.removeItem('admin-dashboard-order');
  };

  const handleRefreshEngagement = () => {
    refetchLogins();
    refetchFunnel();
    refetchActivity();
    setLastRefreshed(new Date());
    toast.success('Dashboard refreshed');
  };

  const completionRate = userStats ? Math.round((userStats.completed / Math.max(userStats.total, 1)) * 100) : 0;

  const paymentData = userStats ? [
    { name: 'Balance Paid', value: userStats.balancePaid },
    { name: 'Pending (15K)', value: userStats.balancePending },
  ].filter(d => d.value > 0) : [];

  const forgeModeData = userStats ? [
    { name: 'Pre Forge', value: userStats.preForge },
    { name: 'During Forge', value: userStats.duringForge },
    { name: 'Post Forge', value: userStats.postForge },
  ].filter(d => d.value > 0) : [];

  const paginatedActivity = (activityData || []).slice(activityPage * 10, (activityPage + 1) * 10);
  const totalPages = Math.ceil((activityData || []).length / 10);

  const visibleAlerts = (alerts || []).filter(a => !dismissedAlerts.has(a.id));

  // Widget render map
  const DragHandle = () => (
    <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing shrink-0" />
  );

  const WidgetWrapper = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <div
      draggable
      onDragStart={() => handleDragStart(id)}
      onDragOver={handleDragOver}
      onDrop={() => handleDrop(id)}
      className={cn(
        "transition-opacity",
        draggedWidget === id && "opacity-50"
      )}
    >
      {children}
    </div>
  );

  const widgets: Record<string, React.ReactNode> = {
    stats: (
      <WidgetWrapper id="stats">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DragHandle />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Real-time overview of your LevelUp community</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={resetLayout} className="gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="w-3 h-3" />
            Reset Layout
          </Button>
        </div>

        {/* Smart Alerts */}
        {visibleAlerts.length > 0 && (
          <div className="space-y-2 mt-4">
            {visibleAlerts.map(alert => (
              <div key={alert.id} className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg border",
                alert.type === 'warning' ? "bg-amber-500/5 border-amber-500/20" : "bg-blue-500/5 border-blue-500/20"
              )}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={cn("w-4 h-4", alert.type === 'warning' ? "text-amber-500" : "text-blue-500")} />
                  <span className="text-sm text-foreground">{alert.message}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => navigate(alert.link)}>
                    <Eye className="w-3 h-3" /> View
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => dismissAlert(alert.id)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
        <StatCard title="Total Users" value={userStats?.total || 0} icon={Users} color="text-primary" bg="bg-primary/15" loading={statsLoading} />
        <StatCard title="Profiles Done" value={`${completionRate}%`} icon={UserCheck} color="text-emerald-500" bg="bg-emerald-500/15" subtitle={`${userStats?.completed || 0} of ${userStats?.total || 0}`} loading={statsLoading} />
        <StatCard title="KY Forms" value={platformCounts?.kyForms || 0} icon={GraduationCap} color="text-blue-500" bg="bg-blue-500/15" loading={countsLoading} />
        <StatCard title="Balance Paid" value={userStats?.balancePaid || 0} icon={CreditCard} color="text-amber-500" bg="bg-amber-500/15" subtitle={`${userStats?.balancePending || 0} pending`} loading={statsLoading} />
        <StatCard title="Active Editions" value={platformCounts?.activeEditions || 0} icon={Calendar} color="text-purple-500" bg="bg-purple-500/15" loading={countsLoading} />
      </div>

      {/* User Growth Chart */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">User Growth</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">New signups — last 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>{growthData?.reduce((s, d) => s + d.users, 0) || 0} total</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {growthLoading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" name="New Users" stroke="hsl(var(--primary))" fill="url(#growthGradient)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--primary))' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Platform Health */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <PlatformCard title="Learn Content" value={platformCounts?.learnContent || 0} icon={BookOpen} loading={countsLoading} />
          <PlatformCard title="Events" value={platformCounts?.events || 0} icon={Calendar} loading={countsLoading} />
          <PlatformCard title="Messages" value={platformCounts?.messages || 0} icon={MessageSquare} loading={countsLoading} />
          <PlatformCard title="Mentors" value={platformCounts?.mentors || 0} icon={Users} loading={countsLoading} />
          <PlatformCard title="Roadmap Days" value={platformCounts?.roadmapDays || 0} icon={Map} loading={countsLoading} />
          <PlatformCard title="Active Editions" value={platformCounts?.activeEditions || 0} icon={Zap} loading={countsLoading} />
          <PlatformCard title="Network Profiles" value={platformCounts?.networkProfiles || 0} icon={Handshake} loading={countsLoading} />
          <PlatformCard title="Collab Requests" value={platformCounts?.networkRequests || 0} icon={MessageSquare} loading={countsLoading} />
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Payment Status */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-[180px]" /> : paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                    {paymentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-muted-foreground text-center py-12">No payment data</p>}
          </CardContent>
        </Card>

        {/* Forge Mode */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Forge Mode</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-[180px]" /> : forgeModeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={forgeModeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                    {forgeModeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-muted-foreground text-center py-12">No data</p>}
          </CardContent>
        </Card>

        {/* Cohort Distribution */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cohort Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {cohortLoading ? <Skeleton className="h-[180px]" /> : cohortData && cohortData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={cohortData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="users" name="Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-muted-foreground text-center py-12">No cohort data</p>}
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion Bar */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Profile Completion Rate</CardTitle>
            <span className="text-2xl font-bold text-foreground">{completionRate}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{userStats?.completed || 0} completed</span>
            <span>{(userStats?.total || 0) - (userStats?.completed || 0)} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Engagement KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">User Engagement</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Updated {format(lastRefreshed, 'h:mm a')}</span>
            <Button size="sm" variant="outline" onClick={handleRefreshEngagement} className="gap-1.5 h-7 text-xs">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Logins (30d)</CardTitle>
              <div className="p-2 rounded-xl bg-primary/15"><LogIn className="w-4 h-4 text-primary" /></div>
            </CardHeader>
            <CardContent>
              {loginLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-3xl font-bold text-foreground tracking-tight">{loginStats?.total || 0}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {(loginStats?.trend || 0) >= 0 ? (
                      <Badge variant="secondary" className="text-emerald-600 bg-emerald-500/10 text-[10px] px-1.5 py-0">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />{loginStats?.trend || 0}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-rose-600 bg-rose-500/10 text-[10px] px-1.5 py-0">
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />{Math.abs(loginStats?.trend || 0)}%
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">vs yesterday</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Onboarding Done</CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/15"><ClipboardCheck className="w-4 h-4 text-emerald-500" /></div>
            </CardHeader>
            <CardContent>
              {funnelLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold text-foreground tracking-tight">{funnelData?.[1]?.count || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Creative Profiles</CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/15"><Palette className="w-4 h-4 text-blue-500" /></div>
            </CardHeader>
            <CardContent>
              {funnelLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold text-foreground tracking-tight">{funnelData?.[2]?.count || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Videos Watched</CardTitle>
              <div className="p-2 rounded-xl bg-amber-500/15"><PlayCircle className="w-4 h-4 text-amber-500" /></div>
            </CardHeader>
            <CardContent>
              {funnelLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold text-foreground tracking-tight">{funnelData?.[3]?.count || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Chart & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Logins</CardTitle>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardHeader>
          <CardContent>
            {loginLoading ? <Skeleton className="h-[220px] w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={loginStats?.dailyData || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="logins" name="Logins" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Engagement Funnel</CardTitle>
            <p className="text-xs text-muted-foreground">Drop-off across key milestones</p>
          </CardHeader>
          <CardContent>
            {funnelLoading ? <Skeleton className="h-[220px] w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={funnelData || []} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="step" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Users" radius={[0, 6, 6, 0]}>
                    {(funnelData || []).map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent User Activity Table */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent User Activity</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{(activityData || []).length} unique users with login activity</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activityLoading ? <Skeleton className="h-[300px] w-full" /> : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-center">Onboarding</TableHead>
                      <TableHead className="text-center">Profile</TableHead>
                      <TableHead className="text-center">Video</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedActivity.map((row: any) => (
                      <TableRow key={row.userId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={row.avatarUrl} />
                              <AvatarFallback className="text-[10px]">{(row.name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate max-w-[120px]">{row.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[160px]">{row.email}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{format(parseISO(row.loginDate), 'MMM d, h:mm a')}</TableCell>
                        <TableCell className="text-center">{row.onboarding ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</TableCell>
                        <TableCell className="text-center">{row.profileCreated ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</TableCell>
                        <TableCell className="text-center">{row.videoWatched ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</TableCell>
                      </TableRow>
                    ))}
                    {paginatedActivity.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No login activity yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-muted-foreground">Page {activityPage + 1} of {totalPages}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={activityPage === 0} onClick={() => setActivityPage(p => p - 1)} className="h-7 text-xs">Previous</Button>
                    <Button size="sm" variant="outline" disabled={activityPage >= totalPages - 1} onClick={() => setActivityPage(p => p + 1)} className="h-7 text-xs">Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>


      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Feature Toggles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Events Tab</div>
                <div className="text-xs text-muted-foreground">Show or hide Events in navigation</div>
              </div>
            </div>
            <Switch
              checked={isFeatureEnabled('events_enabled')}
              onCheckedChange={(checked) => {
                toggleFeature.mutate({ key: 'events_enabled', enabled: checked }, {
                  onSuccess: () => toast.success(`Events tab ${checked ? 'enabled' : 'disabled'}`),
                  onError: () => toast.error('Failed to update'),
                });
              }}
            />
          </div>

          {/* Community Chat Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 mt-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Community Chat</div>
                <div className="text-xs text-muted-foreground">Show or hide Chat in Community</div>
              </div>
            </div>
            <Switch
              checked={isFeatureEnabled('community_chat_enabled')}
              onCheckedChange={(checked) => {
                toggleFeature.mutate({ key: 'community_chat_enabled', enabled: checked }, {
                  onSuccess: () => toast.success(`Community Chat ${checked ? 'enabled' : 'disabled'}`),
                  onError: () => toast.error('Failed to update'),
                });
              }}
            />
          </div>

          {/* Updates Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 mt-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Updates Tab</div>
                <div className="text-xs text-muted-foreground">Show or hide Updates in navigation</div>
              </div>
            </div>
            <Switch
              checked={isFeatureEnabled('updates_enabled')}
              onCheckedChange={(checked) => {
                toggleFeature.mutate({ key: 'updates_enabled', enabled: checked }, {
                  onSuccess: () => toast.success(`Updates tab ${checked ? 'enabled' : 'disabled'}`),
                  onError: () => toast.error('Failed to update'),
                });
              }}
            />
          </div>

          {/* Pre Forge Sessions Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 mt-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Pre Forge Sessions</div>
                <div className="text-xs text-muted-foreground">Show or hide Pre Forge Sessions on Learn tab</div>
              </div>
            </div>
            <Switch
              checked={isFeatureEnabled('pre_forge_sessions_enabled')}
              onCheckedChange={(checked) => {
                toggleFeature.mutate({ key: 'pre_forge_sessions_enabled', enabled: checked }, {
                  onSuccess: () => toast.success(`Pre Forge Sessions ${checked ? 'enabled' : 'disabled'}`),
                  onError: () => toast.error('Failed to update'),
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button size="sm" onClick={() => navigate('/admin/users?action=create')} className="gap-2">
            <Users className="w-3.5 h-3.5" />
            Create User
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/admin/editions?action=create')} className="gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Create Edition
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/admin/roadmap')} className="gap-2">
            <Map className="w-3.5 h-3.5" />
            Manage Roadmap
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/admin/learn')} className="gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            Manage Content
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

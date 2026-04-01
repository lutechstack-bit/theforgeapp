import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, Calendar, CalendarDays, CreditCard, BookOpen, MessageSquare, 
  TrendingUp, ArrowUpRight, ArrowDownRight, LogIn, Palette, RefreshCw,
  Check, X, AlertTriangle, Eye, Info, Map, UserX, ChevronDown, ClipboardCheck, UserCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { format, subDays, parseISO, isToday, isYesterday } from 'date-fns';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';

// --- Hooks ---

function useUserStats() {
  return useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const [profilesRes, collabRes] = await Promise.all([
        supabase.from('profiles').select('id, payment_status, forge_mode, profile_setup_completed, ky_form_completed, created_at'),
        supabase.from('collaborator_profiles').select('id', { count: 'exact', head: true }),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      const profiles = profilesRes.data || [];
      return {
        total: profiles.length,
        completed: profiles.filter(p => p.profile_setup_completed).length,
        kyFormsCompleted: profiles.filter(p => p.ky_form_completed).length,
        communityProfiles: collabRes.count || 0,
        balancePaid: profiles.filter(p => p.payment_status === 'BALANCE_PAID').length,
        balancePending: profiles.filter(p => p.payment_status === 'CONFIRMED_15K').length,
        preForge: profiles.filter(p => p.forge_mode === 'PRE_FORGE').length,
        duringForge: profiles.filter(p => p.forge_mode === 'DURING_FORGE').length,
        postForge: profiles.filter(p => p.forge_mode === 'POST_FORGE').length,
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
      const grouped: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        grouped[format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')] = 0;
      }
      (data || []).forEach(p => {
        const day = format(parseISO(p.created_at), 'yyyy-MM-dd');
        if (grouped[day] !== undefined) grouped[day]++;
      });
      return Object.entries(grouped).map(([date, count]) => ({
        date, label: format(parseISO(date), 'MMM d'), users: count,
      }));
    },
  });
}

function useCohortDistribution() {
  return useQuery({
    queryKey: ['admin-cohort-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase.from('editions').select('id, name, cohort_type, is_archived').eq('is_archived', false);
      if (error) throw error;
      const { data: profiles } = await supabase.from('profiles').select('edition_id');
      const editionCounts: Record<string, number> = {};
      (profiles || []).forEach(p => { if (p.edition_id) editionCounts[p.edition_id] = (editionCounts[p.edition_id] || 0) + 1; });
      return (data || []).map(e => ({
        name: e.name.length > 15 ? e.name.slice(0, 15) + '…' : e.name,
        users: editionCounts[e.id] || 0,
      })).filter(e => e.users > 0).sort((a, b) => b.users - a.users);
    },
  });
}

function useLoginStats() {
  return useQuery({
    queryKey: ['admin-login-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from('user_activity_logs').select('created_at').eq('event_type', 'login').gte('created_at', thirtyDaysAgo);
      if (error) throw error;
      const logs = data || [];
      const todayCount = logs.filter(l => isToday(parseISO(l.created_at))).length;
      const yesterdayCount = logs.filter(l => isYesterday(parseISO(l.created_at))).length;
      const trend = yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : todayCount > 0 ? 100 : 0;
      const grouped: Record<string, number> = {};
      for (let i = 0; i < 30; i++) grouped[format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')] = 0;
      logs.forEach(l => { const day = format(parseISO(l.created_at), 'yyyy-MM-dd'); if (grouped[day] !== undefined) grouped[day]++; });
      const dailyData = Object.entries(grouped).map(([date, count]) => ({ date, label: format(parseISO(date), 'MMM d'), logins: count }));
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
      const uniqueLogins = new Set((loginRes.data || []).map((l: any) => l.user_id)).size;
      const uniqueWatchers = new Set((watchRes.data || []).map((w: any) => w.user_id)).size;
      return [
        { step: 'Logged In', count: uniqueLogins, fill: 'hsl(var(--primary))' },
        { step: 'Onboarded', count: profileRes.count || 0, fill: 'hsl(152, 69%, 40%)' },
        { step: 'Profile', count: collabRes.count || 0, fill: 'hsl(217, 91%, 60%)' },
        { step: 'Watched', count: uniqueWatchers, fill: 'hsl(36, 88%, 50%)' },
      ];
    },
  });
}

function useRecentActivity() {
  return useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from('user_activity_logs').select('user_id, created_at, event_type').eq('event_type', 'login')
        .order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      const userIds = [...new Set((logs || []).map(l => l.user_id))];
      if (!userIds.length) return [];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, avatar_url, profile_setup_completed');
      const profileLookup: Record<string, any> = {};
      (profiles || []).forEach(p => { profileLookup[p.id] = p; });
      const { data: collabs } = await supabase.from('collaborator_profiles').select('user_id');
      const collabSet = new Set((collabs || []).map(c => c.user_id));
      const { data: watches } = await supabase.from('learn_watch_progress').select('user_id');
      const watchSet = new Set((watches || []).map(w => w.user_id));
      const seen = new Set<string>();
      const rows: any[] = [];
      for (const log of (logs || [])) {
        if (seen.has(log.user_id)) continue;
        seen.add(log.user_id);
        const profile = profileLookup[log.user_id];
        rows.push({
          userId: log.user_id, name: profile?.full_name || 'Unknown', email: profile?.email || '—',
          avatarUrl: profile?.avatar_url, loginDate: log.created_at,
          onboarding: profile?.profile_setup_completed || false,
          profileCreated: collabSet.has(log.user_id), videoWatched: watchSet.has(log.user_id),
        });
      }
      return rows;
    },
  });
}

function useSmartAlerts() {
  return useQuery({
    queryKey: ['admin-smart-alerts'],
    queryFn: async () => {
      const alerts: { id: string; type: 'warning' | 'info'; message: string; link: string }[] = [];
      const { count: pendingKy } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('ky_form_completed', false);
      if (pendingKy && pendingKy > 0) {
        alerts.push({ id: 'pending-ky', type: 'warning', message: `${pendingKy} users haven't completed their KY forms`, link: '/admin/ky-forms' });
      }
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data: activeUsers } = await supabase.from('user_activity_logs').select('user_id').eq('event_type', 'login').gte('created_at', sevenDaysAgo);
      const { count: totalUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const activeCount = new Set((activeUsers || []).map(u => u.user_id)).size;
      const inactiveCount = (totalUsers || 0) - activeCount;
      if (inactiveCount > 0) {
        alerts.push({ id: 'inactive-users', type: 'info', message: `${inactiveCount} users haven't logged in for 7+ days`, link: '/admin/activity' });
      }
      return alerts;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useNeverLoggedIn() {
  return useQuery({
    queryKey: ['admin-never-logged-in'],
    queryFn: async () => {
      const [profilesRes, loginsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, avatar_url, created_at'),
        supabase.from('user_activity_logs').select('user_id').eq('event_type', 'login'),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      const loggedInIds = new Set((loginsRes.data || []).map((l: any) => l.user_id));
      const neverLogged = (profilesRes.data || []).filter(p => !loggedInIds.has(p.id));
      return neverLogged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });
}

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  amber: 'hsl(36, 88%, 50%)',
  emerald: 'hsl(152, 69%, 40%)',
  blue: 'hsl(217, 91%, 60%)',
  rose: 'hsl(350, 89%, 60%)',
};
const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.amber, CHART_COLORS.emerald, CHART_COLORS.blue, CHART_COLORS.rose];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">{p.name}: <span className="font-semibold text-foreground">{p.value}</span></p>
      ))}
    </div>
  );
};

const FEATURE_TOGGLES = [
  { key: 'events_enabled', label: 'Events Tab', desc: 'Show/hide Events', icon: CalendarDays },
  { key: 'community_chat_enabled', label: 'Community Chat', desc: 'Show/hide Chat', icon: MessageSquare },
  { key: 'updates_enabled', label: 'Updates Tab', desc: 'Show/hide Updates', icon: Info },
  { key: 'pre_forge_sessions_enabled', label: 'Pre Forge Sessions', desc: 'Show/hide on Learn', icon: BookOpen },
];

// --- Main Dashboard ---

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: growthData, isLoading: growthLoading } = useGrowthData();
  const { data: cohortData, isLoading: cohortLoading } = useCohortDistribution();
  const { isFeatureEnabled, toggleFeature } = useFeatureFlags();
  const { data: loginStats, isLoading: loginLoading, refetch: refetchLogins } = useLoginStats();
  const { data: funnelData, isLoading: funnelLoading, refetch: refetchFunnel } = useEngagementFunnel();
  const { data: activityData, isLoading: activityLoading, refetch: refetchActivity } = useRecentActivity();
  const { data: alerts } = useSmartAlerts();
  const { data: neverLoggedIn, isLoading: neverLoggedLoading } = useNeverLoggedIn();
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showNeverLogged, setShowNeverLogged] = useState(false);
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

  const handleRefresh = () => {
    refetchLogins(); refetchFunnel(); refetchActivity();
    setLastRefreshed(new Date());
    toast.success('Dashboard refreshed');
  };

  const completionRate = userStats ? Math.round((userStats.completed / Math.max(userStats.total, 1)) * 100) : 0;
  const paymentData = userStats ? [
    { name: 'Paid', value: userStats.balancePaid },
    { name: 'Pending', value: userStats.balancePending },
  ].filter(d => d.value > 0) : [];

  const visibleAlerts = (alerts || []).filter(a => !dismissedAlerts.has(a.id));
  const displayedActivity = showAllActivity ? (activityData || []) : (activityData || []).slice(0, 5);

  const kpiCards = [
    { label: 'People', value: userStats?.total || 0, subtitle: 'signed up', icon: Users, color: 'text-primary', bg: 'bg-primary/15', link: '/admin/users' },
    { label: 'Onboarded', value: `${completionRate}%`, subtitle: `${userStats?.completed || 0} of ${userStats?.total || 0}`, icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500/15', link: '/admin/users' },
    { label: 'Profiles', value: funnelData?.[2]?.count || 0, subtitle: 'creative profiles', icon: Palette, color: 'text-blue-500', bg: 'bg-blue-500/15', link: '/admin/network' },
    { label: 'Logins Today', value: loginStats?.todayCount || 0, subtitle: undefined, icon: LogIn, color: 'text-primary', bg: 'bg-primary/15', link: '/admin/activity', trend: loginStats?.trend },
    { label: 'Never Logged In', value: neverLoggedIn?.length || 0, subtitle: 'since signup', icon: UserX, color: 'text-amber-500', bg: 'bg-amber-500/15', link: '', isToggle: true },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Welcome back! 👋</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')} · Updated {format(lastRefreshed, 'h:mm a')}</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} className="gap-1.5 h-8 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Smart Alerts */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-1.5">
          {visibleAlerts.map(alert => (
            <div key={alert.id} className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg border text-sm",
              alert.type === 'warning' ? "bg-amber-500/5 border-amber-500/20" : "bg-blue-500/5 border-blue-500/20"
            )}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn("w-3.5 h-3.5", alert.type === 'warning' ? "text-amber-500" : "text-blue-500")} />
                <span className="text-xs text-foreground">{alert.message}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2" onClick={() => navigate(alert.link)}>
                  <Eye className="w-3 h-3" /> View
                </Button>
                <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => dismissAlert(alert.id)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpiCards.map((kpi: any) => (
          <Card
            key={kpi.label}
            className={cn(
              "bg-card/60 border-border/40 cursor-pointer hover:scale-[1.02] hover:border-primary/30 transition-all",
              kpi.isToggle && showNeverLogged && "border-amber-500/40 bg-amber-500/5"
            )}
            onClick={() => kpi.isToggle ? setShowNeverLogged(!showNeverLogged) : navigate(kpi.link)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                <div className={cn("p-1.5 rounded-lg", kpi.bg)}>
                  <kpi.icon className={cn("w-3.5 h-3.5", kpi.color)} />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {statsLoading || loginLoading || funnelLoading || neverLoggedLoading ? <Skeleton className="h-7 w-14" /> : kpi.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {kpi.trend !== undefined && !loginLoading && (
                  <Badge variant="secondary" className={cn(
                    "text-[10px] px-1.5 py-0 h-4",
                    kpi.trend >= 0 ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
                  )}>
                    {kpi.trend >= 0 ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                    {Math.abs(kpi.trend)}%
                  </Badge>
                )}
                {kpi.subtitle && <span className="text-[10px] text-muted-foreground">{kpi.subtitle}</span>}
                {kpi.isToggle && (
                  <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform ml-auto", showNeverLogged && "rotate-180")} />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Never Logged In Panel */}
      {showNeverLogged && (
        <Card className="bg-card/60 border-amber-500/20 animate-in slide-in-from-top-2 duration-200">
          <CardHeader className="pb-1 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserX className="w-4 h-4 text-amber-500" />
                Users who never logged in ({neverLoggedIn?.length || 0})
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setShowNeverLogged(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {neverLoggedLoading ? <Skeleton className="h-[120px] w-full" /> : (
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">User</TableHead>
                      <TableHead className="text-[10px]">Email</TableHead>
                      <TableHead className="text-[10px]">Signed Up</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(neverLoggedIn || []).map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="text-[8px]">{(user.full_name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium truncate max-w-[120px]">{user.full_name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground truncate max-w-[160px]">{user.email || '—'}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{format(parseISO(user.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                    {(neverLoggedIn || []).length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-6">Everyone has logged in! 🎉</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
          <TabsTrigger value="controls" className="text-xs">Controls</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          {/* Growth Sparkline */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-1 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Signups — 30 days</CardTitle>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {growthData?.reduce((s, d) => s + d.users, 0) || 0} total
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              {growthLoading ? <Skeleton className="h-[120px] w-full" /> : (
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={growthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="users" name="Signups" stroke="hsl(var(--primary))" fill="url(#growthGrad)" strokeWidth={2} dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: 'hsl(var(--primary))' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Payment + Cohort side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border/40">
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-sm">Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {statsLoading ? <Skeleton className="h-[140px]" /> : paymentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={paymentData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value" stroke="none">
                        {paymentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-xs text-muted-foreground text-center py-8">No payment data</p>}
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/40">
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-sm">Cohort Distribution</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {cohortLoading ? <Skeleton className="h-[140px]" /> : cohortData && cohortData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={cohortData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="users" name="Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-xs text-muted-foreground text-center py-8">No cohort data</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ENGAGEMENT TAB */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border/40">
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-sm">Daily Logins — 30 days</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {loginLoading ? <Skeleton className="h-[160px] w-full" /> : (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={loginStats?.dailyData || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="logins" name="Logins" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/40">
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-sm">Engagement Funnel</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {funnelLoading ? <Skeleton className="h-[160px] w-full" /> : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={funnelData || []} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="step" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Users" radius={[0, 6, 6, 0]}>
                        {(funnelData || []).map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Compact Activity Table */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-1 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Recent Logins</CardTitle>
                <span className="text-[10px] text-muted-foreground">{(activityData || []).length} users</span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              {activityLoading ? <Skeleton className="h-[180px] w-full" /> : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px]">User</TableHead>
                          <TableHead className="text-[10px]">Last Login</TableHead>
                          <TableHead className="text-center text-[10px]">Setup</TableHead>
                          <TableHead className="text-center text-[10px]">Profile</TableHead>
                          <TableHead className="text-center text-[10px]">Video</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedActivity.map((row: any) => (
                          <TableRow key={row.userId}>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={row.avatarUrl} />
                                  <AvatarFallback className="text-[8px]">{(row.name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium truncate max-w-[100px]">{row.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap py-2">{format(parseISO(row.loginDate), 'MMM d, h:mm a')}</TableCell>
                            <TableCell className="text-center py-2">{row.onboarding ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />}</TableCell>
                            <TableCell className="text-center py-2">{row.profileCreated ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />}</TableCell>
                            <TableCell className="text-center py-2">{row.videoWatched ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />}</TableCell>
                          </TableRow>
                        ))}
                        {displayedActivity.length === 0 && (
                          <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">No activity yet</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {(activityData || []).length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-xs h-7" onClick={() => setShowAllActivity(!showAllActivity)}>
                      {showAllActivity ? 'Show less' : `Show all ${(activityData || []).length} users`}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTROLS TAB */}
        <TabsContent value="controls" className="space-y-4">
          {/* Feature Toggles Grid */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Feature Toggles</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {FEATURE_TOGGLES.map(ft => (
                  <div key={ft.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <ft.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{ft.label}</div>
                        <div className="text-[10px] text-muted-foreground">{ft.desc}</div>
                      </div>
                    </div>
                    <Switch
                      checked={isFeatureEnabled(ft.key)}
                      onCheckedChange={(checked) => {
                        toggleFeature.mutate({ key: ft.key, enabled: checked }, {
                          onSuccess: () => toast.success(`${ft.label} ${checked ? 'enabled' : 'disabled'}`),
                          onError: () => toast.error('Failed to update'),
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate('/admin/users?action=create')} className="gap-1.5 h-8 text-xs">
                <Users className="w-3.5 h-3.5" /> Create User
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/editions?action=create')} className="gap-1.5 h-8 text-xs">
                <Calendar className="w-3.5 h-3.5" /> Create Edition
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/roadmap')} className="gap-1.5 h-8 text-xs">
                <Map className="w-3.5 h-3.5" /> Manage Roadmap
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/learn')} className="gap-1.5 h-8 text-xs">
                <BookOpen className="w-3.5 h-3.5" /> Manage Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, Calendar, CreditCard, Zap, BookOpen, MessageSquare, 
  UserCheck, GraduationCap, Map, TrendingUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

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
      const [learn, events, messages, mentors, roadmap, editions, kyf] = await Promise.all([
        supabase.from('learn_content').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('community_messages').select('id', { count: 'exact', head: true }),
        supabase.from('mentors').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('roadmap_days').select('id', { count: 'exact', head: true }),
        supabase.from('editions').select('id', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('kyf_responses').select('id', { count: 'exact', head: true }),
      ]);
      return {
        learnContent: learn.count || 0,
        events: events.count || 0,
        messages: messages.count || 0,
        mentors: mentors.count || 0,
        roadmapDays: roadmap.count || 0,
        activeEditions: editions.count || 0,
        kyForms: kyf.count || 0,
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

// --- Chart Colors ---
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

// --- Main Dashboard ---

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: growthData, isLoading: growthLoading } = useGrowthData();
  const { data: platformCounts, isLoading: countsLoading } = usePlatformCounts();
  const { data: cohortData, isLoading: cohortLoading } = useCohortDistribution();

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

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time overview of your LevelUp community</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Users, LogIn, Eye, TrendingUp, CalendarIcon, Clock } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, startOfYesterday, endOfYesterday } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import AllUsersActivity from '@/components/admin/AllUsersActivity';

type ActivityLog = {
  id: string;
  user_id: string;
  event_type: string;
  page_path: string | null;
  page_name: string | null;
  created_at: string;
  metadata: any;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

type Preset = 'today' | 'yesterday' | '7' | '30' | 'custom';

const HOUR_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h12 = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return { value: String(i), label: `${h12}:00 ${ampm}` };
});

const AdminActivity: React.FC = () => {
  const [preset, setPreset] = useState<Preset>('7');
  const [eventFilter, setEventFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [fromHour, setFromHour] = useState('0');
  const [toHour, setToHour] = useState('23');
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // Compute date range from preset or custom
  const { sinceDate, untilDate } = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case 'today':
        return { sinceDate: startOfDay(now).toISOString(), untilDate: endOfDay(now).toISOString() };
      case 'yesterday':
        return { sinceDate: startOfYesterday().toISOString(), untilDate: endOfYesterday().toISOString() };
      case '7':
        return { sinceDate: startOfDay(subDays(now, 7)).toISOString(), untilDate: endOfDay(now).toISOString() };
      case '30':
        return { sinceDate: startOfDay(subDays(now, 30)).toISOString(), untilDate: endOfDay(now).toISOString() };
      case 'custom': {
        const from = fromDate ? new Date(fromDate) : subDays(now, 7);
        from.setHours(parseInt(fromHour), 0, 0, 0);
        const to = toDate ? new Date(toDate) : now;
        to.setHours(parseInt(toHour), 59, 59, 999);
        return { sinceDate: from.toISOString(), untilDate: to.toISOString() };
      }
      default:
        return { sinceDate: startOfDay(subDays(now, 7)).toISOString(), untilDate: endOfDay(now).toISOString() };
    }
  }, [preset, fromDate, toDate, fromHour, toHour]);

  // Fetch user list for filter
  const { data: userList = [] } = useQuery({
    queryKey: ['admin-activity-users'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, avatar_url').order('full_name');
      return data || [];
    },
  });

  // Fetch activity
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['admin-activity', sinceDate, untilDate, eventFilter, userFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .gte('created_at', sinceDate)
        .lte('created_at', untilDate)
        .order('created_at', { ascending: false })
        .limit(preset === 'custom' ? 500 : 200);

      if (eventFilter !== 'all') query = query.eq('event_type', eventFilter);
      if (userFilter !== 'all') query = query.eq('user_id', userFilter);

      const { data, error } = await query;
      if (error) throw error;

      const userIds = [...new Set((data || []).map(a => a.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return (data || []).map(a => ({
        ...a,
        profiles: profileMap.get(a.user_id) || null,
      })) as ActivityLog[];
    },
  });

  const totalLogins = activities.filter(a => a.event_type === 'login').length;
  const totalPageViews = activities.filter(a => a.event_type === 'page_view').length;
  const uniqueUsers = new Set(activities.map(a => a.user_id)).size;

  const pageDistribution = activities
    .filter(a => a.event_type === 'page_view' && a.page_name)
    .reduce<Record<string, number>>((acc, a) => {
      const name = a.page_name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

  const chartData = Object.entries(pageDistribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const presetButtons: { label: string; value: Preset }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: '7 days', value: '7' },
    { label: '30 days', value: '30' },
    { label: 'Custom', value: 'custom' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Activity</h1>
        <p className="text-sm text-muted-foreground">Track logins & page visits</p>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          {/* Filter Controls */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {presetButtons.map(p => (
                  <Button key={p.value} size="sm" variant={preset === p.value ? 'default' : 'outline'} onClick={() => setPreset(p.value)}>{p.label}</Button>
                ))}
              </div>

              {preset === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">From</label>
                    <div className="flex gap-2">
                      <Popover open={fromOpen} onOpenChange={setFromOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !fromDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />{fromDate ? format(fromDate, 'PPP') : 'Pick date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={fromDate} onSelect={(d) => { setFromDate(d); setFromOpen(false); }} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <Select value={fromHour} onValueChange={setFromHour}>
                        <SelectTrigger className="w-[120px]"><Clock className="mr-1 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">{HOUR_SLOTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">To</label>
                    <div className="flex gap-2">
                      <Popover open={toOpen} onOpenChange={setToOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !toDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />{toDate ? format(toDate, 'PPP') : 'Pick date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={toDate} onSelect={(d) => { setToDate(d); setToOpen(false); }} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <Select value={toHour} onValueChange={setToHour}>
                        <SelectTrigger className="w-[120px]"><Clock className="mr-1 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">{HOUR_SLOTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[200px]"><Users className="mr-1 h-3.5 w-3.5" /><SelectValue placeholder="All Users" /></SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    <SelectItem value="all">All Users</SelectItem>
                    {userList.map(u => (<SelectItem key={u.id} value={u.id}><span className="truncate">{u.full_name || 'Unnamed'}</span></SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="login">Logins</SelectItem>
                    <SelectItem value="page_view">Page Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="flex items-center gap-4 p-5"><div className="p-3 rounded-xl bg-primary/10"><LogIn className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{totalLogins}</p><p className="text-xs text-muted-foreground">Logins</p></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-5"><div className="p-3 rounded-xl bg-primary/10"><Eye className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{totalPageViews}</p><p className="text-xs text-muted-foreground">Page Views</p></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-5"><div className="p-3 rounded-xl bg-primary/10"><Users className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{uniqueUsers}</p><p className="text-xs text-muted-foreground">Active Users</p></div></CardContent></Card>
          </div>

          {chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Most Visited Pages</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-xs fill-muted-foreground" />
                      <YAxis type="category" dataKey="name" width={90} className="text-xs fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4" /> Recent Activity</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-sm py-8 text-center">Loading activity...</p>
              ) : activities.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No activity found for this period.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Event</TableHead><TableHead>Page</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {activities.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarImage src={a.profiles?.avatar_url || ''} /><AvatarFallback className="text-xs">{(a.profiles?.full_name || '?')[0]}</AvatarFallback></Avatar><span className="text-sm truncate max-w-[120px]">{a.profiles?.full_name || 'Unknown'}</span></div></TableCell>
                        <TableCell><Badge variant={a.event_type === 'login' ? 'default' : 'secondary'} className="text-xs">{a.event_type === 'login' ? 'Login' : 'Page View'}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.page_name || a.page_path || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(a.created_at), 'MMM d, h:mm a')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <AllUsersActivity />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminActivity;

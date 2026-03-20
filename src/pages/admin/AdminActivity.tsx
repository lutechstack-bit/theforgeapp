import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Users, LogIn, Eye, TrendingUp } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

const DATE_RANGES = [
  { label: 'Today', value: '0' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
];

const AdminActivity: React.FC = () => {
  const [dateRange, setDateRange] = useState('7');
  const [eventFilter, setEventFilter] = useState('all');

  const sinceDate = startOfDay(subDays(new Date(), parseInt(dateRange))).toISOString();

  // Fetch recent activity with profiles
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['admin-activity', dateRange, eventFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_activity_logs')
        .select('*, profiles!inner(full_name, avatar_url)')
        .gte('created_at', sinceDate)
        .order('created_at', { ascending: false })
        .limit(200);

      if (eventFilter !== 'all') {
        query = query.eq('event_type', eventFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ActivityLog[];
    },
  });

  // Compute stats
  const totalLogins = activities.filter(a => a.event_type === 'login').length;
  const totalPageViews = activities.filter(a => a.event_type === 'page_view').length;
  const uniqueUsers = new Set(activities.map(a => a.user_id)).size;

  // Page visit distribution
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Activity</h1>
          <p className="text-sm text-muted-foreground">Track logins & page visits</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="login">Logins</SelectItem>
              <SelectItem value="page_view">Page Views</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-primary/10">
              <LogIn className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalLogins}</p>
              <p className="text-xs text-muted-foreground">Logins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-primary/10">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalPageViews}</p>
              <p className="text-xs text-muted-foreground">Page Views</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{uniqueUsers}</p>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Distribution Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Most Visited Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis type="category" dataKey="name" width={90} className="text-xs fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading activity...</p>
          ) : activities.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No activity found for this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={a.profiles?.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {(a.profiles?.full_name || '?')[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[120px]">
                          {a.profiles?.full_name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.event_type === 'login' ? 'default' : 'secondary'} className="text-xs">
                        {a.event_type === 'login' ? 'Login' : 'Page View'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.page_name || a.page_path || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(a.created_at), 'MMM d, h:mm a')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivity;

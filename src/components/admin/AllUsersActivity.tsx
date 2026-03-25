import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

type UserWithActivity = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  last_login: string | null;
  last_seen: string | null;
  login_count: number;
  page_view_count: number;
};

const AllUsersActivity: React.FC = () => {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-all-users-activity'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, created_at')
        .order('full_name');
      if (pErr) throw pErr;

      // Get activity summary per user
      const { data: logs } = await supabase
        .from('user_activity_logs')
        .select('user_id, event_type, created_at')
        .order('created_at', { ascending: false });

      const activityMap = new Map<string, { last_login: string | null; last_seen: string | null; logins: number; views: number }>();

      (logs || []).forEach(log => {
        const existing = activityMap.get(log.user_id) || { last_login: null, last_seen: null, logins: 0, views: 0 };
        
        if (!existing.last_seen || log.created_at > existing.last_seen) {
          existing.last_seen = log.created_at;
        }

        if (log.event_type === 'login') {
          existing.logins++;
          if (!existing.last_login || log.created_at > existing.last_login) {
            existing.last_login = log.created_at;
          }
        } else if (log.event_type === 'page_view') {
          existing.views++;
        }

        activityMap.set(log.user_id, existing);
      });

      return (profiles || []).map(p => {
        const activity = activityMap.get(p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          email: p.email,
          created_at: p.created_at,
          last_login: activity?.last_login || null,
          last_seen: activity?.last_seen || null,
          login_count: activity?.logins || 0,
          page_view_count: activity?.views || 0,
        } as UserWithActivity;
      });
    },
  });

  const getStatusBadge = (user: UserWithActivity) => {
    if (!user.last_seen) {
      return <Badge variant="outline" className="text-xs text-muted-foreground">Never Logged In</Badge>;
    }
    const lastSeen = new Date(user.last_seen);
    const daysSince = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 3) {
      return <Badge className="text-xs bg-emerald-500/15 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">Active</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" /> All Registered Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No users found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Logins</TableHead>
                <TableHead className="text-center">Page Views</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="text-xs">{(user.full_name || '?')[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[140px]">{user.full_name || 'Unnamed'}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{user.email || ''}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{user.login_count}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{user.page_view_count}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {user.last_login ? format(new Date(user.last_login), 'MMM d, h:mm a') : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {user.last_seen ? formatDistanceToNow(new Date(user.last_seen), { addSuffix: true }) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AllUsersActivity;

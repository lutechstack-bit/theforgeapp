import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, ClipboardList, LogIn } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format, subDays, parseISO } from 'date-fns';

export const AdminNotifications: React.FC = () => {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const yesterday = subDays(new Date(), 1).toISOString();
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();

      const [signupsRes, pendingKyRes, recentLoginsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, created_at').gte('created_at', yesterday).order('created_at', { ascending: false }).limit(10),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('ky_form_completed', false),
        supabase.from('user_activity_logs').select('user_id, created_at').eq('event_type', 'login').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(5),
      ]);

      return {
        newSignups: signupsRes.data || [],
        pendingKyCount: pendingKyRes.count || 0,
        recentLogins: recentLoginsRes.data || [],
      };
    },
    refetchInterval: 60000,
  });

  const totalCount = (data?.newSignups.length || 0) + (data?.pendingKyCount ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {data?.pendingKyCount ? (
            <button
              onClick={() => navigate('/admin/ky-forms')}
              className="flex items-start gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/15 mt-0.5">
                <ClipboardList className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{data.pendingKyCount} pending KY forms</p>
                <p className="text-xs text-muted-foreground">Users haven't completed their forms</p>
              </div>
            </button>
          ) : null}

          {data?.newSignups.map(signup => (
            <button
              key={signup.id}
              onClick={() => navigate('/admin/users')}
              className="flex items-start gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/15 mt-0.5">
                <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{signup.full_name || 'New user'} signed up</p>
                <p className="text-xs text-muted-foreground">{format(parseISO(signup.created_at), 'MMM d, h:mm a')}</p>
              </div>
            </button>
          ))}

          {!data?.pendingKyCount && !data?.newSignups.length && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              All caught up! 🎉
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

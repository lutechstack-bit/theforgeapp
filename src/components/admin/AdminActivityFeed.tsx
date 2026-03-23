import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface AdminActivityFeedProps {
  children?: React.ReactNode;
}

export const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({ children }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['admin-activity-feed'],
    queryFn: async () => {
      const { data: logs } = await supabase
        .from('user_activity_logs')
        .select('id, user_id, event_type, page_name, page_path, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!logs?.length) return [];

      const userIds = [...new Set(logs.map(l => l.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach(p => { profileMap[p.id] = p; });

      return logs.map(log => ({
        ...log,
        profile: profileMap[log.user_id] || null,
      }));
    },
    refetchInterval: 30000,
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <Activity className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[420px] p-0">
        <SheetHeader className="px-4 py-3 border-b border-border/50">
          <SheetTitle className="text-base">Live Activity Feed</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100vh-60px)]">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Loading...</div>
          ) : (activities || []).length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">No recent activity</div>
          ) : (
            (activities || []).map(item => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/30 hover:bg-muted/30 transition-colors">
                <Avatar className="h-7 w-7 mt-0.5">
                  <AvatarImage src={item.profile?.avatar_url} />
                  <AvatarFallback className="text-[9px]">
                    {(item.profile?.full_name || '?').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.profile?.full_name || 'Unknown'}
                    </span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">
                      {item.event_type === 'login' ? '🔑 Login' : '👁 View'}
                    </Badge>
                  </div>
                  {item.page_name && (
                    <p className="text-xs text-muted-foreground truncate">{item.page_name}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

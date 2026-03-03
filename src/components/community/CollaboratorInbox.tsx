import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Inbox, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type RequestStatus = 'all' | 'unread' | 'actioned';

export const CollaboratorInbox: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<RequestStatus>('all');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['collaboration-requests-inbox', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('collaboration_requests')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch sender profiles
      const userIds = [...new Set((data || []).map(r => r.from_user_id === user.id ? r.to_user_id : r.from_user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, city')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return (data || []).map(r => {
        const otherId = r.from_user_id === user.id ? r.to_user_id : r.from_user_id;
        const otherProfile = profileMap.get(otherId);
        return {
          ...r,
          other_name: otherProfile?.full_name || 'Unknown',
          other_avatar: otherProfile?.avatar_url,
          other_city: otherProfile?.city,
          is_received: r.to_user_id === user.id,
        };
      });
    },
    enabled: !!user,
  });

  const unreadCount = requests.filter(r => r.is_received && r.status === 'unread').length;

  const filtered = requests.filter(r => {
    if (filter === 'unread') return r.is_received && r.status === 'unread';
    if (filter === 'actioned') return r.status === 'accepted' || r.status === 'declined';
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('collaboration_requests')
      .update({ status })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success(status === 'accepted' ? 'Request accepted!' : 'Request declined');
      queryClient.invalidateQueries({ queryKey: ['collaboration-requests-inbox'] });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Inbox className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Collaboration Inbox</SheetTitle>
        </SheetHeader>

        {/* Filters */}
        <div className="flex gap-2 mt-4 mb-3">
          {(['all', 'unread', 'actioned'] as RequestStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 text-muted-foreground border-border/50'
              )}
            >
              {f === 'all' ? 'All' : f === 'unread' ? `Unread (${unreadCount})` : 'Actioned'}
            </button>
          ))}
        </div>

        {/* Request List */}
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No requests yet</p>
          ) : (
            filtered.map((req) => {
              const initials = (req.other_name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2);
              return (
                <div key={req.id} className="p-3 rounded-xl border border-border/50 bg-card/50 space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={req.other_avatar || undefined} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.other_name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn('text-[10px]',
                      req.status === 'unread' && 'border-primary/50 text-primary',
                      req.status === 'accepted' && 'border-emerald-400/50 text-emerald-400',
                      req.status === 'declined' && 'border-destructive/50 text-destructive',
                      req.status === 'read' && 'border-border text-muted-foreground',
                    )}>
                      {req.is_received ? (req.status === 'unread' ? 'New' : req.status) : 'Sent'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{req.message}</p>
                  {req.is_received && (req.status === 'unread' || req.status === 'read') && (
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs flex-1 gap-1" onClick={() => updateStatus(req.id, 'accepted')}>
                        <Check className="w-3 h-3" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1" onClick={() => updateStatus(req.id, 'declined')}>
                        <X className="w-3 h-3" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast } from 'date-fns';
import { Video, Clock, User, Radio, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LiveSessionCard: React.FC = () => {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ['next-live-session'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .in('status', ['scheduled', 'live'])
        .gte('end_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
  });

  if (!session) return null;

  const startAt = new Date(session.start_at);
  const isLive = session.status === 'live' || (isPast(startAt) && !isPast(new Date(session.end_at)));

  return (
    <button
      onClick={() => navigate(`/live-session/${session.id}`)}
      className="w-full text-left group"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 sm:p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]">
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isLive ? 'bg-red-500/20' : 'bg-primary/20'}`}>
            {isLive ? <Radio className="w-6 h-6 text-red-400 animate-pulse" /> : <Video className="w-6 h-6 text-primary" />}
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${isLive ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}
              >
                {isLive ? 'LIVE NOW' : 'UPCOMING'}
              </Badge>
            </div>

            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {session.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {session.mentor_name && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {session.mentor_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {format(startAt, 'MMM d, h:mm a')}
              </span>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 self-center group-hover:text-primary transition-colors" />
        </div>
      </div>
    </button>
  );
};

export default LiveSessionCard;

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Video, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateGoogleCalendarUrl } from '@/lib/calendarUtils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { SessionDetailModal } from './SessionDetailModal';

interface VirtualSession {
  id: string;
  title: string;
  description: string | null;
  day_number: number;
  date: string | null;
  session_start_time: string | null;
  session_duration_hours: number | null;
  meeting_url: string | null;
  meeting_id: string | null;
  meeting_passcode: string | null;
  theme_name: string | null;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const UpcomingSessionsSection: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<VirtualSession | null>(null);

  const { data: sessions = [] } = useQuery({
    queryKey: ['learn_virtual_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_days')
        .select('id, title, description, day_number, date, session_start_time, session_duration_hours, meeting_url, meeting_id, meeting_passcode, theme_name')
        .eq('is_virtual', true)
        .eq('is_active', true)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return (data || []) as VirtualSession[];
    },
  });

  if (sessions.length === 0) return null;

  const formatTime = (time: string | null) => {
    if (!time) return '';
    try {
      const [h, m] = time.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
    } catch {
      return time;
    }
  };

  const getDayName = (dateStr: string | null, dayNum: number) => {
    if (dateStr) {
      try {
        const d = new Date(dateStr);
        return DAY_NAMES[d.getDay()];
      } catch { /* fallback */ }
    }
    return `D${Math.abs(dayNum)}`;
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Upcoming Online Sessions</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Join live sessions with mentors</p>
      </div>

      <Carousel opts={{ align: 'start', loop: sessions.length > 2 }} className="w-full">
        <CarouselContent className="-ml-3">
          {sessions.map((session) => (
            <CarouselItem key={session.id} className="pl-3 basis-auto">
              <div className="w-[270px] sm:w-[300px] bg-card rounded-2xl border border-border/30 p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors duration-300">
                {/* Date pill + Title */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-14 rounded-xl bg-primary/15 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-primary leading-none">
                      {Math.abs(session.day_number)}
                    </span>
                    <span className="text-[10px] font-medium text-primary/80 uppercase">
                      {getDayName(session.date, session.day_number)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                      {session.title}
                    </h3>
                    {session.session_start_time && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(session.session_start_time)}
                        {session.session_duration_hours
                          ? ` · ${session.session_duration_hours}h`
                          : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {session.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {session.description}
                  </p>
                )}

                {/* Action row */}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <Button
                    size="sm"
                    className="flex-1 h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg gap-1.5"
                    onClick={() => setSelectedSession(session)}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Session
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0 rounded-lg border-border/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!session.date) return;
                      const startDate = new Date(session.date);
                      if (session.session_start_time) {
                        const [h, m] = session.session_start_time.split(':').map(Number);
                        startDate.setHours(h, m, 0);
                      }
                      const endDate = new Date(startDate.getTime() + (session.session_duration_hours || 1) * 60 * 60 * 1000);
                      const url = generateGoogleCalendarUrl({
                        title: `Forge: ${session.title}`,
                        description: session.description || '',
                        startDate,
                        endDate,
                        isVirtual: true,
                      });
                      window.open(url, '_blank');
                    }}
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {sessions.length > 2 && (
          <>
            <CarouselPrevious className="-left-3 bg-card/80 backdrop-blur-md border-border/50 hover:bg-card" />
            <CarouselNext className="-right-3 bg-card/80 backdrop-blur-md border-border/50 hover:bg-card" />
          </>
        )}
      </Carousel>

      {/* Session detail modal */}
      <SessionDetailModal
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      />
    </section>
  );
};

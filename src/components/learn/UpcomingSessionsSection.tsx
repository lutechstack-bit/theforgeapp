import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Video, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl, generateYahooCalendarUrl, generateAppleCalendarUrl } from '@/lib/calendarUtils';
import { SessionDetailModal } from './SessionDetailModal';
import { ScrollableCardRow } from './ScrollableCardRow';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';

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
  const { effectiveEdition } = useEffectiveCohort();

  const editionId = effectiveEdition?.id;

  const { data: sessions = [] } = useQuery({
    queryKey: ['learn_virtual_sessions', editionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_days')
        .select('id, title, description, day_number, date, session_start_time, session_duration_hours, meeting_url, meeting_id, meeting_passcode, theme_name')
        .eq('is_virtual', true)
        .eq('is_active', true)
        .eq('edition_id', editionId!)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return (data || []) as VirtualSession[];
    },
    enabled: !!editionId,
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

  const getCalendarEvent = (session: VirtualSession) => {
    const startDate = new Date(session.date!);
    if (session.session_start_time) {
      const [h, m] = session.session_start_time.split(':').map(Number);
      startDate.setHours(h, m, 0);
    }
    const endDate = new Date(startDate.getTime() + (session.session_duration_hours || 1) * 60 * 60 * 1000);
    return {
      title: `Forge: ${session.title}`,
      description: session.description || '',
      startDate,
      endDate,
      isVirtual: true,
    };
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Upcoming Online Sessions</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Online sessions before your Forge Offline Experience</p>
      </div>

      <ScrollableCardRow>
          {sessions.map((session, index) => (
            <div key={session.id} className="snap-start flex-shrink-0">
              <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[hsl(var(--primary))]/15 via-[hsl(var(--primary))]/5 to-[hsl(var(--primary))]/15 hover:from-[hsl(var(--primary))]/50 hover:via-[hsl(var(--primary))]/25 hover:to-[hsl(var(--primary))]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300">
              <div className="w-[270px] sm:w-[300px] bg-card rounded-[13px] p-4 flex flex-col min-h-[160px]">
                {/* Date pill + Title */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-14 rounded-xl bg-primary/15 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-primary leading-none">
                      {index + 1}
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

                {/* Action row pinned to bottom */}
                <div className="flex items-center gap-2 mt-auto pt-3">
                  <Button
                    size="sm"
                    className="flex-1 h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg gap-1.5"
                    onClick={() => setSelectedSession(session)}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Session
                  </Button>
                  {session.date ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 rounded-lg border-border/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-1.5" align="end" side="top">
                        <button
                          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-xs hover:bg-accent transition-colors"
                          onClick={() => window.open(generateGoogleCalendarUrl(getCalendarEvent(session)), '_blank')}
                        >
                          📅 Google Calendar
                        </button>
                        <button
                          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-xs hover:bg-accent transition-colors"
                          onClick={() => window.open(generateAppleCalendarUrl(getCalendarEvent(session)), '_blank')}
                        >
                          🍎 Apple Calendar
                        </button>
                        <button
                          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-xs hover:bg-accent transition-colors"
                          onClick={() => window.open(generateOutlookCalendarUrl(getCalendarEvent(session)), '_blank')}
                        >
                          📧 Outlook
                        </button>
                        <button
                          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-xs hover:bg-accent transition-colors"
                          onClick={() => window.open(generateYahooCalendarUrl(getCalendarEvent(session)), '_blank')}
                        >
                          📆 Yahoo Calendar
                        </button>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0 rounded-lg border-border/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Session date not yet announced. Check back soon!');
                      }}
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              </div>
            </div>
          ))}
      </ScrollableCardRow>

      {/* Session detail modal */}
      <SessionDetailModal
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      />
    </section>
  );
};
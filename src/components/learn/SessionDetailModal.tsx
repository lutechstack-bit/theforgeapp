import React from 'react';
import { Video, CalendarPlus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl, generateYahooCalendarUrl, generateAppleCalendarUrl } from '@/lib/calendarUtils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SessionData {
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

interface SessionDetailModalProps {
  session: SessionData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  open,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();

  if (!session) return null;

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getCalendarEvent = () => {
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

  const content = (
    <div className="space-y-5 p-1">
      {/* Date pill + Title */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-14 h-16 rounded-xl bg-primary/15 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-primary leading-none">
            {Math.abs(session.day_number)}
          </span>
          <span className="text-[10px] font-medium text-primary/80 uppercase">
            {session.date
              ? new Date(session.date).toLocaleDateString('en', { weekday: 'short' })
              : `D${Math.abs(session.day_number)}`}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{session.title}</h3>
          {session.date && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatDate(session.date)}
              {session.session_start_time && ` · ${formatTime(session.session_start_time)}`}
              {session.session_duration_hours && ` · ${session.session_duration_hours}h`}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {session.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {session.description}
        </p>
      )}

      {/* Meeting info */}
      {session.meeting_id && (
        <div className="bg-muted/30 rounded-xl p-3 space-y-1">
          <p className="text-xs text-muted-foreground">
            Meeting ID: <span className="font-medium text-foreground">{session.meeting_id}</span>
          </p>
          {session.meeting_passcode && (
            <p className="text-xs text-muted-foreground">
              Passcode: <span className="font-medium text-foreground">{session.meeting_passcode}</span>
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2.5">
        {session.meeting_url && (
          <Button
            className="w-full h-11 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2"
            onClick={() => window.open(session.meeting_url!, '_blank')}
          >
            <Video className="w-4 h-4" />
            Join Zoom Meeting
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
          </Button>
        )}
        {session.date && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 text-sm rounded-xl border-border/50 gap-2"
              >
                <CalendarPlus className="w-4 h-4" />
                Add to Calendar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2" align="center">
              <button
                className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => window.open(generateGoogleCalendarUrl(getCalendarEvent()), '_blank')}
              >
                📅 Google Calendar
              </button>
              <button
                className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => window.open(generateAppleCalendarUrl(getCalendarEvent()), '_blank')}
              >
                🍎 Apple Calendar
              </button>
              <button
                className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => window.open(generateOutlookCalendarUrl(getCalendarEvent()), '_blank')}
              >
                📧 Outlook
              </button>
              <button
                className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => window.open(generateYahooCalendarUrl(getCalendarEvent()), '_blank')}
              >
                📆 Yahoo Calendar
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="px-0 pb-0">
            <DrawerTitle className="sr-only">{session.title}</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border/30">
        <DialogHeader>
          <DialogTitle className="sr-only">{session.title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

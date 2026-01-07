import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { generateGoogleCalendarUrl, downloadAllEventsICS } from '@/lib/calendarUtils';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  is_virtual: boolean;
}

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  events,
}) => {
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date());

  const handleGoogleCalendarSync = () => {
    // For Google, we'll add the first upcoming event
    // For full sync, users need to download ICS
    if (upcomingEvents.length > 0) {
      const event = upcomingEvents[0];
      const url = generateGoogleCalendarUrl({
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: new Date(event.event_date),
        isVirtual: event.is_virtual,
      });
      window.open(url, '_blank');
    }
  };

  const handleAppleCalendarSync = () => {
    if (upcomingEvents.length === 0) return;
    
    const calendarEvents = upcomingEvents.map(event => ({
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: new Date(event.event_date),
      isVirtual: event.is_virtual,
    }));

    downloadAllEventsICS(calendarEvents);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Sync to Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Add all upcoming LevelUp events ({upcomingEvents.length} events) to your calendar.
          </p>

          <div className="space-y-3">
            {/* Google Calendar */}
            <button
              onClick={handleGoogleCalendarSync}
              disabled={upcomingEvents.length === 0}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-card/60 border border-border/50 hover:border-primary/30 hover:bg-card transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 rounded-lg bg-[#4285F4]/10">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-foreground">Google Calendar</h4>
                <p className="text-xs text-muted-foreground">Opens in new tab to add events</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Apple Calendar */}
            <button
              onClick={handleAppleCalendarSync}
              disabled={upcomingEvents.length === 0}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-card/60 border border-border/50 hover:border-primary/30 hover:bg-card transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" className="text-red-500"/>
                  <path d="M3 9h18" stroke="currentColor" strokeWidth="2" className="text-red-500"/>
                  <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-500"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-foreground">Apple Calendar</h4>
                <p className="text-xs text-muted-foreground">Downloads .ics file for all events</p>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Other Calendars */}
            <button
              onClick={handleAppleCalendarSync}
              disabled={upcomingEvents.length === 0}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-card/60 border border-border/50 hover:border-primary/30 hover:bg-card transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-foreground">Other Calendars</h4>
                <p className="text-xs text-muted-foreground">Outlook, Yahoo, or any .ics compatible app</p>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {upcomingEvents.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-2">
              No upcoming events to sync
            </p>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

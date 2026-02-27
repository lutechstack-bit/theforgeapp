import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, Video, Calendar, ChevronRight, Download } from 'lucide-react';
import { getScheduleIcon } from '@/lib/roadmapIcons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { JourneyCardDay } from '@/components/roadmap/JourneyCard';
import { cn } from '@/lib/utils';
import { generateGoogleCalendarUrl, openICSFile } from '@/lib/calendarUtils';
import { toast } from 'sonner';

interface SessionDetailCardProps {
  day: JourneyCardDay;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  onViewDetail?: () => void;
}

const SessionDetailCard: React.FC<SessionDetailCardProps> = ({ day, status, onViewDetail }) => {
  const dayDate = day.date ? new Date(day.date) : null;
  const isVirtual = day.is_virtual;
  const isBootcamp = day.day_number > 0 && !isVirtual;

  const dateStr = dayDate ? format(dayDate, 'MMM d') : null;
  const timeStr = day.call_time || (day.session_start_time ? day.session_start_time : null);

  // Day badge label
  const dayBadgeLabel = day.day_number < 0
    ? `SESSION ${Math.abs(day.day_number)}`
    : day.day_number === 0
      ? 'PRE-FORGE'
      : `DAY ${day.day_number}`;

  return (
    <div
      className={cn(
        'rounded-2xl border border-[#FFBF00]/20 p-4 sm:p-6',
        status === 'current' ? 'bg-card' : 'bg-card/60'
      )}
    >
      {/* Amber badge header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/15 text-primary text-[11px] font-bold tracking-wider">
          {dayBadgeLabel}
          {dateStr && <span className="ml-1.5 text-primary/70">| {dateStr}</span>}
        </span>
      </div>

      {/* Theme (bootcamp) */}
      {day.theme_name && isBootcamp && (
        <p className="text-[11px] text-primary/70 font-medium mb-1">{day.theme_name}</p>
      )}

      {/* Title */}
      <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2">{day.title}</h4>

      {/* Description */}
      {day.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {day.description}
        </p>
      )}

      {/* Date + time + meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
        {timeStr && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {timeStr}
          </span>
        )}
        {day.location && !isVirtual && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {day.location}
          </span>
        )}
        {isVirtual && (
          <span className="flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" />
            Via Zoom Link
          </span>
        )}
      </div>

      {/* Online session: calendar action */}
      {!isBootcamp && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!day.date) {
                    e.preventDefault();
                    toast.info('Date not yet announced for this session');
                  }
                }}
              >
                <Calendar className="w-3.5 h-3.5" />
                Add to Calendar
              </Button>
            </PopoverTrigger>
            {day.date && (
              <PopoverContent className="w-48 p-2" align="start">
                <button
                  className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const startDate = new Date(day.date!);
                    if (day.session_start_time) {
                      const [h, m] = day.session_start_time.split(':').map(Number);
                      startDate.setHours(h, m, 0);
                    }
                    const endDate = new Date(startDate.getTime() + (day.session_duration_hours || 1) * 60 * 60 * 1000);
                    const url = generateGoogleCalendarUrl({
                      title: `Forge: ${day.title}`,
                      description: day.description || '',
                      startDate,
                      endDate,
                      isVirtual: day.is_virtual,
                      location: day.location || undefined,
                    });
                    window.open(url, '_blank');
                  }}
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  Google Calendar
                </button>
                <button
                  className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const startDate = new Date(day.date!);
                    if (day.session_start_time) {
                      const [h, m] = day.session_start_time.split(':').map(Number);
                      startDate.setHours(h, m, 0);
                    }
                    const endDate = new Date(startDate.getTime() + (day.session_duration_hours || 1) * 60 * 60 * 1000);
                    openICSFile({
                      title: `Forge: ${day.title}`,
                      description: day.description || '',
                      startDate,
                      endDate,
                      isVirtual: day.is_virtual,
                      location: day.location || undefined,
                    });
                    toast.success('Opening calendar...');
                  }}
                >
                  <Download className="w-4 h-4 text-primary" />
                  Apple / Other (.ics)
                </button>
              </PopoverContent>
            )}
          </Popover>
        </div>
      )}

      {/* Bootcamp: numbered schedule list */}
      {isBootcamp && day.schedule && day.schedule.length > 0 && (
        <div className="space-y-2.5">
          {day.schedule.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="flex-shrink-0 text-primary/70">
                {getScheduleIcon(item.activity, 'sm')}
              </span>
              <p className="text-sm text-foreground line-clamp-1">{item.activity}</p>
            </div>
          ))}
        </div>
      )}

      {/* View details link */}
      <button
        onClick={onViewDetail}
        className="flex items-center gap-1 mt-4 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        View full details
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default SessionDetailCard;

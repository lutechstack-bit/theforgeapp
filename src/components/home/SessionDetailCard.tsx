import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, Video, Calendar, ChevronRight } from 'lucide-react';
import { getScheduleIcon } from '@/lib/roadmapIcons';
import { Button } from '@/components/ui/button';
import type { JourneyCardDay } from '@/components/roadmap/JourneyCard';
import { cn } from '@/lib/utils';

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
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={(e) => { e.stopPropagation(); onViewDetail?.(); }}
          >
            <Calendar className="w-3.5 h-3.5" />
            Add to Calendar
          </Button>
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

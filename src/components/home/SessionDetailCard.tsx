import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, Video, Calendar, Globe, Camera, Coffee, Utensils, Sun, Moon, Clapperboard, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { JourneyCardDay } from '@/components/roadmap/JourneyCard';
import { cn } from '@/lib/utils';

const scheduleIconMap: Record<string, React.ElementType> = {
  camera: Camera, clapperboard: Clapperboard, coffee: Coffee, utensils: Utensils,
  sun: Sun, moon: Moon, users: Users, video: Video, clock: Clock, mappin: MapPin,
};

interface SessionDetailCardProps {
  day: JourneyCardDay;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  onViewDetail?: () => void;
}

const SessionDetailCard: React.FC<SessionDetailCardProps> = ({ day, status, onViewDetail }) => {
  const dayDate = day.date ? new Date(day.date) : null;
  const isVirtual = day.is_virtual;
  const isBootcamp = day.day_number > 0 && !isVirtual;

  // Format date string
  const dateStr = dayDate ? format(dayDate, 'MMM d') : null;
  const timeStr = day.call_time || (day.session_start_time ? day.session_start_time : null);

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 sm:p-6 transition-all duration-200',
        status === 'current'
          ? 'border-primary/30 bg-card'
          : 'border-border/30 bg-card/60'
      )}
    >
      {/* Session / Day Label */}
      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
        {day.day_number < 0
          ? `Session ${Math.abs(day.day_number)}`
          : day.day_number === 0
            ? 'Pre-Forge'
            : `Day ${day.day_number}`}
      </p>

      {/* Theme (bootcamp) */}
      {day.theme_name && isBootcamp && (
        <p className="text-[11px] text-primary/70 font-medium mb-1">{day.theme_name}</p>
      )}

      {/* Title */}
      <h4 className="text-base sm:text-lg font-bold text-foreground mb-2">{day.title}</h4>

      {/* Date + time + meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
        {dateStr && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {dateStr}
          </span>
        )}
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
        {isBootcamp && day.schedule && day.schedule.length > 0 && (
          <span>{day.schedule.length} activities</span>
        )}
      </div>

      {/* Online session: description + actions */}
      {!isBootcamp && (
        <>
          {day.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {day.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={(e) => { e.stopPropagation(); onViewDetail?.(); }}
            >
              <Calendar className="w-3.5 h-3.5" />
              Add to Calendar
            </Button>
            {isVirtual && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Video className="w-3.5 h-3.5" />
                Via Zoom Link
              </span>
            )}
          </div>
        </>
      )}

      {/* Bootcamp: schedule items as sub-cards */}
      {isBootcamp && day.schedule && day.schedule.length > 0 && (
        <div className="space-y-2">
          {day.schedule.map((item, idx) => {
            const iconKey = item.icon?.toLowerCase().replace(/[^a-z]/g, '') || '';
            const IconComp = scheduleIconMap[iconKey] || Clock;
            const isHighlight = iconKey === 'camera' || iconKey === 'clapperboard';

            return (
              <div
                key={idx}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border transition-colors',
                  isHighlight
                    ? 'border-primary/25 bg-primary/5'
                    : 'border-border/20 bg-card/40'
                )}
              >
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  isHighlight
                    ? 'bg-primary/15 text-primary'
                    : 'bg-secondary text-muted-foreground'
                )}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.activity}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            );
          })}
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

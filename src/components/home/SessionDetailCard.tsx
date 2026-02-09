import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, Video, Calendar, Globe, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { JourneyCardDay } from '@/components/roadmap/JourneyCard';
import { cn } from '@/lib/utils';

interface SessionDetailCardProps {
  day: JourneyCardDay;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  onViewDetail?: () => void;
}

const SessionDetailCard: React.FC<SessionDetailCardProps> = ({
  day,
  status,
  onViewDetail,
}) => {
  const dayDate = day.date ? new Date(day.date) : null;
  const formattedDate = dayDate ? format(dayDate, 'MMM d') : null;
  const isVirtual = day.is_virtual;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-200 cursor-pointer hover:border-primary/30',
        status === 'current'
          ? 'border-primary/30 bg-primary/5'
          : status === 'completed'
          ? 'border-border/30 bg-card/40'
          : 'border-border/20 bg-card/30'
      )}
      onClick={onViewDetail}
    >
      {/* Badge row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide',
              status === 'current'
                ? 'bg-primary text-primary-foreground'
                : status === 'completed'
                ? 'bg-primary/20 text-primary'
                : 'bg-secondary text-muted-foreground'
            )}
          >
            {day.day_number < 0
              ? `Session ${Math.abs(day.day_number)}`
              : day.day_number === 0
              ? 'Pre-Forge'
              : `Day ${day.day_number}`}
          </span>
          {isVirtual && (
          <span className="text-[10px] text-accent flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/10">
            <Globe className="w-2.5 h-2.5" />
            Online
          </span>
          )}
        </div>
        {status === 'current' && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary font-semibold">NOW</span>
          </span>
        )}
      </div>

      {/* Theme */}
      {day.theme_name && (
        <p className="text-[10px] text-primary/80 font-medium tracking-wide uppercase mb-1">
          {day.theme_name}
        </p>
      )}

      {/* Title */}
      <h4 className="text-sm font-bold text-foreground mb-2 line-clamp-2">
        {day.title}
      </h4>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
        {formattedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
        )}
        {day.call_time && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {day.call_time}
          </span>
        )}
        {day.location && !isVirtual && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {day.location}
          </span>
        )}
      </div>

      {/* Schedule items */}
      {day.schedule && day.schedule.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {day.schedule.slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
              <span className="text-foreground/80">{item.activity}</span>
              <span className="text-muted-foreground ml-auto flex-shrink-0">
                {item.time}
              </span>
            </div>
          ))}
          {day.schedule.length > 4 && (
            <p className="text-[10px] text-muted-foreground pl-4">
              +{day.schedule.length - 4} more activities
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-2">
        {isVirtual && day.meeting_url && status === 'current' && (
          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              window.open(day.meeting_url!, '_blank', 'noopener,noreferrer');
            }}
          >
            <Video className="w-3 h-3" />
            Join Now
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 h-8 text-xs text-muted-foreground hover:text-primary ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail?.();
          }}
        >
          View Details
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default SessionDetailCard;

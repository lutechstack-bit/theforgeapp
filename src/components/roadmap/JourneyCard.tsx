import React, { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Lock, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import DayDetailModal from './DayDetailModal';
import type { CohortType } from '@/lib/roadmapIcons';

export interface JourneyCardDay {
  id: string;
  day_number: number;
  title: string;
  description?: string | null;
  date?: string | null;
  location?: string | null;
  call_time?: string | null;
  checklist?: string[];
  mentors?: string[];
  key_learnings?: string[];
  activity_type?: string | null;
  duration_hours?: number | null;
  intensity_level?: string | null;
  teaser_text?: string | null;
  reveal_days_before?: number | null;
  theme_name?: string | null;
  objective?: string | null;
  schedule?: { time: string; activity: string; icon?: string }[];
  location_image_url?: string | null;
  milestone_type?: string | null;
}

interface JourneyCardProps {
  day: JourneyCardDay;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
  cohortType?: CohortType;
  onHover?: (isHovered: boolean) => void;
}

const JourneyCard: React.FC<JourneyCardProps> = ({
  day,
  status,
  forgeMode,
  forgeStartDate,
  cohortType = 'FORGE',
  onHover
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shouldRevealContent = () => {
    if (forgeMode !== 'PRE_FORGE') return true;
    if (!forgeStartDate) return false;
    const daysUntilForge = differenceInDays(forgeStartDate, new Date());
    const revealDays = day.reveal_days_before ?? 7;
    return daysUntilForge <= revealDays;
  };

  const isRevealed = shouldRevealContent();

  // Parse date for display
  const dayDate = day.date ? new Date(day.date) : null;
  const dayOfWeek = dayDate ? format(dayDate, 'EEE') : null;
  const dayNum = dayDate ? format(dayDate, 'dd') : String(day.day_number).padStart(2, '0');
  const month = dayDate ? format(dayDate, 'MMM') : null;

  // Get forge mode + status-based styling
  const getCardStyles = () => {
    // PRE_FORGE: Muted preview state
    if (forgeMode === 'PRE_FORGE') {
      return 'border-l-muted/40 bg-card/20 opacity-70 hover:opacity-85';
    }
    
    // POST_FORGE: All completed/archive look
    if (forgeMode === 'POST_FORGE') {
      return 'border-l-primary/40 bg-card/25 opacity-90';
    }
    
    // DURING_FORGE: Active status-based styling
    switch (status) {
      case 'completed':
        return 'border-l-primary/50 bg-card/30';
      case 'current':
        return 'border-l-primary shadow-glow bg-card/60 scale-[1.02]';
      case 'upcoming':
        return 'border-l-border bg-card/40';
      case 'locked':
        return 'border-l-muted/30 bg-card/20 opacity-60';
      default:
        return 'border-l-border bg-card/40';
    }
  };

  // Get date number styling based on mode
  const getDateStyles = () => {
    if (forgeMode === 'PRE_FORGE') {
      return 'text-muted-foreground';
    }
    if (forgeMode === 'POST_FORGE') {
      return 'text-primary/80';
    }
    if (status === 'current') return 'gradient-text';
    if (status === 'completed') return 'text-primary';
    return 'text-foreground';
  };

  return (
    <>
      <div
        className={`
          relative rounded-xl p-4 border-l-4 
          transition-all duration-300 cursor-pointer
          hover:border-l-primary/70 hover:bg-card/50
          ${getCardStyles()}
        `}
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
      >
        <div className="flex gap-4">
          {/* Date Block - Left side */}
          <div className="flex-shrink-0 w-14 text-center">
            {dayOfWeek && (
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                {dayOfWeek}
              </p>
            )}
            <p className={`text-2xl font-bold ${getDateStyles()}`}>
              {dayNum}
            </p>
            {month && (
              <p className="text-xs text-muted-foreground">
                {month}
              </p>
            )}
            {!dayDate && day.day_number === 0 && (
              <p className="text-xs text-primary font-medium mt-1">Pre</p>
            )}
          </div>

          {/* Content - Right side */}
          <div className="flex-1 min-w-0">
            {/* Top row: Badge + Call Time */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className={`
                text-[10px] font-semibold px-2 py-0.5 rounded-md
                ${forgeMode === 'PRE_FORGE'
                  ? 'bg-muted/50 text-muted-foreground'
                  : forgeMode === 'POST_FORGE'
                  ? 'bg-primary/20 text-primary'
                  : status === 'current' 
                  ? 'bg-primary text-primary-foreground' 
                  : status === 'completed'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground'
                }
              `}>
                {day.day_number === 0 ? 'Pre-Forge' : `Day ${day.day_number}`}
              </span>
              
              {day.call_time && isRevealed && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {day.call_time}
                </span>
              )}
              
              {status === 'current' && forgeMode === 'DURING_FORGE' && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] text-primary font-semibold">NOW</span>
                </span>
              )}
              
              {forgeMode === 'POST_FORGE' && (
                <Trophy className="w-4 h-4 text-primary/60" />
              )}
              
              {status === 'completed' && forgeMode === 'DURING_FORGE' && (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              )}
            </div>

            {/* Theme name (movie/session name) */}
            {isRevealed && day.theme_name && (
              <p className="text-[10px] text-primary/80 font-medium tracking-wide uppercase mb-0.5">
                {day.theme_name}
              </p>
            )}

            {/* Title */}
            <h3 className={`font-semibold text-sm leading-tight line-clamp-2 ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
              {isRevealed ? day.title : '???'}
            </h3>

            {/* Locked state message */}
            {status === 'locked' && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" />
                Coming soon
              </p>
            )}

            {/* Reveal soon message */}
            {!isRevealed && status !== 'locked' && (
              <p className="text-[10px] text-primary flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3" />
                Reveal soon
              </p>
            )}

            {/* Location and duration row */}
            {isRevealed && (day.location || day.duration_hours) && (
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                {day.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{day.location}</span>
                  </span>
                )}
                {day.duration_hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {day.duration_hours}h
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <DayDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        day={day}
        status={status}
        cohortType={cohortType}
        forgeMode={forgeMode}
      />
    </>
  );
};

export default JourneyCard;

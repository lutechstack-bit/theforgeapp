import React, { useState } from 'react';
import { Lock, Trophy, Clock, Eye, Sparkles, Flag, Star, Zap } from 'lucide-react';
import { differenceInDays, differenceInHours } from 'date-fns';
import { getDayIcon, type CohortType } from '@/lib/roadmapIcons';
import DayDetailModal from './DayDetailModal';

interface EnhancedRoadmapNodeProps {
  day: {
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
  };
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  position: 'left' | 'center' | 'right';
  isFirst?: boolean;
  isLast?: boolean;
  totalChecklist?: number;
  completedChecklist?: number;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
  cohortType?: CohortType;
}

const EnhancedRoadmapNode: React.FC<EnhancedRoadmapNodeProps> = ({ 
  day, 
  status, 
  position, 
  isFirst, 
  isLast,
  totalChecklist = 0,
  completedChecklist = 0,
  forgeMode,
  forgeStartDate,
  cohortType = 'FORGE'
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

  const getTimeRemaining = () => {
    if (!day.date) return null;
    const now = new Date();
    const dayDate = new Date(day.date);
    if (status === 'completed') return null;
    const daysLeft = differenceInDays(dayDate, now);
    const hoursLeft = differenceInHours(dayDate, now);
    if (daysLeft > 0) return `${daysLeft}d`;
    if (hoursLeft > 0) return `${hoursLeft}h`;
    return 'Today';
  };

  const getProgressPercent = () => {
    if (status === 'completed') return 100;
    if (status === 'locked' || status === 'upcoming') return 0;
    if (totalChecklist === 0) return status === 'current' ? 50 : 0;
    return Math.round((completedChecklist / totalChecklist) * 100);
  };

  const getMilestoneIcon = () => {
    switch (day.milestone_type) {
      case 'start': return <Flag className="w-3 h-3" />;
      case 'midpoint': return <Star className="w-3 h-3" />;
      case 'finale': return <Trophy className="w-3 h-3" />;
      default: return null;
    }
  };

  const nodeSize = status === 'current' ? 'w-20 h-20' : 'w-16 h-16';
  const hasLocationImage = !!day.location_image_url;
  
  return (
    <>
      <div 
        className={`relative flex items-center ${
          position === 'left' ? 'justify-start pl-4' : 
          position === 'right' ? 'justify-end pr-4' : 
          'justify-center'
        }`}
      >
        <div 
          className={`flex items-center gap-4 cursor-pointer ${
            position === 'right' ? 'flex-row-reverse' : 'flex-row'
          }`}
          onClick={() => setIsModalOpen(true)}
        >
          {/* Main Node with Location Image */}
          <div className="relative group flex-shrink-0">
            {status === 'current' && (
              <div className="absolute inset-0 -m-3 rounded-full bg-primary/20 animate-pulse-soft" />
            )}
            
            <div className={`relative ${nodeSize} rounded-2xl transition-all duration-300 group-hover:scale-105 overflow-hidden ${
              status === 'completed' || status === 'current' ? 'shadow-glow' : ''
            }`}>
              {/* Background - Location image or gradient */}
              {hasLocationImage && (status === 'completed' || status === 'current' || isRevealed) ? (
                <img 
                  src={day.location_image_url!} 
                  alt={day.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 transition-all duration-300 ${
                  status === 'completed' 
                    ? 'bg-gradient-to-br from-primary to-accent' 
                    : status === 'current'
                    ? 'bg-gradient-to-br from-primary via-primary to-accent animate-pulse-soft'
                    : status === 'upcoming'
                    ? 'bg-secondary border-2 border-border'
                    : 'bg-muted/50 border-2 border-border/30'
                }`} />
              )}
              
              {/* Overlay for images */}
              {hasLocationImage && (status === 'completed' || status === 'current' || isRevealed) && (
                <div className={`absolute inset-0 ${
                  status === 'completed' 
                    ? 'bg-primary/40' 
                    : status === 'current'
                    ? 'bg-primary/30'
                    : 'bg-black/40'
                }`} />
              )}
              
              {/* Progress ring for current/completed */}
              {(status === 'current' || status === 'completed') && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <rect 
                    x="4" y="4" 
                    width="calc(100% - 8px)" 
                    height="calc(100% - 8px)" 
                    rx="12"
                    fill="none" 
                    stroke="hsl(var(--primary-foreground) / 0.2)" 
                    strokeWidth="3" 
                  />
                  <rect 
                    x="4" y="4" 
                    width="calc(100% - 8px)" 
                    height="calc(100% - 8px)" 
                    rx="12"
                    fill="none" 
                    stroke="hsl(var(--primary-foreground))" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeDasharray={`${getProgressPercent() * 2} 200`}
                    className="transition-all duration-500" 
                  />
                </svg>
              )}

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                {status === 'completed' && (
                  <div className="text-primary-foreground">
                    {getDayIcon(cohortType, day.activity_type, day.day_number, 'md')}
                  </div>
                )}
                {status === 'current' && (
                  <div className="text-primary-foreground">
                    {getDayIcon(cohortType, day.activity_type, day.day_number, 'lg')}
                  </div>
                )}
                {status === 'upcoming' && (
                  isRevealed ? (
                    <div className="text-muted-foreground">
                      {getDayIcon(cohortType, day.activity_type, day.day_number, 'md')}
                    </div>
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )
                )}
                {status === 'locked' && (
                  <Lock className="w-5 h-5 text-muted-foreground/50" />
                )}
              </div>

              {/* Day number badge */}
              <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                status === 'completed' || status === 'current'
                  ? 'bg-primary-foreground text-primary'
                  : 'bg-border text-muted-foreground'
              }`}>
                {day.day_number === 0 ? 'P' : day.day_number}
              </div>

              {/* Milestone badge */}
              {day.milestone_type && (
                <div className={`absolute -top-1 -left-1 p-1 rounded-full ${
                  day.milestone_type === 'finale' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {getMilestoneIcon()}
                </div>
              )}

              {/* Trophy for last completed */}
              {isLast && status === 'completed' && !day.milestone_type && (
                <Trophy className="absolute -top-2 -right-1 w-4 h-4 text-accent animate-float" />
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className={`glass-card rounded-xl px-4 py-3 min-w-[140px] max-w-[200px] group-hover:border-primary/30 transition-all duration-300 ${
            status === 'current' ? 'border-primary/40 shadow-glow' : ''
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                status === 'current' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {day.day_number === 0 ? 'Pre-Forge' : `Day ${day.day_number}`}
              </span>
              {status === 'current' && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <Zap className="w-3 h-3 text-primary" />
                </span>
              )}
              {getTimeRemaining() && status === 'upcoming' && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining()}
                </span>
              )}
            </div>
            
            {/* Theme name */}
            {isRevealed && day.theme_name && (
              <p className="text-[10px] text-primary/80 font-medium mb-0.5 tracking-wide uppercase">
                {day.theme_name}
              </p>
            )}
            
            <h4 className="font-semibold text-foreground text-sm line-clamp-2">
              {isRevealed ? day.title : '???'}
            </h4>
            
            {!isRevealed && (
              <p className="text-[10px] text-primary flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3" />
                Reveal soon
              </p>
            )}
            
            {isRevealed && day.location && (
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                📍 {day.location}
              </p>
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

export default EnhancedRoadmapNode;

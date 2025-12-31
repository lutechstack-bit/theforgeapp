import React, { useState } from 'react';
import { Lock, Trophy, Clock, Eye, Sparkles } from 'lucide-react';
import { differenceInDays, differenceInHours } from 'date-fns';
import { getDayIcon, type CohortType } from '@/lib/roadmapIcons';
import DayDetailModal from './DayDetailModal';

interface RoadmapNodeProps {
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

const RoadmapNode: React.FC<RoadmapNodeProps> = ({ 
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

  const nodeSize = status === 'current' ? 'w-16 h-16' : 'w-14 h-14';
  
  return (
    <>
      <div 
        className={`relative flex items-center ${
          position === 'left' ? 'justify-start pl-6' : 
          position === 'right' ? 'justify-end pr-6' : 
          'justify-center'
        }`}
      >
        <div 
          className={`flex items-center gap-3 cursor-pointer ${
            position === 'right' ? 'flex-row-reverse' : 'flex-row'
          }`}
          onClick={() => setIsModalOpen(true)}
        >
          {/* Main Node */}
          <div className="relative group flex-shrink-0">
            {status === 'current' && (
              <div className="absolute inset-0 -m-2 rounded-full bg-primary/20 animate-pulse-soft" />
            )}
            
            <div className={`relative ${nodeSize} rounded-full transition-all duration-300 group-hover:scale-110`}>
              <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                status === 'completed' 
                  ? 'bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]' 
                  : status === 'current'
                  ? 'bg-gradient-to-br from-primary via-primary to-accent shadow-[0_0_30px_hsl(var(--primary)/0.5)]'
                  : status === 'upcoming'
                  ? 'bg-secondary border-2 border-border'
                  : 'bg-muted/50 border-2 border-border/30'
              }`} />
              
              {(status === 'current' || status === 'completed') && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" fill="none" stroke="hsl(var(--primary-foreground) / 0.2)" strokeWidth="3" />
                  <circle cx="50%" cy="50%" r="42%" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${getProgressPercent() * 2.64} 264`} className="transition-all duration-500" />
                </svg>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                {status === 'completed' && (
                  <div className="text-primary-foreground">
                    {getDayIcon(cohortType, day.activity_type, day.day_number, 'md')}
                  </div>
                )}
                {status === 'current' && (
                  <div className="text-primary-foreground animate-pulse-soft">
                    {getDayIcon(cohortType, day.activity_type, day.day_number, 'md')}
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

              <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                status === 'completed' || status === 'current'
                  ? 'bg-primary-foreground text-primary'
                  : 'bg-border text-muted-foreground'
              }`}>
                {day.day_number === 0 ? 'P' : day.day_number}
              </div>

              {isLast && status === 'completed' && (
                <Trophy className="absolute -top-2 -right-1 w-4 h-4 text-accent animate-float" />
              )}
            </div>
          </div>

          {/* Compact Title Card */}
          <div className="glass-card rounded-xl px-3 py-2 min-w-[120px] max-w-[180px] group-hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                status === 'current' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {day.day_number === 0 ? 'Pre' : `D${day.day_number}`}
              </span>
              {status === 'current' && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
              {getTimeRemaining() && status === 'upcoming' && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining()}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-foreground text-xs line-clamp-2">
              {isRevealed ? day.title : '???'}
            </h4>
            {!isRevealed && (
              <p className="text-[10px] text-primary flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3" />
                Coming soon
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

export default RoadmapNode;
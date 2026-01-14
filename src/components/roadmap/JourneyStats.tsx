import React, { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Rocket, Star, Trophy, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { CohortType } from '@/lib/roadmapIcons';

interface JourneyStatsProps {
  cohortName: string;
  cohortType: CohortType;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
  forgeEndDate?: Date | null;
  completedCount: number;
  totalCount: number;
  currentDayNumber: number;
  nextDayDate?: Date | null;
}

const JourneyStats: React.FC<JourneyStatsProps> = ({
  cohortName,
  cohortType,
  forgeMode,
  forgeStartDate,
  forgeEndDate,
  completedCount,
  totalCount,
  currentDayNumber,
  nextDayDate
}) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Calculate countdown based on mode
  useEffect(() => {
    const targetDate = forgeMode === 'PRE_FORGE' ? forgeStartDate : nextDayDate;
    if (!targetDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(targetDate);
      
      if (target <= now) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = differenceInDays(target, now);
      const hours = differenceInHours(target, now) % 24;
      const minutes = differenceInMinutes(target, now) % 60;
      const seconds = differenceInSeconds(target, now) % 60;

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [forgeMode, forgeStartDate, nextDayDate]);

  const getCohortLabel = () => {
    switch (cohortType) {
      case 'FORGE':
        return 'Filmmakers';
      case 'FORGE_CREATORS':
        return 'Creators';
      case 'FORGE_WRITING':
        return 'Writers';
      default:
        return 'Forge';
    }
  };

  const getStatusIcon = () => {
    switch (forgeMode) {
      case 'PRE_FORGE':
        return <Rocket className="w-4 h-4" />;
      case 'DURING_FORGE':
        return <Star className="w-4 h-4 fill-primary" />;
      case 'POST_FORGE':
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (forgeMode) {
      case 'PRE_FORGE':
        return 'Starts in';
      case 'DURING_FORGE':
        return 'Live Now';
      case 'POST_FORGE':
        return 'Complete';
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Status + Cohort Badge */}
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
              ${forgeMode === 'DURING_FORGE' 
                ? 'border-primary bg-primary/10 text-primary animate-pulse-soft' 
                : forgeMode === 'POST_FORGE'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-primary/50 text-primary'
              }
            `}
          >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </Badge>
          
          <div className="hidden sm:block h-6 w-px bg-border" />
          
          <span className="text-sm font-medium text-foreground hidden sm:inline">
            {cohortName} <span className="text-muted-foreground">· {getCohortLabel()}</span>
          </span>
        </div>

        {/* Right: Stats Row */}
        <div className="flex items-center gap-4">
          {/* Countdown Timer - Only show for PRE_FORGE and DURING_FORGE */}
          {forgeMode !== 'POST_FORGE' && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-1 text-sm font-mono">
                {countdown.days > 0 && (
                  <>
                    <span className="text-primary font-bold">{countdown.days}</span>
                    <span className="text-muted-foreground text-xs">d</span>
                  </>
                )}
                <span className="text-primary font-bold">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="text-muted-foreground text-xs">:</span>
                <span className="text-primary font-bold">{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="text-muted-foreground text-xs">:</span>
                <span className="text-primary font-bold">{String(countdown.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {forgeMode === 'POST_FORGE' ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <Calendar className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">
                <span className="font-bold text-foreground">{completedCount}</span>
                <span className="text-muted-foreground">/{totalCount}</span>
              </span>
            </div>
            
            <div className="w-16 hidden sm:block">
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Cohort name */}
      <div className="sm:hidden mt-3 pt-3 border-t border-border/50">
        <span className="text-sm font-medium text-foreground">
          {cohortName} <span className="text-muted-foreground">· {getCohortLabel()}</span>
        </span>
      </div>
    </div>
  );
};

export default JourneyStats;

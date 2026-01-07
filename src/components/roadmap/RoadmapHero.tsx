import React from 'react';
import { Rocket, Trophy, Star, Sparkles, Clock } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface RoadmapHeroProps {
  cohortName: string;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
  completedCount: number;
  totalCount: number;
}

const RoadmapHero: React.FC<RoadmapHeroProps> = ({
  cohortName,
  forgeMode,
  forgeStartDate,
  completedCount,
  totalCount
}) => {
  const daysUntilForge = forgeStartDate ? differenceInDays(forgeStartDate, new Date()) : null;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative mb-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-subtle rounded-2xl opacity-50" />
      
      <div className="relative glass-premium rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left side - Status & Title */}
          <div className="text-center sm:text-left">
            {forgeMode === 'PRE_FORGE' && (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
                  <Rocket className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {daysUntilForge !== null && daysUntilForge > 0 
                      ? `${daysUntilForge} days until Forge`
                      : 'Forge begins soon!'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold gradient-text mb-1">Your {cohortName} Awaits</h1>
                <p className="text-sm text-muted-foreground">Get ready for the experience of a lifetime</p>
              </>
            )}

            {forgeMode === 'DURING_FORGE' && (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-3 animate-pulse-soft">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm font-bold text-primary">FORGE IS LIVE</span>
                </div>
                <h1 className="text-2xl font-bold gradient-text mb-1">Your {cohortName} Journey</h1>
                <p className="text-sm text-muted-foreground">You're creating something amazing</p>
              </>
            )}

            {forgeMode === 'POST_FORGE' && (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 mb-3">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-accent">FORGE COMPLETE</span>
                </div>
                <h1 className="text-2xl font-bold gradient-text mb-1">Your {cohortName} Legacy</h1>
                <p className="text-sm text-muted-foreground">Look back at what you've accomplished</p>
              </>
            )}
          </div>

          {/* Right side - Progress Ring */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              {/* Progress ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 2.51} 251`}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black gradient-text">{progressPercent}%</span>
                <span className="text-[10px] text-muted-foreground">Complete</span>
              </div>
            </div>

            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <p className="text-lg font-bold text-foreground">{completedCount} / {totalCount}</p>
              <p className="text-xs text-muted-foreground">days complete</p>
            </div>
          </div>
        </div>

        {/* Progress bar for mobile */}
        <div className="sm:hidden mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{completedCount}/{totalCount} days</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default RoadmapHero;

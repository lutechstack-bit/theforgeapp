import React from 'react';
import { cn } from '@/lib/utils';
import { JourneyStage } from '@/hooks/useStudentJourney';
import { Check } from 'lucide-react';
import { ProgressRing } from './ProgressRing';

interface StageNavigationStripProps {
  stages: JourneyStage[];
  currentStageKey: string;
  onStageClick?: (stage: JourneyStage) => void;
  getStageStats?: (stageId: string) => { completed: number; total: number };
}

export const StageNavigationStrip: React.FC<StageNavigationStripProps> = ({
  stages,
  currentStageKey,
  onStageClick,
  getStageStats,
}) => {
  const currentIndex = stages.findIndex(s => s.stage_key === currentStageKey);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-between min-w-[500px] px-2 py-3">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = stage.stage_key === currentStageKey;
          const isUpcoming = index > currentIndex;

          // Calculate progress for this stage
          const stats = getStageStats?.(stage.id) || { completed: 0, total: 0 };
          const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

          // Determine variant for progress ring
          const ringVariant = isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming';

          return (
            <React.Fragment key={stage.id}>
              {/* Stage dot with progress ring */}
              <button
                onClick={() => onStageClick?.(stage)}
                className="flex flex-col items-center gap-1.5 group"
              >
                {/* Progress Ring wrapping the dot */}
                <ProgressRing
                  progress={isCompleted ? 100 : progress}
                  size={isCurrent ? 40 : 36}
                  strokeWidth={3}
                  variant={ringVariant}
                >
                  {/* Inner dot */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300',
                      isCompleted && 'bg-emerald-500 text-white',
                      isCurrent && 'bg-primary text-primary-foreground shadow-lg shadow-primary/30',
                      isUpcoming && 'bg-muted/50 text-muted-foreground',
                      !isUpcoming && 'cursor-pointer group-hover:scale-105'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </div>
                </ProgressRing>
                
                {/* Label */}
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors whitespace-nowrap',
                    isCompleted && 'text-emerald-500',
                    isCurrent && 'text-primary font-semibold',
                    isUpcoming && 'text-muted-foreground'
                  )}
                >
                  {stage.title.split(' ').slice(0, 2).join(' ')}
                </span>
              </button>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1',
                    index < currentIndex && 'bg-emerald-500',
                    index === currentIndex && 'bg-gradient-to-r from-primary to-muted-foreground/30',
                    index > currentIndex && 'bg-muted-foreground/20'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';
import { JourneyStage } from '@/hooks/useStudentJourney';
import { Check } from 'lucide-react';

interface StageNavigationStripProps {
  stages: JourneyStage[];
  currentStageKey: string;
  onStageClick?: (stage: JourneyStage) => void;
}

export const StageNavigationStrip: React.FC<StageNavigationStripProps> = ({
  stages,
  currentStageKey,
  onStageClick,
}) => {
  const currentIndex = stages.findIndex(s => s.stage_key === currentStageKey);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-between min-w-[500px] px-2 py-3">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = stage.stage_key === currentStageKey;
          const isUpcoming = index > currentIndex;

          return (
            <React.Fragment key={stage.id}>
              {/* Stage dot and label */}
              <button
                onClick={() => onStageClick?.(stage)}
                className="flex flex-col items-center gap-1.5 group"
              >
                {/* Dot */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                    'border-2',
                    isCompleted && 'bg-emerald-500 border-emerald-500 text-white',
                    isCurrent && 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30',
                    isUpcoming && 'bg-muted/50 border-muted-foreground/30 text-muted-foreground',
                    !isUpcoming && 'cursor-pointer hover:scale-105'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                
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

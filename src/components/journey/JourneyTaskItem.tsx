import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Sparkles } from 'lucide-react';
import { JourneyTask } from '@/hooks/useStudentJourney';

interface JourneyTaskItemProps {
  task: JourneyTask;
  isCompleted: boolean;
  isAutoCompleted: boolean;
  onToggle: () => void;
  variant?: 'default' | 'compact';
}

export const JourneyTaskItem: React.FC<JourneyTaskItemProps> = ({
  task,
  isCompleted,
  isAutoCompleted,
  onToggle,
  variant = 'default',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (task.deep_link && !isCompleted) {
      navigate(task.deep_link);
    } else if (!isAutoCompleted) {
      onToggle();
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 w-full text-left py-1 transition-colors',
          isCompleted ? 'text-muted-foreground' : 'text-foreground hover:text-primary'
        )}
      >
        <div
          className={cn(
            'w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors',
            isCompleted
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-muted-foreground/40 hover:border-primary'
          )}
        >
          {isCompleted && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className={cn('text-xs truncate', isCompleted && 'line-through')}>
          {task.title}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 w-full text-left p-2 rounded-lg transition-all',
        'hover:bg-background/50',
        isCompleted && 'opacity-70'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all',
          isCompleted
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-muted-foreground/40 hover:border-primary hover:scale-105'
        )}
      >
        {isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium truncate',
              isCompleted && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </span>
          {isAutoCompleted && (
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground truncate">
            {task.description}
          </p>
        )}
      </div>

      {/* Arrow for deep link */}
      {task.deep_link && !isCompleted && (
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
    </button>
  );
};

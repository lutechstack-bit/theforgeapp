import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { addDays, format, isPast, isToday } from 'date-fns';
import type { JourneyTask } from '@/hooks/useStudentJourney';

interface TaskRowProps {
  task: JourneyTask;
  isCompleted: boolean;
  isAutoCompleted: boolean;
  onToggle: () => void;
  forgeStartDate?: string | null;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  isCompleted,
  isAutoCompleted,
  onToggle,
  forgeStartDate,
}) => {
  const navigate = useNavigate();

  // Calculate due date if applicable
  const getDueDate = () => {
    if (!forgeStartDate || task.due_days_offset === null) return null;
    return addDays(new Date(forgeStartDate), task.due_days_offset);
  };

  const dueDate = getDueDate();
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && !isCompleted;
  const isDueToday = dueDate && isToday(dueDate);

  // Handle deep link navigation
  const handleDeepLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.deep_link) {
      navigate(task.deep_link);
    }
  };

  // Handle checkbox toggle
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAutoCompleted) {
      onToggle();
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
        "hover:bg-secondary/50",
        isCompleted && "opacity-75"
      )}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isAutoCompleted) onToggle();
        }
      }}
    >
      {/* Checkbox */}
      <div 
        className="flex-shrink-0"
        onClick={handleToggle}
      >
        <Checkbox
          checked={isCompleted}
          disabled={isAutoCompleted}
          className={cn(
            "h-5 w-5 rounded-full transition-all",
            isCompleted && "bg-primary border-primary",
            isAutoCompleted && "cursor-default"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate",
              isCompleted ? "text-muted-foreground line-through" : "text-foreground"
            )}
          >
            {task.title}
          </span>

          {/* Auto-completed badge */}
          {isAutoCompleted && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
              Auto
            </Badge>
          )}

          {/* Required indicator */}
          {task.is_required && !isCompleted && (
            <span className="w-1 h-1 rounded-full bg-destructive flex-shrink-0" />
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {task.description}
          </p>
        )}

        {/* Due date */}
        {dueDate && !isCompleted && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className={cn(
              "w-3 h-3",
              isOverdue ? "text-destructive" : isDueToday ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-[10px]",
              isOverdue ? "text-destructive font-medium" : isDueToday ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              {isOverdue ? 'Overdue' : isDueToday ? 'Due today' : `Due ${format(dueDate, 'MMM d')}`}
            </span>
          </div>
        )}
      </div>

      {/* Deep link arrow */}
      {task.deep_link && (
        <button
          onClick={handleDeepLink}
          className="flex-shrink-0 p-1.5 rounded-md hover:bg-primary/10 transition-colors"
          aria-label="Go to task"
        >
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>
      )}
    </div>
  );
};

export default TaskRow;

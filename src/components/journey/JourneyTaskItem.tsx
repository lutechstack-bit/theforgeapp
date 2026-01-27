import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Sparkles, GripVertical } from 'lucide-react';
import { JourneyTask } from '@/hooks/useStudentJourney';
import { DueDateBadge } from './DueDateBadge';
import { TaskCompletedPop } from './ConfettiCelebration';

interface JourneyTaskItemProps {
  task: JourneyTask;
  isCompleted: boolean;
  isAutoCompleted: boolean;
  onToggle: () => void;
  variant?: 'default' | 'compact';
  forgeStartDate?: string | null;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, taskId: string) => void;
}

export const JourneyTaskItem: React.FC<JourneyTaskItemProps> = ({
  task,
  isCompleted,
  isAutoCompleted,
  onToggle,
  variant = 'default',
  forgeStartDate,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const navigate = useNavigate();
  const [showPop, setShowPop] = useState(false);

  const handleClick = () => {
    if (task.deep_link && !isCompleted) {
      navigate(task.deep_link);
    } else if (!isAutoCompleted) {
      // Show pop animation on completion
      if (!isCompleted) {
        setShowPop(true);
        setTimeout(() => setShowPop(false), 600);
      }
      onToggle();
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 w-full text-left py-1 transition-colors',
          isCompleted ? 'text-gray-500' : 'text-gray-800 hover:text-gray-900'
        )}
      >
        <div
          className={cn(
            'w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors',
            isCompleted
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-400 hover:border-gray-600'
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
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, task.id)}
      className={cn(
        'relative',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
    >
      <TaskCompletedPop isActive={showPop} />
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 w-full text-left p-2 rounded-lg transition-all',
          'hover:bg-black/5',
          isCompleted && 'opacity-70'
        )}
      >
        {/* Drag handle */}
        {draggable && (
          <GripVertical className="w-4 h-4 text-gray-400 shrink-0 touch-none" />
        )}

        {/* Checkbox */}
        <div
          className={cn(
            'w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all',
            isCompleted
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-400 hover:border-gray-600 hover:scale-105'
          )}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium truncate text-gray-900',
                isCompleted && 'line-through text-gray-500'
              )}
            >
              {task.title}
            </span>
            {isAutoCompleted && (
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            {/* Due date badge */}
            <DueDateBadge
              dueDaysOffset={task.due_days_offset}
              forgeStartDate={forgeStartDate}
              isCompleted={isCompleted}
              compact
            />
          </div>
          {task.description && (
            <p className="text-xs text-gray-600 truncate">
              {task.description}
            </p>
          )}
        </div>

        {/* Arrow for deep link */}
        {task.deep_link && !isCompleted && (
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>
    </div>
  );
};

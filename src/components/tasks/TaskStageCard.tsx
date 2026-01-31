import React from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { icons } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TaskRow from './TaskRow';
import type { JourneyStage, JourneyTask } from '@/hooks/useStudentJourney';

interface TaskStageCardProps {
  stage: JourneyStage;
  tasks: JourneyTask[];
  isExpanded: boolean;
  onToggle: () => void;
  variant: 'completed' | 'current' | 'upcoming';
  completedCount: number;
  totalCount: number;
  isTaskCompleted: (taskId: string) => boolean;
  isTaskAutoCompleted: (task: JourneyTask) => boolean;
  onTaskToggle: (taskId: string) => void;
  forgeStartDate?: string | null;
}

// Stage color mapping
const stageColors: Record<string, string> = {
  pre_registration: 'emerald',
  pre_travel: 'blue',
  final_prep: 'purple',
  online_forge: 'orange',
  physical_forge: 'primary',
  post_forge: 'rose',
};

const TaskStageCard: React.FC<TaskStageCardProps> = ({
  stage,
  tasks,
  isExpanded,
  onToggle,
  variant,
  completedCount,
  totalCount,
  isTaskCompleted,
  isTaskAutoCompleted,
  onTaskToggle,
  forgeStartDate,
}) => {
  const isComplete = completedCount === totalCount && totalCount > 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const stageColor = stageColors[stage.stage_key] || 'primary';

  // Get icon component
  const IconComponent = stage.icon ? (icons[stage.icon as keyof typeof icons] || icons.Circle) : icons.Circle;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        className={cn(
          "rounded-xl border transition-all duration-200 overflow-hidden",
          variant === 'current' && "border-primary/50 bg-card shadow-md",
          variant === 'completed' && "border-border/50 bg-card/50",
          variant === 'upcoming' && "border-border/30 bg-card/30 opacity-80"
        )}
      >
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 p-4 text-left transition-colors",
              "hover:bg-secondary/30",
              variant === 'current' && "bg-primary/5"
            )}
          >
            {/* Stage Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                isComplete && "bg-emerald-500/20",
                !isComplete && variant === 'current' && "bg-primary/20",
                !isComplete && variant !== 'current' && "bg-secondary"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <IconComponent className={cn(
                  "w-5 h-5",
                  variant === 'current' ? "text-primary" : "text-muted-foreground"
                )} />
              )}
            </div>

            {/* Title & Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "font-semibold truncate",
                  variant === 'current' ? "text-foreground" : "text-muted-foreground"
                )}>
                  {stage.title}
                </h3>
                {variant === 'current' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    Current
                  </span>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <Progress 
                  value={progressPercent} 
                  className="h-1.5 flex-1 bg-secondary"
                />
                <span className="text-xs text-muted-foreground font-medium min-w-[40px] text-right">
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>

            {/* Expand/Collapse Icon */}
            <ChevronDown
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        {/* Task List */}
        <CollapsibleContent>
          <div className="border-t border-border/50">
            {tasks.length > 0 ? (
              <div className="py-1">
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isCompleted={isTaskCompleted(task.id)}
                    isAutoCompleted={isTaskAutoCompleted(task)}
                    onToggle={() => onTaskToggle(task.id)}
                    forgeStartDate={forgeStartDate}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No tasks for this stage
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default TaskStageCard;

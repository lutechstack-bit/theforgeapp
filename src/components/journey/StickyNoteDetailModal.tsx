import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JourneyStage, JourneyTask } from '@/hooks/useStudentJourney';
import * as LucideIcons from 'lucide-react';

interface StickyNoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: JourneyStage | null;
  stageIndex: number;
  totalStages: number;
  tasks: JourneyTask[];
  isTaskCompleted: (taskId: string) => boolean;
  isTaskAutoCompleted: (task: JourneyTask) => boolean;
  onToggleTask: (taskId: string) => void;
  getPrepCategoryProgress?: (category: string) => { completed: number; total: number };
}

export const StickyNoteDetailModal: React.FC<StickyNoteDetailModalProps> = ({
  isOpen,
  onClose,
  stage,
  stageIndex,
  totalStages,
  tasks,
  isTaskCompleted,
  isTaskAutoCompleted,
  onToggleTask,
  getPrepCategoryProgress,
}) => {
  const navigate = useNavigate();

  if (!stage) return null;

  const completedCount = tasks.filter(t => isTaskCompleted(t.id)).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  // Get icon component
  const IconComponent = stage.icon 
    ? (LucideIcons as any)[stage.icon] || LucideIcons.Circle 
    : LucideIcons.Circle;

  const handleDeepLinkClick = (e: React.MouseEvent, deepLink: string) => {
    e.stopPropagation();
    navigate(deepLink);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-3 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IconComponent className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {stage.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Stage {stageIndex + 1} of {totalStages}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedCount}/{tasks.length} complete</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </DialogHeader>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1">
          {tasks.map((task) => {
            const isCompleted = isTaskCompleted(task.id);
            const isAuto = isTaskAutoCompleted(task);
            const prepProgress = task.linked_prep_category && getPrepCategoryProgress
              ? getPrepCategoryProgress(task.linked_prep_category)
              : null;

            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                  'hover:bg-muted/50',
                  isCompleted && 'opacity-70'
                )}
                onClick={() => onToggleTask(task.id)}
              >
                {/* Checkbox */}
                <button
                  className={cn(
                    'w-5 h-5 mt-0.5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-muted-foreground/40 hover:border-muted-foreground'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask(task.id);
                  }}
                >
                  {isCompleted && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCompleted && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </span>
                    {isAuto && (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.description}
                    </p>
                  )}

                  {/* Prep category progress bar */}
                  {prepProgress && prepProgress.total > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(prepProgress.completed / prepProgress.total) * 100} 
                          className="h-1.5 flex-1" 
                        />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {prepProgress.completed}/{prepProgress.total} items
                        </span>
                      </div>
                      {isAuto && prepProgress.completed === prepProgress.total && (
                        <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Auto-synced from Prep
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Deep link arrow */}
                {task.deep_link && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 shrink-0"
                    onClick={(e) => handleDeepLinkClick(e, task.deep_link!)}
                  >
                    <span className="text-xs mr-1">Go</span>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No tasks for this stage</p>
            </div>
          )}
        </div>

        {/* Footer with CTA */}
        {stage.stage_key === 'final_prep' && (
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigate('/roadmap/prep');
                onClose();
              }}
            >
              View Full Prep Checklist
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

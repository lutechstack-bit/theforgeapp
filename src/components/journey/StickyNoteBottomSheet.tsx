import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JourneyStage, JourneyTask } from '@/hooks/useStudentJourney';
import { SwipeableTaskItem } from './SwipeableTaskItem';
import * as LucideIcons from 'lucide-react';

interface StickyNoteBottomSheetProps {
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

export const StickyNoteBottomSheet: React.FC<StickyNoteBottomSheetProps> = ({
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

  const handleNavigate = (deepLink: string) => {
    navigate(deepLink);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="space-y-3 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IconComponent className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DrawerTitle className="text-lg font-bold text-left">
                  {stage.title}
                </DrawerTitle>
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
          
          {/* Swipe hint */}
          <p className="text-[10px] text-muted-foreground text-center">
            ← Swipe left to undo • Swipe right to complete →
          </p>
        </DrawerHeader>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto py-3 px-4 space-y-1 max-h-[60vh]">
          {tasks.map((task) => {
            const isCompleted = isTaskCompleted(task.id);
            const isAuto = isTaskAutoCompleted(task);
            const prepProgress = task.linked_prep_category && getPrepCategoryProgress
              ? getPrepCategoryProgress(task.linked_prep_category)
              : null;

            return (
              <SwipeableTaskItem
                key={task.id}
                task={task}
                isCompleted={isCompleted}
                isAutoCompleted={isAuto}
                onToggle={() => onToggleTask(task.id)}
                onNavigate={handleNavigate}
                prepProgress={prepProgress}
              />
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
          <div className="p-4 border-t safe-area-pb">
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
      </DrawerContent>
    </Drawer>
  );
};

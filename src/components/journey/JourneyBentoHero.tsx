import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentJourney, JourneyStage } from '@/hooks/useStudentJourney';
import { useIsMobile } from '@/hooks/use-mobile';
import { StageNavigationStrip } from './StageNavigationStrip';
import { StickyNoteCard } from './StickyNoteCard';
import { StickyNoteDetailModal } from './StickyNoteDetailModal';
import { JourneyTaskItem } from './JourneyTaskItem';
import { TaskFilters, TaskFilterType } from './TaskFilters';
import { QuickActionsRow } from './QuickActionsRow';
import { ConfettiCelebration } from './ConfettiCelebration';
import { differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';

export const JourneyBentoHero: React.FC = () => {
  const { profile, edition } = useAuth();
  const isMobile = useIsMobile();
  const {
    stages,
    currentStage,
    currentStageKey,
    completedStages,
    upcomingStages,
    getTasksForStage,
    getStageStats,
    isTaskCompleted,
    isTaskAutoCompleted,
    toggleTask,
    isLoading,
    getPrepCategoryProgress,
  } = useStudentJourney();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<TaskFilterType>('all');
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStageId, setCelebrationStageId] = useState<string | null>(null);

  // Modal state for sticky note detail
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Drag state for reordering
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [taskOrder, setTaskOrder] = useState<string[]>([]);

  // Calculate days until Forge
  const daysUntilForge = edition?.forge_start_date
    ? differenceInDays(new Date(edition.forge_start_date), new Date())
    : null;

  // Get first name for greeting
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Generate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Generate progress message
  const getProgressMessage = () => {
    if (daysUntilForge === null) return 'Your Forge journey awaits';
    if (daysUntilForge < 0) return 'Forge is in progress!';
    if (daysUntilForge === 0) return 'Forge starts today! 🎬';
    if (daysUntilForge === 1) return 'Forge starts tomorrow!';
    return `${daysUntilForge} days until Forge`;
  };

  // Filter tasks for current stage
  const getFilteredTasks = useCallback((stageId: string) => {
    const tasks = getTasksForStage(stageId);
    
    switch (activeFilter) {
      case 'required':
        return tasks.filter(t => t.is_required);
      case 'optional':
        return tasks.filter(t => !t.is_required);
      case 'completed':
        return tasks.filter(t => isTaskCompleted(t.id));
      default:
        return tasks;
    }
  }, [activeFilter, getTasksForStage, isTaskCompleted]);

  // Get filter counts for current stage
  const getFilterCounts = useCallback((stageId: string) => {
    const tasks = getTasksForStage(stageId);
    return {
      all: tasks.length,
      required: tasks.filter(t => t.is_required).length,
      optional: tasks.filter(t => !t.is_required).length,
      completed: tasks.filter(t => isTaskCompleted(t.id)).length,
    };
  }, [getTasksForStage, isTaskCompleted]);

  // Drag handlers for reordering
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    // Reorder tasks (just local state for now)
    const tasks = currentStage ? getTasksForStage(currentStage.id) : [];
    const taskIds = tasks.map(t => t.id);
    const draggedIndex = taskIds.indexOf(draggedTaskId);
    const targetIndex = taskIds.indexOf(targetTaskId);

    const newOrder = [...taskIds];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedTaskId);
    setTaskOrder(newOrder);
    setDraggedTaskId(null);
  };

  // Handle task toggle with celebration check
  const handleTaskToggle = (taskId: string, stageId: string) => {
    const wasCompleted = isTaskCompleted(taskId);
    toggleTask.mutate({ taskId, completed: !wasCompleted });

    // Check if this completes the stage
    if (!wasCompleted) {
      const stats = getStageStats(stageId);
      if (stats.completed + 1 === stats.total) {
        setCelebrationStageId(stageId);
        setShowCelebration(true);
      }
    }
  };

  // Handle sticky note click to open modal
  const handleStageClick = (stage: JourneyStage) => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };

  // Handle task toggle from modal
  const handleModalTaskToggle = (taskId: string) => {
    if (!selectedStage) return;
    handleTaskToggle(taskId, selectedStage.id);
  };

  if (isLoading || !stages) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // Get the most recent completed stage to show
  const lastCompletedStage = completedStages[completedStages.length - 1];
  // Get the next upcoming stage
  const nextUpcomingStage = upcomingStages[0];

  // Freeform rotations for desktop
  const rotations = { completed: -3, current: 0, upcoming: 4 };

  return (
    <div className="space-y-4 relative">
      {/* Celebration overlay */}
      <ConfettiCelebration
        isActive={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Header with greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            {getProgressMessage()}
          </p>
        </div>
        {currentStage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Stage {(currentStage.order_index || 0) + 1} of {stages.length}</span>
          </div>
        )}
      </div>

      {/* Stage Navigation Strip with Progress Rings */}
      <div className="glass-card rounded-xl p-2">
        <StageNavigationStrip
          stages={stages}
          currentStageKey={currentStageKey}
          getStageStats={getStageStats}
        />
      </div>

      {/* Desktop: Freeform Bento Layout */}
      {!isMobile && (
        <div className="relative min-h-[340px]">
          {/* Completed Stage Card - Left */}
          <div 
            className="absolute left-0 top-4 w-[280px] z-10"
            style={{ transform: `rotate(${rotations.completed}deg)` }}
          >
            {lastCompletedStage ? (
              <StickyNoteCard
                title={lastCompletedStage.title}
                icon={lastCompletedStage.icon || 'Circle'}
                color={lastCompletedStage.stage_key}
                rotation={0}
                variant="completed"
                completedCount={getStageStats(lastCompletedStage.id).completed}
                totalCount={getStageStats(lastCompletedStage.id).total}
                onClick={() => handleStageClick(lastCompletedStage)}
              >
                {getTasksForStage(lastCompletedStage.id).slice(0, 4).map((task) => (
                  <JourneyTaskItem
                    key={task.id}
                    task={task}
                    isCompleted={isTaskCompleted(task.id)}
                    isAutoCompleted={isTaskAutoCompleted(task)}
                    onToggle={() => handleTaskToggle(task.id, lastCompletedStage.id)}
                    variant="compact"
                    forgeStartDate={edition?.forge_start_date}
                  />
                ))}
                {getTasksForStage(lastCompletedStage.id).length > 4 && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{getTasksForStage(lastCompletedStage.id).length - 4} more
                  </p>
                )}
              </StickyNoteCard>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm p-8 bg-gray-100 rounded-xl border border-gray-200">
                <p>Complete your first stage!</p>
              </div>
            )}
          </div>

          {/* Current Stage Card - Center (larger) */}
          {currentStage && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[340px] z-30"
              style={{ transform: `translateX(-50%) rotate(${rotations.current}deg)` }}
            >
              <StickyNoteCard
                title={currentStage.title}
                icon={currentStage.icon || 'Circle'}
                color={currentStage.stage_key}
                rotation={0}
                variant="current"
                completedCount={getStageStats(currentStage.id).completed}
                totalCount={getStageStats(currentStage.id).total}
                onClick={() => handleStageClick(currentStage)}
              >
                {/* Task Filters */}
                <TaskFilters
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  counts={getFilterCounts(currentStage.id)}
                  className="mb-2"
                />

                {/* Filtered Tasks */}
                <div className="space-y-0.5 max-h-[220px] overflow-y-auto scrollbar-hide">
                  {getFilteredTasks(currentStage.id).map((task) => (
                    <JourneyTaskItem
                      key={task.id}
                      task={task}
                      isCompleted={isTaskCompleted(task.id)}
                      isAutoCompleted={isTaskAutoCompleted(task)}
                      onToggle={() => handleTaskToggle(task.id, currentStage.id)}
                      forgeStartDate={edition?.forge_start_date}
                      draggable
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))}
                  {getFilteredTasks(currentStage.id).length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No tasks match this filter
                    </p>
                  )}
                </div>
              </StickyNoteCard>
            </div>
          )}

          {/* Upcoming Stage Card - Right */}
          <div 
            className="absolute right-0 top-6 w-[260px] z-20"
            style={{ transform: `rotate(${rotations.upcoming}deg)` }}
          >
            {nextUpcomingStage ? (
              <StickyNoteCard
                title={nextUpcomingStage.title}
                icon={nextUpcomingStage.icon || 'Circle'}
                color={nextUpcomingStage.stage_key}
                rotation={0}
                variant="upcoming"
                completedCount={0}
                totalCount={getStageStats(nextUpcomingStage.id).total}
              >
                {getTasksForStage(nextUpcomingStage.id).slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 py-1 text-gray-500"
                  >
                    <div className="w-4 h-4 rounded border border-gray-300" />
                    <span className="text-xs truncate">{task.title}</span>
                  </div>
                ))}
                {getTasksForStage(nextUpcomingStage.id).length > 4 && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{getTasksForStage(nextUpcomingStage.id).length - 4} more
                  </p>
                )}
              </StickyNoteCard>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm p-8 bg-gray-100 rounded-xl border border-gray-200">
                <p>You're almost there!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: Vertical Stack */}
      {isMobile && (
        <div className="space-y-3">
          {/* Current Stage */}
          {currentStage && (
            <StickyNoteCard
              title={currentStage.title}
              icon={currentStage.icon || 'Circle'}
              color={currentStage.stage_key}
              rotation={0}
              variant="current"
              completedCount={getStageStats(currentStage.id).completed}
              totalCount={getStageStats(currentStage.id).total}
              onClick={() => handleStageClick(currentStage)}
            >
              <TaskFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={getFilterCounts(currentStage.id)}
                className="mb-2"
              />
              <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
                {getFilteredTasks(currentStage.id).map((task) => (
                  <JourneyTaskItem
                    key={task.id}
                    task={task}
                    isCompleted={isTaskCompleted(task.id)}
                    isAutoCompleted={isTaskAutoCompleted(task)}
                    onToggle={() => handleTaskToggle(task.id, currentStage.id)}
                    forgeStartDate={edition?.forge_start_date}
                  />
                ))}
              </div>
            </StickyNoteCard>
          )}

          {/* Completed stages collapsed */}
          {completedStages.length > 0 && (
            <details className="group">
              <summary className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl cursor-pointer border border-emerald-200 dark:border-emerald-900">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  ✓ {completedStages.length} completed stage{completedStages.length > 1 ? 's' : ''}
                </span>
                <span className="text-xs text-emerald-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="mt-2 space-y-2">
                {completedStages.map((stage) => (
                  <StickyNoteCard
                    key={stage.id}
                    title={stage.title}
                    icon={stage.icon || 'Circle'}
                    color={stage.stage_key}
                    rotation={0}
                    variant="completed"
                    completedCount={getStageStats(stage.id).completed}
                    totalCount={getStageStats(stage.id).total}
                    onClick={() => handleStageClick(stage)}
                  >
                    {getTasksForStage(stage.id).map((task) => (
                      <JourneyTaskItem
                        key={task.id}
                        task={task}
                        isCompleted={isTaskCompleted(task.id)}
                        isAutoCompleted={isTaskAutoCompleted(task)}
                        onToggle={() => handleTaskToggle(task.id, stage.id)}
                        variant="compact"
                        forgeStartDate={edition?.forge_start_date}
                      />
                    ))}
                  </StickyNoteCard>
                ))}
              </div>
            </details>
          )}

          {/* Upcoming stages preview */}
          {upcomingStages.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Coming up next:</p>
              <div className="flex flex-wrap gap-2">
                {upcomingStages.map((stage) => (
                  <span
                    key={stage.id}
                    className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {stage.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions Row */}
      <QuickActionsRow className="mt-4" />

      {/* Sticky Note Detail Modal */}
      <StickyNoteDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stage={selectedStage}
        stageIndex={selectedStage ? stages.findIndex(s => s.id === selectedStage.id) : 0}
        totalStages={stages.length}
        tasks={selectedStage ? getTasksForStage(selectedStage.id) : []}
        isTaskCompleted={isTaskCompleted}
        isTaskAutoCompleted={isTaskAutoCompleted}
        onToggleTask={handleModalTaskToggle}
        getPrepCategoryProgress={getPrepCategoryProgress}
      />
    </div>
  );
};

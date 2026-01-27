import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentJourney, JourneyStage } from '@/hooks/useStudentJourney';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQueryClient } from '@tanstack/react-query';
import { StageNavigationStrip } from './StageNavigationStrip';
import { StickyNoteCard } from './StickyNoteCard';
import { StickyNoteCardStack } from './StickyNoteCardStack';
import { StickyNoteDetailModal } from './StickyNoteDetailModal';
import { StickyNoteBottomSheet } from './StickyNoteBottomSheet';
import { JourneyTaskItem } from './JourneyTaskItem';
import { TaskFilters, TaskFilterType } from './TaskFilters';
import { QuickActionsRow } from './QuickActionsRow';
import { ConfettiCelebration } from './ConfettiCelebration';
import { StreakBadge } from './StreakBadge';
import { FloatingActionButton } from './FloatingActionButton';

import { PullToRefreshWrapper } from './PullToRefreshWrapper';
import { differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';

export const JourneyBentoHero: React.FC = () => {
  const { profile, edition } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const heroRef = useRef<HTMLDivElement>(null);
  
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

  // Modal/Sheet state for sticky note detail
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mobile stacked card state
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState<number | null>(null);

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

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['journey_stages'] }),
      queryClient.invalidateQueries({ queryKey: ['journey_tasks'] }),
      queryClient.invalidateQueries({ queryKey: ['user_journey_progress'] }),
      queryClient.invalidateQueries({ queryKey: ['user_streak'] }),
      queryClient.invalidateQueries({ queryKey: ['user-prep-progress'] }),
    ]);
  }, [queryClient]);

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

  // Handle sticky note click to open modal/sheet
  const handleStageClick = (stage: JourneyStage) => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };

  // Handle task toggle from modal/sheet
  const handleModalTaskToggle = (taskId: string) => {
    if (!selectedStage) return;
    handleTaskToggle(taskId, selectedStage.id);
  };

  // Handle mark as reviewed from FAB
  const handleMarkAsReviewed = () => {
    if (!currentStage) return;
    // Mark all tasks in current stage as completed
    const tasks = getTasksForStage(currentStage.id);
    tasks.forEach(task => {
      if (!isTaskCompleted(task.id)) {
        toggleTask.mutate({ taskId: task.id, completed: true });
      }
    });
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


  // Build array: completed + current + upcoming
  const allOrderedStages = [...completedStages, currentStage, ...upcomingStages].filter(Boolean) as JourneyStage[];
  const currentStageIndex = currentStage 
    ? allOrderedStages.findIndex(s => s.id === currentStage.id) 
    : 0;

  // Initialize mobile current index if not set
  const effectiveMobileIndex = mobileCurrentIndex ?? currentStageIndex;

  const heroContent = (
    <div className="space-y-4 relative overflow-hidden" ref={heroRef}>
      {/* Celebration overlay */}
      <ConfettiCelebration
        isActive={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />


      {/* Header with greeting and streak */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <StreakBadge />
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
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
      <div className="glass-card rounded-xl p-2 overflow-hidden">
        <StageNavigationStrip
          stages={stages}
          currentStageKey={currentStageKey}
          getStageStats={getStageStats}
        />
      </div>

      {/* Desktop: Responsive Grid Layout */}
      {!isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Main Column - Current Stage */}
          {currentStage && (
            <div className="relative">
              <StickyNoteCard
                title={currentStage.title}
                icon={currentStage.icon || 'Circle'}
                color={currentStage.stage_key}
                rotation={0}
                variant="current"
                completedCount={getStageStats(currentStage.id).completed}
                totalCount={getStageStats(currentStage.id).total}
                onClick={() => handleStageClick(currentStage)}
                fullWidth
              >
                {/* Task Filters */}
                <TaskFilters
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  counts={getFilterCounts(currentStage.id)}
                  className="mb-3"
                />

                {/* Filtered Tasks */}
                <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-hide">
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
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No tasks match this filter
                    </p>
                  )}
                </div>
              </StickyNoteCard>
            </div>
          )}

          {/* Side Panel - Completed & Upcoming Stages */}
          <div className="flex flex-col gap-3">
            {/* Last Completed Stage */}
            {lastCompletedStage ? (
              <StickyNoteCard
                title={lastCompletedStage.title}
                icon={lastCompletedStage.icon || 'Circle'}
                color={lastCompletedStage.stage_key}
                rotation={-1}
                variant="completed"
                completedCount={getStageStats(lastCompletedStage.id).completed}
                totalCount={getStageStats(lastCompletedStage.id).total}
                onClick={() => handleStageClick(lastCompletedStage)}
                fullWidth
              >
                {getTasksForStage(lastCompletedStage.id).slice(0, 3).map((task) => (
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
                {getTasksForStage(lastCompletedStage.id).length > 3 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    +{getTasksForStage(lastCompletedStage.id).length - 3} more
                  </p>
                )}
              </StickyNoteCard>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground text-sm p-6 bg-muted/50 rounded-xl border border-border">
                <p>Complete your first stage!</p>
              </div>
            )}

            {/* Next Upcoming Stage */}
            {nextUpcomingStage ? (
              <StickyNoteCard
                title={nextUpcomingStage.title}
                icon={nextUpcomingStage.icon || 'Circle'}
                color={nextUpcomingStage.stage_key}
                rotation={1}
                variant="upcoming"
                completedCount={0}
                totalCount={getStageStats(nextUpcomingStage.id).total}
                fullWidth
              >
                {getTasksForStage(nextUpcomingStage.id).slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 py-1 text-muted-foreground"
                  >
                    <div className="w-4 h-4 rounded border border-border" />
                    <span className="text-xs truncate">{task.title}</span>
                  </div>
                ))}
                {getTasksForStage(nextUpcomingStage.id).length > 3 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    +{getTasksForStage(nextUpcomingStage.id).length - 3} more
                  </p>
                )}
              </StickyNoteCard>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground text-sm p-6 bg-muted/50 rounded-xl border border-border">
                <p>You're almost there!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: Stacked Card UI */}
      {isMobile && (
        <StickyNoteCardStack
          stages={allOrderedStages}
          currentIndex={effectiveMobileIndex}
          onStageChange={setMobileCurrentIndex}
        >
          {(stage, index) => {
            const stats = getStageStats(stage.id);
            const isCurrent = stage.id === currentStage?.id;
            const isCompleted = completedStages.some(s => s.id === stage.id);
            const isUpcoming = upcomingStages.some(s => s.id === stage.id);
            const isActive = index === effectiveMobileIndex;

            return (
              <StickyNoteCard
                title={stage.title}
                icon={stage.icon || 'Circle'}
                color={stage.stage_key}
                rotation={0}
                variant={isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}
                completedCount={stats.completed}
                totalCount={stats.total}
                onClick={() => handleStageClick(stage)}
                fullWidth
              >
                {isActive && isCurrent && (
                  <>
                    <TaskFilters
                      activeFilter={activeFilter}
                      onFilterChange={setActiveFilter}
                      counts={getFilterCounts(stage.id)}
                      className="mb-2"
                    />
                    <div className="space-y-0.5 max-h-[180px] overflow-y-auto scrollbar-hide">
                      {getFilteredTasks(stage.id).slice(0, 5).map((task) => (
                        <JourneyTaskItem
                          key={task.id}
                          task={task}
                          isCompleted={isTaskCompleted(task.id)}
                          isAutoCompleted={isTaskAutoCompleted(task)}
                          onToggle={() => handleTaskToggle(task.id, stage.id)}
                          forgeStartDate={edition?.forge_start_date}
                        />
                      ))}
                      {getFilteredTasks(stage.id).length > 5 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Tap to see all {getFilteredTasks(stage.id).length} tasks
                        </p>
                      )}
                    </div>
                  </>
                )}
                
                {isActive && isCompleted && (
                  <div className="space-y-0.5">
                    {getTasksForStage(stage.id).slice(0, 4).map((task) => (
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
                    {getTasksForStage(stage.id).length > 4 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{getTasksForStage(stage.id).length - 4} more
                      </p>
                    )}
                  </div>
                )}

                {isActive && isUpcoming && !isCurrent && (
                  <div className="space-y-0.5 opacity-60">
                    {getTasksForStage(stage.id).slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 py-1 text-muted-foreground"
                      >
                        <div className="w-4 h-4 rounded border border-border" />
                        <span className="text-xs truncate">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </StickyNoteCard>
            );
          }}
        </StickyNoteCardStack>
      )}

      {/* Quick Actions Row */}
      <QuickActionsRow className="mt-4" />

      {/* Floating Action Button - Available on all devices */}
      <FloatingActionButton
        onMarkAsReviewed={handleMarkAsReviewed}
        currentStageName={currentStage?.title}
      />

      {/* Bottom Sheet for Mobile, Dialog for Desktop */}
      {isMobile ? (
        <StickyNoteBottomSheet
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
      ) : (
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
      )}
    </div>
  );

  // Wrap with pull-to-refresh on mobile
  if (isMobile) {
    return (
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        {heroContent}
      </PullToRefreshWrapper>
    );
  }

  return heroContent;
};

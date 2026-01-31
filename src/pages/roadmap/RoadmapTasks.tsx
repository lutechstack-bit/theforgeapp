import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentJourney } from '@/hooks/useStudentJourney';
import { useQueryClient } from '@tanstack/react-query';
import { TaskStageCard, TasksHeader, type TaskFilterType } from '@/components/tasks';
import { ConfettiCelebration } from '@/components/journey/ConfettiCelebration';
import { PersonalNoteCard } from '@/components/journey/PersonalNoteCard';
import { PullToRefreshWrapper } from '@/components/journey/PullToRefreshWrapper';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

const RoadmapTasks: React.FC = () => {
  const { edition } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  const {
    stages,
    currentStage,
    completedStages,
    upcomingStages,
    getTasksForStage,
    getStageStats,
    isTaskCompleted,
    isTaskAutoCompleted,
    toggleTask,
    isLoading,
  } = useStudentJourney();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<TaskFilterType>('all');

  // Expanded stages state - current stage expanded by default
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    new Set(currentStage ? [currentStage.id] : [])
  );

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);

  // Toggle stage expansion
  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
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

  // Calculate total stats
  const totalStats = useMemo(() => {
    if (!stages) return { completed: 0, total: 0, required: 0, optional: 0 };
    
    let completed = 0;
    let total = 0;
    let required = 0;
    let optional = 0;

    stages.forEach(stage => {
      const tasks = getTasksForStage(stage.id);
      tasks.forEach(task => {
        total++;
        if (isTaskCompleted(task.id)) completed++;
        if (task.is_required) required++;
        else optional++;
      });
    });

    return { completed, total, required, optional };
  }, [stages, getTasksForStage, isTaskCompleted]);

  // Get filter counts
  const filterCounts = useMemo(() => ({
    all: totalStats.total,
    required: totalStats.required,
    optional: totalStats.total - totalStats.required,
    completed: totalStats.completed,
  }), [totalStats]);

  // Filter tasks for a stage
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

  // Handle task toggle with celebration check
  const handleTaskToggle = (taskId: string, stageId: string) => {
    const wasCompleted = isTaskCompleted(taskId);
    toggleTask.mutate({ taskId, completed: !wasCompleted });

    // Check if this completes the stage
    if (!wasCompleted) {
      const stats = getStageStats(stageId);
      if (stats.completed + 1 === stats.total) {
        setShowCelebration(true);
      }
    }
  };

  // Get variant for a stage
  const getStageVariant = (stageId: string): 'completed' | 'current' | 'upcoming' => {
    if (completedStages.some(s => s.id === stageId)) return 'completed';
    if (currentStage?.id === stageId) return 'current';
    return 'upcoming';
  };

  if (isLoading || !stages) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  // Order stages: completed → current → upcoming
  const orderedStages = [...completedStages, currentStage, ...upcomingStages].filter(Boolean);

  const tasksContent = (
    <div className="py-4 space-y-4">
      {/* Celebration overlay */}
      <ConfettiCelebration
        isActive={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Header with stats and filters */}
      <TasksHeader
        completedCount={totalStats.completed}
        totalCount={totalStats.total}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
      />

      {/* Stage Cards */}
      <div className="space-y-3">
        {orderedStages.map((stage) => {
          if (!stage) return null;
          const stats = getStageStats(stage.id);
          const filteredTasks = getFilteredTasks(stage.id);

          // Don't show empty stages when filtering
          if (filteredTasks.length === 0 && activeFilter !== 'all') {
            return null;
          }

          return (
            <TaskStageCard
              key={stage.id}
              stage={stage}
              tasks={filteredTasks}
              isExpanded={expandedStages.has(stage.id)}
              onToggle={() => toggleStageExpansion(stage.id)}
              variant={getStageVariant(stage.id)}
              completedCount={stats.completed}
              totalCount={stats.total}
              isTaskCompleted={isTaskCompleted}
              isTaskAutoCompleted={isTaskAutoCompleted}
              onTaskToggle={(taskId) => handleTaskToggle(taskId, stage.id)}
              forgeStartDate={edition?.forge_start_date}
            />
          );
        })}
      </div>

      {/* Personal Note - Desktop sidebar or mobile bottom */}
      {!isMobile && (
        <div className="mt-6">
          <PersonalNoteCard />
        </div>
      )}

      {isMobile && (
        <div className="mt-4">
          <PersonalNoteCard />
        </div>
      )}
    </div>
  );

  // Wrap with pull-to-refresh on mobile
  if (isMobile) {
    return (
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        {tasksContent}
      </PullToRefreshWrapper>
    );
  }

  return tasksContent;
};

export default RoadmapTasks;

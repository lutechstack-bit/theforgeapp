import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentJourney } from '@/hooks/useStudentJourney';
import { StageNavigationStrip } from './StageNavigationStrip';
import { StickyNoteCard } from './StickyNoteCard';
import { JourneyTaskItem } from './JourneyTaskItem';
import { differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';

export const JourneyBentoHero: React.FC = () => {
  const navigate = useNavigate();
  const { profile, edition } = useAuth();
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
  } = useStudentJourney();

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

  // Rotations for sticky note effect
  const rotations = [-1.5, 0, 1.5];

  return (
    <div className="space-y-4">
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

      {/* Stage Navigation Strip */}
      <div className="glass-card rounded-xl p-2">
        <StageNavigationStrip
          stages={stages}
          currentStageKey={currentStageKey}
        />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completed Stage Card */}
        <div className="hidden md:block">
          {lastCompletedStage ? (
            <StickyNoteCard
              title={lastCompletedStage.title}
              icon={lastCompletedStage.icon || 'Circle'}
              color={lastCompletedStage.color || 'emerald'}
              rotation={rotations[0]}
              variant="completed"
              completedCount={getStageStats(lastCompletedStage.id).completed}
              totalCount={getStageStats(lastCompletedStage.id).total}
            >
              {getTasksForStage(lastCompletedStage.id).slice(0, 4).map((task) => (
                <JourneyTaskItem
                  key={task.id}
                  task={task}
                  isCompleted={isTaskCompleted(task.id)}
                  isAutoCompleted={isTaskAutoCompleted(task)}
                  onToggle={() => toggleTask.mutate({ taskId: task.id, completed: !isTaskCompleted(task.id) })}
                  variant="compact"
                />
              ))}
              {getTasksForStage(lastCompletedStage.id).length > 4 && (
                <p className="text-xs text-muted-foreground mt-1">
                  +{getTasksForStage(lastCompletedStage.id).length - 4} more
                </p>
              )}
            </StickyNoteCard>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-8 glass-card rounded-xl">
              <p>Complete your first stage!</p>
            </div>
          )}
        </div>

        {/* Current Stage Card - Main focus */}
        {currentStage && (
          <StickyNoteCard
            title={currentStage.title}
            icon={currentStage.icon || 'Circle'}
            color={currentStage.color || 'amber'}
            rotation={rotations[1]}
            variant="current"
            completedCount={getStageStats(currentStage.id).completed}
            totalCount={getStageStats(currentStage.id).total}
            className="md:col-span-1"
          >
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
              {getTasksForStage(currentStage.id).map((task) => (
                <JourneyTaskItem
                  key={task.id}
                  task={task}
                  isCompleted={isTaskCompleted(task.id)}
                  isAutoCompleted={isTaskAutoCompleted(task)}
                  onToggle={() => toggleTask.mutate({ taskId: task.id, completed: !isTaskCompleted(task.id) })}
                />
              ))}
            </div>
          </StickyNoteCard>
        )}

        {/* Upcoming Stage Card */}
        <div className="hidden md:block">
          {nextUpcomingStage ? (
            <StickyNoteCard
              title={nextUpcomingStage.title}
              icon={nextUpcomingStage.icon || 'Circle'}
              color={nextUpcomingStage.color || 'blue'}
              rotation={rotations[2]}
              variant="upcoming"
              completedCount={0}
              totalCount={getStageStats(nextUpcomingStage.id).total}
            >
              {getTasksForStage(nextUpcomingStage.id).slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 py-1 text-muted-foreground"
                >
                  <div className="w-4 h-4 rounded border border-muted-foreground/30" />
                  <span className="text-xs truncate">{task.title}</span>
                </div>
              ))}
              {getTasksForStage(nextUpcomingStage.id).length > 4 && (
                <p className="text-xs text-muted-foreground mt-1">
                  +{getTasksForStage(nextUpcomingStage.id).length - 4} more
                </p>
              )}
            </StickyNoteCard>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-8 glass-card rounded-xl">
              <p>You're almost there!</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Show all stages in accordion style */}
      <div className="md:hidden space-y-3">
        {/* Show completed stages collapsed */}
        {completedStages.length > 0 && (
          <details className="group">
            <summary className="flex items-center justify-between p-3 glass-card rounded-xl cursor-pointer">
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✓ {completedStages.length} completed stage{completedStages.length > 1 ? 's' : ''}
              </span>
              <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-2 space-y-2">
              {completedStages.map((stage) => (
                <StickyNoteCard
                  key={stage.id}
                  title={stage.title}
                  icon={stage.icon || 'Circle'}
                  color={stage.color || 'emerald'}
                  rotation={0}
                  variant="completed"
                  completedCount={getStageStats(stage.id).completed}
                  totalCount={getStageStats(stage.id).total}
                >
                  {getTasksForStage(stage.id).map((task) => (
                    <JourneyTaskItem
                      key={task.id}
                      task={task}
                      isCompleted={isTaskCompleted(task.id)}
                      isAutoCompleted={isTaskAutoCompleted(task)}
                      onToggle={() => toggleTask.mutate({ taskId: task.id, completed: !isTaskCompleted(task.id) })}
                      variant="compact"
                    />
                  ))}
                </StickyNoteCard>
              ))}
            </div>
          </details>
        )}

        {/* Upcoming stages preview */}
        {upcomingStages.length > 0 && (
          <div className="p-3 glass-card rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Coming up next:</p>
            <div className="flex flex-wrap gap-2">
              {upcomingStages.map((stage) => (
                <span
                  key={stage.id}
                  className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                >
                  {stage.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

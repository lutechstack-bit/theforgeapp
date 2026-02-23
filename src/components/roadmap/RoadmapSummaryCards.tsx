import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, CheckSquare, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import { useStudentJourney } from '@/hooks/useStudentJourney';
import { ProgressRing } from '@/components/journey/ProgressRing';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

const RoadmapSummaryCards: React.FC = () => {
  const navigate = useNavigate();
  const {
    roadmapDays,
    getDayStatus,
    currentDayNumber,
    totalCount,
    prepProgress,
    forgeMode,
  } = useRoadmapData();

  const { tasks, isTaskCompleted } = useStudentJourney();

  // Journey card data
  const currentDay = roadmapDays?.find(d => getDayStatus(d) === 'current')
    || roadmapDays?.find(d => getDayStatus(d) === 'upcoming')
    || roadmapDays?.[roadmapDays.length - 1];
  const bootcampDays = roadmapDays?.filter(d => d.day_number > 0) || [];

  const formattedDate = currentDay?.date
    ? format(new Date(currentDay.date), 'MMM d')
    : null;
  const timeLabel = (currentDay as any)?.session_start_time || null;
  const subtitle = [formattedDate, timeLabel ? `at ${timeLabel}` : null].filter(Boolean).join(' ');

  // Tasks card data
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => isTaskCompleted(t.id)).length || 0;
  const remainingTasks = totalTasks - completedTasks;
  const requiredTasks = tasks?.filter(t => t.is_required) || [];
  const requiredLeft = requiredTasks.filter(t => !isTaskCompleted(t.id)).length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Prep card data
  const { totalItems, completedItems, progressPercent, hasData } = prepProgress;
  const isOverdue = hasData && completedItems === 0 && forgeMode === 'PRE_FORGE';

  const cards = [
    {
      id: 'journey',
      icon: Map,
      title: 'Journey',
      path: '/roadmap',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-foreground line-clamp-1">
            {currentDay?.title || 'Journey'}
          </p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
          <div className="flex items-center gap-0.5 mt-1">
            {bootcampDays.slice(0, 12).map((d, i) => {
              const status = getDayStatus(d);
              return (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all',
                    status === 'completed' ? 'bg-primary' :
                    status === 'current' ? 'bg-primary animate-pulse' :
                    'bg-muted-foreground/20'
                  )}
                />
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: 'tasks',
      icon: CheckSquare,
      title: 'Tasks',
      path: '/roadmap/tasks',
      content: (
        <div className="flex items-center gap-3">
          <ProgressRing
            progress={taskPercent}
            size={44}
            strokeWidth={4}
            variant={taskPercent === 100 ? 'completed' : taskPercent > 0 ? 'current' : 'upcoming'}
          >
            <span className="text-[10px] font-bold text-foreground">{taskPercent}%</span>
          </ProgressRing>
          <div>
            <p className="text-sm font-semibold text-foreground">{remainingTasks} remaining</p>
            <p className="text-[11px] text-muted-foreground">{requiredLeft} required left</p>
          </div>
        </div>
      ),
    },
    {
      id: 'prep',
      icon: FileText,
      title: 'Prep',
      path: '/roadmap/prep',
      content: (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{progressPercent}% ready</p>
            {isOverdue && (
              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                Overdue
              </span>
            )}
          </div>
          <Progress value={progressPercent} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground">{completedItems}/{totalItems} items checked</p>
        </div>
      ),
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1 mb-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => navigate(card.path)}
            className={cn(
              'flex-1 min-w-[140px] snap-start',
              'rounded-xl border border-border/40 bg-card/60 p-4',
              'text-left transition-all duration-200',
              'hover:border-primary/30 hover:bg-card/80',
              'active:scale-[0.98]'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            {card.content}
          </button>
        );
      })}
    </div>
  );
};

export default RoadmapSummaryCards;

import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';
import { Progress } from '@/components/ui/progress';
import { 
  User, ClipboardCheck, MessageCircle, Luggage, 
  Calendar, Users, Check, ChevronRight, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  'user': User,
  'clipboard-check': ClipboardCheck,
  'message-circle': MessageCircle,
  'luggage': Luggage,
  'calendar': Calendar,
  'users': Users,
};

export const OnboardingChecklist: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { 
    tasks, 
    completedCount, 
    totalCount, 
    allCompleted, 
    progress,
    isLoading,
    markComplete 
  } = useOnboardingChecklist();

  if (allCompleted && !isLoading) {
    return null;
  }

  const handleTaskClick = (taskKey: string, route?: string) => {
    if (route) {
      navigate(route);
    }
    
    if (['check_packing_list', 'block_calendar'].includes(taskKey)) {
      markComplete(taskKey);
    }
  };

  const firstIncompleteIndex = tasks.findIndex(t => !t.isCompleted);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Getting Started</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <div className="w-20">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Scrollable Cards */}
      <div className="relative -mx-4 px-4">
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        >
          {tasks.map((task, index) => {
            const IconComponent = iconMap[task.icon] || Sparkles;
            const isNextUp = index === firstIncompleteIndex;

            return (
              <button
                key={task.key}
                onClick={() => handleTaskClick(task.key, task.route)}
                className={cn(
                  "flex-shrink-0 w-32 snap-start",
                  "flex flex-col items-center gap-3 p-4",
                  "bg-card/60 backdrop-blur-sm rounded-xl",
                  "border transition-all duration-200",
                  task.isCompleted 
                    ? "border-border/30 opacity-60" 
                    : "border-border/50 hover:border-primary/40 hover:-translate-y-0.5",
                  isNextUp && !task.isCompleted && "border-primary/30 bg-card/80"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  task.isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-primary/10 text-primary"
                )}>
                  {task.isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <IconComponent className="h-5 w-5" />
                  )}
                </div>

                {/* Title */}
                <span className={cn(
                  "text-xs font-medium text-center leading-tight line-clamp-2",
                  task.isCompleted ? "text-muted-foreground" : "text-foreground"
                )}>
                  {task.title}
                </span>

                {/* Status */}
                <span className={cn(
                  "text-[10px] font-medium",
                  task.isCompleted ? "text-primary" : "text-muted-foreground"
                )}>
                  {task.isCompleted ? "Done" : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';
import { Progress } from '@/components/ui/progress';
import { 
  User, ClipboardCheck, MessageCircle, Luggage, 
  Calendar, Users, Check, ChevronRight, Sparkles, ArrowRight
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

const gradientMap: Record<string, string> = {
  'user': 'from-primary/20 via-primary/10 to-transparent',
  'clipboard-check': 'from-accent/20 via-accent/10 to-transparent',
  'message-circle': 'from-secondary/40 via-secondary/20 to-transparent',
  'luggage': 'from-primary/15 via-accent/10 to-transparent',
  'calendar': 'from-accent/25 via-primary/10 to-transparent',
  'users': 'from-secondary/30 via-primary/15 to-transparent',
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

  // Don't show if all tasks are completed
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

  // Find the first incomplete task for highlighting
  const firstIncompleteIndex = tasks.findIndex(t => !t.isCompleted);

  return (
    <div className="reveal-section space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Getting Started</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <div className="w-24">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrollable container */}
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tasks.map((task, index) => {
            const IconComponent = iconMap[task.icon] || Sparkles;
            const isNextPriority = index === firstIncompleteIndex;
            const gradient = gradientMap[task.icon] || 'from-primary/20 to-transparent';

            return (
              <button
                key={task.key}
                onClick={() => handleTaskClick(task.key, task.route)}
                className={cn(
                  "flex-shrink-0 w-[140px] snap-start",
                  "relative overflow-hidden rounded-2xl p-4",
                  "bg-gradient-to-b border transition-all duration-300",
                  "flex flex-col items-center text-center gap-3",
                  gradient,
                  task.isCompleted 
                    ? "border-border/30 opacity-60" 
                    : "border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
                  isNextPriority && !task.isCompleted && "ring-2 ring-primary/30 animate-pulse"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "p-3 rounded-xl transition-all duration-300",
                  task.isCompleted 
                    ? "bg-muted/50 text-muted-foreground" 
                    : "bg-primary/10 text-primary shadow-sm"
                )}>
                  <IconComponent className="h-6 w-6" />
                </div>

                {/* Title */}
                <p className={cn(
                  "text-sm font-medium leading-tight line-clamp-2",
                  task.isCompleted 
                    ? "text-muted-foreground line-through" 
                    : "text-foreground"
                )}>
                  {task.title}
                </p>

                {/* Status indicator */}
                <div className={cn(
                  "absolute bottom-3 right-3",
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  task.isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary/50 text-muted-foreground"
                )}>
                  {task.isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Completed overlay */}
                {task.isCompleted && (
                  <div className="absolute inset-0 bg-background/30 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <p className="text-xs text-muted-foreground text-center px-4">
        💡 Swipe to explore • Complete these to unlock your full Forge experience
      </p>
    </div>
  );
};

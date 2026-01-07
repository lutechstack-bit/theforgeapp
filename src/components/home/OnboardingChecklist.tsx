import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  User, ClipboardCheck, MessageCircle, Luggage, 
  Calendar, Users, Check, ChevronRight, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  'user': <User className="h-4 w-4" />,
  'clipboard-check': <ClipboardCheck className="h-4 w-4" />,
  'message-circle': <MessageCircle className="h-4 w-4" />,
  'luggage': <Luggage className="h-4 w-4" />,
  'calendar': <Calendar className="h-4 w-4" />,
  'users': <Users className="h-4 w-4" />,
};

export const OnboardingChecklist: React.FC = () => {
  const navigate = useNavigate();
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
    // For tasks that need navigation, go there
    if (route) {
      navigate(route);
    }
    
    // For certain tasks, mark as complete when clicked
    if (['check_packing_list', 'block_calendar'].includes(taskKey)) {
      markComplete(taskKey);
    }
  };

  return (
    <Card className="glass-card overflow-hidden reveal-section">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Getting Started with Forge</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {totalCount} tasks completed
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Tasks List */}
      <div className="divide-y divide-border/30">
        {tasks.map((task) => (
          <button
            key={task.key}
            onClick={() => handleTaskClick(task.key, task.route)}
            className={cn(
              "w-full flex items-center gap-3 p-4 text-left transition-all duration-200",
              "hover:bg-secondary/30 active:bg-secondary/50",
              task.isCompleted && "opacity-60"
            )}
          >
            {/* Checkbox */}
            <div className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              task.isCompleted 
                ? "bg-primary border-primary text-primary-foreground" 
                : "border-border hover:border-primary/50"
            )}>
              {task.isCompleted && <Check className="h-3.5 w-3.5" />}
            </div>

            {/* Icon */}
            <div className={cn(
              "flex-shrink-0 p-2 rounded-lg transition-colors",
              task.isCompleted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
            )}>
              {iconMap[task.icon] || <Sparkles className="h-4 w-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                task.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {task.description}
              </p>
            </div>

            {/* Arrow */}
            {!task.isCompleted && task.route && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Footer tip */}
      <div className="p-3 bg-secondary/20 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          💡 Complete these tasks to get the most out of your Forge experience
        </p>
      </div>
    </Card>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Map, MessageCircle, BookOpen, ChevronRight } from 'lucide-react';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  path: string;
  description?: string;
}

const quickActions: QuickAction[] = [
  {
    icon: Map,
    label: 'View Roadmap',
    path: '/roadmap',
    description: 'Your journey timeline',
  },
  {
    icon: MessageCircle,
    label: 'Open Community',
    path: '/community',
    description: 'Join the community',
  },
  {
    icon: BookOpen,
    label: 'Watch Classes',
    path: '/learn',
    description: 'Forge fundamentals',
  },
];

interface QuickActionsRowProps {
  className?: string;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl',
                'bg-gray-900/5 hover:bg-gray-900/10 dark:bg-white/5 dark:hover:bg-white/10',
                'border border-gray-200/50 dark:border-white/10',
                'text-gray-700 dark:text-gray-200',
                'transition-all duration-200 hover:scale-[1.02]',
                'min-w-fit whitespace-nowrap group'
              )}
            >
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{action.label}</span>
                {action.description && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {action.description}
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

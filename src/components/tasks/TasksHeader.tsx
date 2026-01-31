import React from 'react';
import { ListTodo, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { StreakBadge } from '@/components/journey/StreakBadge';

export type TaskFilterType = 'all' | 'required' | 'optional' | 'completed';

interface TasksHeaderProps {
  completedCount: number;
  totalCount: number;
  activeFilter: TaskFilterType;
  onFilterChange: (filter: TaskFilterType) => void;
  counts: {
    all: number;
    required: number;
    optional: number;
    completed: number;
  };
}

const filters: { key: TaskFilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'required', label: 'Required' },
  { key: 'optional', label: 'Optional' },
  { key: 'completed', label: 'Done' },
];

const TasksHeader: React.FC<TasksHeaderProps> = ({
  completedCount,
  totalCount,
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ListTodo className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Your Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <StreakBadge />
      </div>

      {/* Progress Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-secondary" />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              "border",
              activeFilter === filter.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {filter.label}
            <span className="ml-1 opacity-70">
              ({counts[filter.key]})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TasksHeader;

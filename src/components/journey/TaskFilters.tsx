import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, ListFilter, Star } from 'lucide-react';

export type TaskFilterType = 'all' | 'required' | 'optional' | 'completed';

interface TaskFiltersProps {
  activeFilter: TaskFilterType;
  onFilterChange: (filter: TaskFilterType) => void;
  counts?: {
    all: number;
    required: number;
    optional: number;
    completed: number;
  };
  className?: string;
}

const filters: { key: TaskFilterType; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: ListFilter },
  { key: 'required', label: 'Required', icon: Star },
  { key: 'optional', label: 'Optional', icon: Circle },
  { key: 'completed', label: 'Done', icon: CheckCircle2 },
];

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1', className)}>
      {filters.map(({ key, label, icon: Icon }) => {
        const isActive = activeFilter === key;
        const count = counts?.[key];

        return (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
              isActive
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
            )}
          >
            <Icon className="w-3 h-3" />
            <span>{label}</span>
            {count !== undefined && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center',
                isActive ? 'bg-white/20 text-white' : 'bg-gray-400/30 text-gray-700'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

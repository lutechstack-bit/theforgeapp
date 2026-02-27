import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DatePill {
  id: string;
  date: Date | null;
  dayNumber: number;
  label: string;
  subLabel?: string;
  themeName?: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
}

interface DatePillSelectorProps {
  pills: DatePill[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

const DatePillSelector: React.FC<DatePillSelectorProps> = ({
  pills,
  selectedId,
  onSelect,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = selectedRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollLeft =
        element.offsetLeft - container.offsetLeft - containerRect.width / 2 + elementRect.width / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedId]);

  return (
    <div
      ref={scrollRef}
      className={cn('flex gap-2.5 overflow-x-auto scrollbar-hide py-1 px-1', className)}
    >
      {pills.map((pill) => {
        const isSelected = pill.id === selectedId;
        const isCurrent = pill.status === 'current';
        const isCompleted = pill.status === 'completed';

        return (
          <div key={pill.id} className="flex-shrink-0 flex flex-col items-center">
            <button
              ref={isSelected ? selectedRef : undefined}
              onClick={() => onSelect(pill.id)}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg w-[56px] h-[64px] transition-all duration-200 border',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                  : isCompleted
                    ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
                    : isCurrent
                      ? 'bg-primary/5 text-primary border-primary/25'
                      : 'bg-card/60 text-muted-foreground border-border/40 hover:bg-card hover:border-border/60'
              )}
            >
              <span className="text-lg font-bold leading-none">{pill.label}</span>
              {pill.subLabel && (
                <span
                  className={cn(
                    'text-[10px] mt-1.5 font-medium leading-none',
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {pill.subLabel}
                </span>
              )}
              {isCurrent && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </button>
            {pill.themeName && (
              <span
                className={cn(
                  'text-[9px] font-medium leading-none text-center max-w-[56px] truncate mt-1',
                  isSelected ? 'text-primary' : 'text-muted-foreground/60'
                )}
              >
                {pill.themeName}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DatePillSelector;

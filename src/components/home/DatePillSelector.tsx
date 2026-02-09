import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DatePill {
  id: string;
  date: Date | null;
  dayNumber: number;
  label: string; // e.g. "29", "Day 1"
  subLabel?: string; // e.g. "Wed"
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

  // Auto-scroll to selected pill
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = selectedRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const scrollLeft =
        element.offsetLeft -
        container.offsetLeft -
        containerRect.width / 2 +
        elementRect.width / 2;

      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedId]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1',
        className
      )}
    >
      {pills.map((pill) => {
        const isSelected = pill.id === selectedId;
        const isCurrent = pill.status === 'current';
        const isCompleted = pill.status === 'completed';

        return (
          <button
            key={pill.id}
            ref={isSelected ? selectedRef : undefined}
            onClick={() => onSelect(pill.id)}
            className={cn(
              'flex-shrink-0 flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[52px] transition-all duration-200',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-glow scale-105'
                : isCompleted
                ? 'bg-primary/15 text-primary border border-primary/20'
                : isCurrent
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'bg-secondary/50 text-muted-foreground border border-border/30 hover:bg-secondary hover:border-border/50'
            )}
          >
            <span className="text-base font-bold leading-none">{pill.label}</span>
            {pill.subLabel && (
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium',
                  isSelected
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
              >
                {pill.subLabel}
              </span>
            )}
            {isCurrent && !isSelected && (
              <span className="w-1 h-1 rounded-full bg-primary mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default DatePillSelector;

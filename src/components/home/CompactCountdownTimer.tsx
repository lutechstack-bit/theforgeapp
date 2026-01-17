import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CompactCountdownTimerProps {
  edition: {
    name: string;
    city: string;
    forge_start_date: string | null;
    forge_end_date: string | null;
    cohort_type: string;
  } | null;
}

export const CompactCountdownTimer: React.FC<CompactCountdownTimerProps> = ({ edition }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!edition?.forge_start_date) return;

    const targetDate = new Date(edition.forge_start_date);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
        setPrevTimeLeft(timeLeft);
        setTimeLeft(newTimeLeft);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [edition?.forge_start_date]);

  // Ultra compact time block
  const TimeBlock = ({ value, label, prevValue }: { value: number; label: string; prevValue: number }) => {
    const hasChanged = value !== prevValue;
    
    return (
      <div className="flex flex-col items-center">
        <div 
          className={cn(
            "relative w-9 h-10 sm:w-10 sm:h-11 rounded-md overflow-hidden",
            "bg-gradient-to-b from-primary to-accent",
            "shadow-md shadow-primary/25",
            "border border-primary/30"
          )}
        >
          {/* Top shine */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
          
          {/* Center divider line */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/25" />
          
          {/* Number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className={cn(
                "text-base sm:text-lg font-bold text-primary-foreground tabular-nums drop-shadow-md",
                "transition-transform duration-200",
                hasChanged && "scale-105"
              )}
            >
              {value.toString().padStart(2, '0')}
            </span>
          </div>
          
          {/* Bottom shadow */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent" />
        </div>
        <span className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wider mt-1 font-medium">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-lg glass-card reveal-section">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
      
      <div className="relative px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          {/* Left: Title with icon */}
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="p-1 sm:p-1.5 rounded-md bg-primary/20 shrink-0">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                {edition?.city ? `${edition.city}` : 'Forge'} starts in
              </p>
            </div>
          </div>

          {/* Center: Timer blocks */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <TimeBlock value={timeLeft.days} label="Days" prevValue={prevTimeLeft.days} />
            <span className="text-muted-foreground/50 text-sm font-light pb-3">:</span>
            <TimeBlock value={timeLeft.hours} label="Hrs" prevValue={prevTimeLeft.hours} />
            <span className="text-muted-foreground/50 text-sm font-light pb-3">:</span>
            <TimeBlock value={timeLeft.minutes} label="Min" prevValue={prevTimeLeft.minutes} />
            <span className="text-muted-foreground/50 text-sm font-light pb-3">:</span>
            <TimeBlock value={timeLeft.seconds} label="Sec" prevValue={prevTimeLeft.seconds} />
          </div>

        </div>
      </div>
    </div>
  );
};

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

  // Premium flip-clock time block
  const TimeBlock = ({ value, label, prevValue }: { value: number; label: string; prevValue: number }) => {
    const hasChanged = value !== prevValue;
    
    return (
      <div className="flex flex-col items-center">
        {/* Flip-clock block */}
        <div className={cn(
          "relative w-11 h-14 xs:w-12 xs:h-15 sm:w-14 sm:h-18 md:w-16 md:h-20 rounded-lg overflow-hidden",
          "bg-gradient-to-b from-forge-gold to-forge-orange",
          "border border-forge-yellow/40",
          "shadow-lg shadow-forge-gold/30"
        )}>
          {/* Top half shine */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
          
          {/* Center divider line */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/30 z-10" />
          
          {/* Number */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            hasChanged && "animate-tick"
          )}>
            <span className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-black text-black tabular-nums drop-shadow-sm">
              {value.toString().padStart(2, '0')}
            </span>
          </div>
          
          {/* Bottom shadow */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        
        {/* Label */}
        <span className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1.5 font-semibold">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50">
      {/* Split background container */}
      <div className="flex flex-col sm:flex-row">
        {/* Left: Dark section with message */}
        <div className="flex-shrink-0 bg-gradient-to-br from-card via-card to-muted/50 px-4 py-3 sm:py-4 flex items-center justify-center sm:justify-start gap-3">
          <div className="p-2 rounded-lg bg-forge-gold/20">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-forge-yellow" />
          </div>
          <p className="text-sm sm:text-base font-medium text-foreground">
            {edition?.city ? `${edition.city}` : 'Forge'} starts in
          </p>
        </div>
        
        {/* Right: Timer section */}
        <div className="flex-1 flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-br from-muted/30 to-card/50">
          <TimeBlock value={timeLeft.days} label="DAYS" prevValue={prevTimeLeft.days} />
          <span className="text-forge-gold/50 text-lg sm:text-xl font-light pb-5">:</span>
          <TimeBlock value={timeLeft.hours} label="HRS" prevValue={prevTimeLeft.hours} />
          <span className="text-forge-gold/50 text-lg sm:text-xl font-light pb-5">:</span>
          <TimeBlock value={timeLeft.minutes} label="MIN" prevValue={prevTimeLeft.minutes} />
          <span className="text-forge-gold/50 text-lg sm:text-xl font-light pb-5">:</span>
          <TimeBlock value={timeLeft.seconds} label="SEC" prevValue={prevTimeLeft.seconds} />
        </div>
      </div>
      
      {/* Diagonal accent line (visible on sm+) */}
      <div className="hidden sm:block absolute top-0 bottom-0 left-[35%] w-px bg-gradient-to-b from-transparent via-forge-gold/30 to-transparent transform -skew-x-12" />
    </div>
  );
};

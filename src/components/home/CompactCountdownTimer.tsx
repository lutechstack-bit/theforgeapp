import React, { useState, useEffect, useMemo } from 'react';

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

// Clean number display (no blocks)
const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums text-foreground">
      {value.toString().padStart(2, '0')}
    </span>
    <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground mt-0.5 sm:mt-1">
      {label}
    </span>
  </div>
);

export const CompactCountdownTimer: React.FC<CompactCountdownTimerProps> = ({ edition }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate progress percentage based on time remaining
  const progressPercent = useMemo(() => {
    if (!edition?.forge_start_date) return 0;
    
    const now = new Date().getTime();
    const end = new Date(edition.forge_start_date).getTime();
    
    // Use 90 days as reference duration
    const totalDuration = 90 * 24 * 60 * 60 * 1000;
    const remaining = end - now;
    const elapsed = totalDuration - remaining;
    
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  }, [edition?.forge_start_date, timeLeft.seconds]);

  useEffect(() => {
    if (!edition?.forge_start_date) return;

    const targetDate = new Date(edition.forge_start_date);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [edition?.forge_start_date]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50">
      {/* Main container with split layout */}
      <div className="flex flex-col sm:flex-row">
        {/* Left: Dark section with message */}
        <div className="flex-shrink-0 sm:w-32 md:w-36 bg-gradient-to-br from-background to-card 
                        flex flex-col justify-center px-4 py-3 sm:py-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
            See you in
          </span>
          {/* Gold underline accent */}
          <div className="w-10 sm:w-12 h-0.5 bg-gradient-to-r from-forge-gold to-forge-yellow mt-1.5 sm:mt-2 rounded-full" />
        </div>
        
        {/* Right: Light/glass section with numbers */}
        <div className="flex-1 flex items-center justify-center gap-4 sm:gap-5 md:gap-6 
                        py-3 sm:py-4 px-4
                        bg-gradient-to-br from-muted/40 to-card/60">
          <TimeUnit value={timeLeft.days} label="Days" />
          <span className="text-muted-foreground/40 text-xl sm:text-2xl font-light">:</span>
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <span className="text-muted-foreground/40 text-xl sm:text-2xl font-light">:</span>
          <TimeUnit value={timeLeft.minutes} label="Min" />
          <span className="text-muted-foreground/40 text-xl sm:text-2xl font-light">:</span>
          <TimeUnit value={timeLeft.seconds} label="Sec" />
        </div>
      </div>
      
      {/* Animated progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/30">
        <div 
          className="h-full progress-shimmer rounded-full"
          style={{ width: `${Math.max(progressPercent, 5)}%` }} 
        />
      </div>
    </div>
  );
};

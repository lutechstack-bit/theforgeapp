import React, { useState, useEffect, useMemo } from 'react';
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

// TimeUnit with glass effect based on progress position
const TimeUnit = ({ 
  value, 
  label,
  isInProgress 
}: { 
  value: number; 
  label: string;
  isInProgress?: boolean;
}) => (
  <div className="flex flex-col items-center relative z-10">
    <span className={cn(
      "text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums transition-colors duration-300",
      isInProgress 
        ? "text-black/90" // Dark text when gradient is behind
        : "text-foreground" // Light text on dark background
    )}>
      {value.toString().padStart(2, '0')}
    </span>
    <span className={cn(
      "text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest mt-0.5 transition-colors duration-300",
      isInProgress ? "text-black/70" : "text-muted-foreground"
    )}>
      {label}
    </span>
  </div>
);

// Separator with glass effect
const Separator = ({ isInProgress }: { isInProgress?: boolean }) => (
  <span className={cn(
    "text-xl sm:text-2xl font-light transition-colors duration-300",
    isInProgress ? "text-black/40" : "text-muted-foreground/40"
  )}>:</span>
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

  // Normalized position (0 to 1) for determining which elements are "in progress"
  const progressPosition = useMemo(() => {
    return progressPercent / 100;
  }, [progressPercent]);

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
    <div className="relative overflow-hidden rounded-xl border border-border/30">
      {/* Sweeping gradient background - the "running" progress effect */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none countdown-wave"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            transparent ${Math.max(0, progressPercent - 15)}%,
            hsl(var(--forge-gold) / 0.6) ${progressPercent - 5}%,
            hsl(var(--forge-yellow) / 0.9) ${progressPercent}%,
            hsl(var(--forge-orange) / 0.7) ${progressPercent + 8}%,
            hsl(var(--forge-gold) / 0.4) ${progressPercent + 15}%,
            transparent ${progressPercent + 25}%,
            transparent 100%
          )`,
        }}
      />
      
      {/* Main container with split layout */}
      <div className="relative z-[2] flex flex-col sm:flex-row">
        {/* Left: Message section with city */}
        <div className="flex-shrink-0 sm:w-32 md:w-36 bg-gradient-to-br from-background to-card/80 
                        flex flex-col justify-center px-4 py-3 sm:py-4 border-b sm:border-b-0 sm:border-r border-border/20">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
            See you in
          </span>
          <span className="text-base sm:text-lg md:text-xl font-bold text-foreground mt-0.5">
            {edition?.city || 'The Forge'}
          </span>
        </div>
        
        {/* Right: Timer section with glass effect on numbers */}
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-4 md:gap-5 
                        py-3 sm:py-4 px-4
                        bg-gradient-to-br from-card/40 to-muted/20">
          <TimeUnit 
            value={timeLeft.days} 
            label="Days" 
            isInProgress={progressPosition > 0.20 && progressPosition < 0.40}
          />
          <Separator isInProgress={progressPosition > 0.35 && progressPosition < 0.45} />
          <TimeUnit 
            value={timeLeft.hours} 
            label="Hours" 
            isInProgress={progressPosition > 0.35 && progressPosition < 0.55}
          />
          <Separator isInProgress={progressPosition > 0.50 && progressPosition < 0.60} />
          <TimeUnit 
            value={timeLeft.minutes} 
            label="Min" 
            isInProgress={progressPosition > 0.50 && progressPosition < 0.70}
          />
          <Separator isInProgress={progressPosition > 0.65 && progressPosition < 0.75} />
          <TimeUnit 
            value={timeLeft.seconds} 
            label="Sec" 
            isInProgress={progressPosition > 0.65 && progressPosition < 0.85}
          />
        </div>
      </div>
    </div>
  );
};

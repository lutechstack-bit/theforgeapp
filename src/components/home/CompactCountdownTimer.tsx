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

// TimeUnit with color inversion based on whether progress has passed
const TimeUnit = ({ 
  value, 
  label,
  isPassed 
}: { 
  value: number; 
  label: string;
  isPassed?: boolean;
}) => (
  <div className="flex flex-col items-center relative z-10">
    <span className={cn(
      "text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums transition-colors duration-300",
      isPassed 
        ? "text-black" // Dark text on gold background
        : "text-foreground" // Light text on dark background
    )}>
      {value.toString().padStart(2, '0')}
    </span>
    <span className={cn(
      "text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest mt-0.5 transition-colors duration-300",
      isPassed ? "text-black/70" : "text-muted-foreground"
    )}>
      {label}
    </span>
  </div>
);

// Separator with color inversion
const Separator = ({ isPassed }: { isPassed?: boolean }) => (
  <span className={cn(
    "text-xl sm:text-2xl font-light transition-colors duration-300",
    isPassed ? "text-black/40" : "text-muted-foreground/40"
  )}>:</span>
);

export const CompactCountdownTimer: React.FC<CompactCountdownTimerProps> = ({ edition }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate progress based on days remaining (30-day visual scale)
  // This ensures smooth color transitions that align with element positions
  const progressPercent = useMemo(() => {
    if (!edition?.forge_start_date) return 0;
    
    const now = new Date().getTime();
    const end = new Date(edition.forge_start_date).getTime();
    const remaining = end - now;
    
    if (remaining <= 0) return 100; // Event has started
    
    // Calculate days remaining
    const daysRemaining = remaining / (1000 * 60 * 60 * 24);
    
    // Use 30-day scale for meaningful visual progress
    // 30+ days = 0%, 0 days = 100%
    const maxDays = 30;
    const effectiveDays = Math.min(daysRemaining, maxDays);
    const progress = ((maxDays - effectiveDays) / maxDays) * 100;
    
    return Math.max(0, Math.min(100, progress));
  }, [edition?.forge_start_date, timeLeft.days]);

  // Calibrated position thresholds that match actual visual layout
  // These values are tuned so text color changes when gold fill reaches each element
  const positions = {
    city: 15,      // City section ends at ~15%
    days: 35,      // Days number center at ~35%
    sep1: 42,      // First separator
    hours: 50,     // Hours number center at ~50%
    sep2: 58,      // Second separator
    minutes: 68,   // Minutes number center at ~68%
    sep3: 78,      // Third separator
    seconds: 88,   // Seconds number center at ~88%
  };

  // Text turns black when progress passes its position
  const cityPassed = progressPercent >= positions.city;
  const daysPassed = progressPercent >= positions.days;
  const hoursPassed = progressPercent >= positions.hours;
  const minutesPassed = progressPercent >= positions.minutes;
  const secondsPassed = progressPercent >= positions.seconds;

  // Separator thresholds
  const sep1Passed = progressPercent >= positions.sep1;
  const sep2Passed = progressPercent >= positions.sep2;
  const sep3Passed = progressPercent >= positions.sep3;

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
    <div className="relative overflow-hidden rounded-xl border-2 border-forge-gold/60 
                shadow-[0_0_15px_rgba(255,188,59,0.4),0_0_30px_rgba(255,188,59,0.3),0_0_45px_rgba(211,143,12,0.2),inset_0_0_15px_rgba(255,188,59,0.1)]">
      {/* Solid color progress fill */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none transition-all duration-500"
        style={{
          background: `linear-gradient(
            90deg,
            hsl(var(--forge-gold)) 0%,
            hsl(var(--forge-gold)) ${progressPercent}%,
            transparent ${progressPercent}%,
            transparent 100%
          )`,
        }}
      />
      
      {/* Main container with split layout */}
      <div className="relative z-[2] flex flex-col sm:flex-row">
        {/* Left: Message section with city */}
        <div className={cn(
          "flex-shrink-0 sm:w-32 md:w-36 flex flex-col justify-center px-4 py-3 sm:py-4 border-b sm:border-b-0 sm:border-r border-border/20 transition-colors duration-300",
          cityPassed ? "border-black/10" : "border-border/20"
        )}>
          <span className={cn(
            "text-[10px] sm:text-xs uppercase tracking-widest transition-colors duration-300",
            cityPassed ? "text-black/60" : "text-muted-foreground"
          )}>
            See you in
          </span>
          <span className={cn(
            "text-base sm:text-lg md:text-xl font-bold mt-0.5 transition-colors duration-300",
            cityPassed ? "text-black" : "text-foreground"
          )}>
            {edition?.city || 'The Forge'}
          </span>
        </div>
        
        {/* Right: Timer section */}
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-4 md:gap-5 
                        py-3 sm:py-4 px-4">
          <TimeUnit 
            value={timeLeft.days} 
            label="Days" 
            isPassed={daysPassed}
          />
          <Separator isPassed={sep1Passed} />
          <TimeUnit 
            value={timeLeft.hours} 
            label="Hours" 
            isPassed={hoursPassed}
          />
          <Separator isPassed={sep2Passed} />
          <TimeUnit 
            value={timeLeft.minutes} 
            label="Min" 
            isPassed={minutesPassed}
          />
          <Separator isPassed={sep3Passed} />
          <TimeUnit 
            value={timeLeft.seconds} 
            label="Sec" 
            isPassed={secondsPassed}
          />
        </div>
      </div>
    </div>
  );
};

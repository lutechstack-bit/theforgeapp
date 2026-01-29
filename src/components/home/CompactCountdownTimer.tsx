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

// Simple TimeUnit - no split logic, just renders value + label
const TimeUnit = ({ 
  value, 
  label,
  textClass,
  labelClass
}: { 
  value: number; 
  label: string;
  textClass: string;
  labelClass: string;
}) => (
  <div className="flex flex-col items-center">
    <span className={cn("text-lg sm:text-2xl md:text-3xl font-bold tabular-nums", textClass)}>
      {value.toString().padStart(2, '0')}
    </span>
    <span className={cn("text-[7px] sm:text-[9px] md:text-xs uppercase tracking-widest mt-0.5", labelClass)}>
      {label}
    </span>
  </div>
);

// Separator - simple colon
const Separator = ({ textClass }: { textClass: string }) => (
  <span className={cn("text-sm sm:text-lg font-light opacity-50", textClass)}>:</span>
);

// CountdownContent - renders the full layout with a specific tone
// Used twice: once for filled (white text), once for remaining (dark text)
const CountdownContent = ({ 
  timeLeft, 
  city,
  tone,
  showBorder
}: { 
  timeLeft: TimeLeft;
  city: string;
  tone: 'fill' | 'base';
  showBorder: boolean;
}) => {
  const textClass = 'text-black';
  const labelClass = 'text-black/70';
  const borderClass = showBorder ? 'border-r border-white/10' : '';

  return (
    <div className="flex flex-row w-full items-center">
      {/* Left: City section - compact inline */}
      <div className={cn(
        "flex-shrink-0 w-16 sm:w-28 md:w-32 flex flex-col justify-center px-2 sm:px-3 py-2 sm:py-3",
        showBorder ? "border-r border-white/10" : ""
      )}>
        <span className={cn("text-[7px] sm:text-[9px] uppercase tracking-widest hidden sm:block", labelClass)}>
          See you in
        </span>
        <span className={cn("text-xs sm:text-base md:text-lg font-bold", textClass)}>
          {city || 'The Forge'}
        </span>
      </div>
      
      {/* Right: Timer section - tighter gaps */}
      <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 py-2 sm:py-3 px-2 sm:px-3">
        <TimeUnit value={timeLeft.days} label="Days" textClass={textClass} labelClass={labelClass} />
        <Separator textClass={textClass} />
        <TimeUnit value={timeLeft.hours} label="Hrs" textClass={textClass} labelClass={labelClass} />
        <Separator textClass={textClass} />
        <TimeUnit value={timeLeft.minutes} label="Min" textClass={textClass} labelClass={labelClass} />
        <Separator textClass={textClass} />
        <TimeUnit value={timeLeft.seconds} label="Sec" textClass={textClass} labelClass={labelClass} />
      </div>
    </div>
  );
};

export const CompactCountdownTimer: React.FC<CompactCountdownTimerProps> = ({ edition }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate progress based on days remaining (30-day visual scale)
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
    <div 
      className="relative overflow-hidden rounded-xl border-2 border-forge-gold/60 
                 shadow-[0_0_15px_rgba(255,188,59,0.4),0_0_30px_rgba(255,188,59,0.3),0_0_45px_rgba(211,143,12,0.2),inset_0_0_15px_rgba(255,188,59,0.1)]"
      style={{ '--p': `${progressPercent}%` } as React.CSSProperties}
    >
      {/* Base background (cream/light - visible on remaining side) */}
      <div className="absolute inset-0 bg-forge-cream" />
      
      {/* Filled background (gold gradient - visible on filled side) */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-forge-orange via-forge-gold to-forge-yellow transition-all duration-500"
        style={{ width: 'var(--p)' }}
      />
      
      {/* Progress edge line (crisp vertical divider) */}
      <div 
        className="absolute top-0 bottom-0 w-px bg-black/20 z-10 transition-all duration-500"
        style={{ left: 'var(--p)' }}
      />
      
      {/* Layer 1: Dark text (remaining side) - clipped to show only right portion */}
      <div 
        className="relative z-[2]"
        style={{ clipPath: 'inset(0 0 0 var(--p))' }}
      >
        <CountdownContent 
          timeLeft={timeLeft} 
          city={edition?.city || ''} 
          tone="base"
          showBorder={true}
        />
      </div>
      
      {/* Layer 2: White text (filled side) - clipped to show only left portion, overlaid on top */}
      <div 
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{ clipPath: 'inset(0 calc(100% - var(--p)) 0 0)' }}
      >
        <CountdownContent 
          timeLeft={timeLeft} 
          city={edition?.city || ''} 
          tone="fill"
          showBorder={false}
        />
      </div>
    </div>
  );
};

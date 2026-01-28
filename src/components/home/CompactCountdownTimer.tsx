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

// SplitText component - renders text twice with opposing clip masks for pixel-perfect split coloring
const SplitText = ({ 
  children, 
  progressPercent,
  className,
  lightOpacity = 1,
  darkOpacity = 1
}: { 
  children: React.ReactNode; 
  progressPercent: number;
  className?: string;
  lightOpacity?: number;
  darkOpacity?: number;
}) => (
  <div className={cn("relative", className)}>
    {/* Dark text layer - visible on light/gold portion (right side) */}
    <span 
      className="text-black"
      style={{ 
        clipPath: `inset(0 0 0 ${progressPercent}%)`,
        opacity: darkOpacity
      }}
    >
      {children}
    </span>
    {/* Light text layer - visible on dark portion (left side) */}
    <span 
      className="absolute inset-0 text-white"
      style={{ 
        clipPath: `inset(0 ${100 - progressPercent}% 0 0)`,
        opacity: lightOpacity
      }}
    >
      {children}
    </span>
  </div>
);

// TimeUnit with split coloring
const TimeUnit = ({ 
  value, 
  label, 
  progressPercent 
}: { 
  value: number; 
  label: string;
  progressPercent: number;
}) => (
  <div className="flex flex-col items-center relative z-10">
    <SplitText 
      progressPercent={progressPercent} 
      className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums"
    >
      {value.toString().padStart(2, '0')}
    </SplitText>
    <SplitText 
      progressPercent={progressPercent} 
      className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest mt-0.5"
      lightOpacity={0.8}
      darkOpacity={0.8}
    >
      {label}
    </SplitText>
  </div>
);

// Separator with split coloring
const Separator = ({ progressPercent }: { progressPercent: number }) => (
  <SplitText 
    progressPercent={progressPercent} 
    className="text-xl sm:text-2xl font-light"
    lightOpacity={0.5}
    darkOpacity={0.5}
  >
    :
  </SplitText>
);

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
        <div className="flex-shrink-0 sm:w-32 md:w-36 flex flex-col justify-center px-4 py-3 sm:py-4 border-b sm:border-b-0 sm:border-r border-white/10">
          <SplitText 
            progressPercent={progressPercent} 
            className="text-[10px] sm:text-xs uppercase tracking-widest"
            lightOpacity={0.6}
            darkOpacity={0.6}
          >
            See you in
          </SplitText>
          <SplitText 
            progressPercent={progressPercent} 
            className="text-base sm:text-lg md:text-xl font-bold mt-0.5"
          >
            {edition?.city || 'The Forge'}
          </SplitText>
        </div>
        
        {/* Right: Timer section */}
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-4 md:gap-5 
                        py-3 sm:py-4 px-4">
          <TimeUnit value={timeLeft.days} label="Days" progressPercent={progressPercent} />
          <Separator progressPercent={progressPercent} />
          <TimeUnit value={timeLeft.hours} label="Hours" progressPercent={progressPercent} />
          <Separator progressPercent={progressPercent} />
          <TimeUnit value={timeLeft.minutes} label="Min" progressPercent={progressPercent} />
          <Separator progressPercent={progressPercent} />
          <TimeUnit value={timeLeft.seconds} label="Sec" progressPercent={progressPercent} />
        </div>
      </div>
    </div>
  );
};

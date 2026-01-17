import React, { useState, useEffect } from 'react';
import { Flame, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface EditionInfo {
  editionNumber: string;
  cohortName: string;
  city: string;
  dateRange: string;
}

interface EnhancedCountdownProps {
  edition: {
    name: string;
    city: string;
    forge_start_date: string | null;
    forge_end_date: string | null;
    cohort_type: string;
  } | null;
}

const parseEditionInfo = (edition: EnhancedCountdownProps['edition']): EditionInfo | null => {
  if (!edition) return null;

  // Parse edition name like "Forge Filmmaking - Goa Feb 2025" or "Forge 8 - Hyderabad"
  const name = edition.name || '';
  
  // Try to extract edition number from name
  const editionMatch = name.match(/(?:Edition\s*)?(\d+)/i) || name.match(/Forge\s*(\d+)/i);
  const editionNumber = editionMatch ? `Edition ${editionMatch[1]}` : '';

  // Map cohort type to display name
  const cohortNames: Record<string, string> = {
    'FORGE': 'Forge Filmmaking',
    'FORGE_WRITING': 'Forge Writing',
    'FORGE_CREATORS': 'Forge Creators',
  };
  const cohortName = cohortNames[edition.cohort_type] || 'Forge';

  // Format date range
  let dateRange = '';
  if (edition.forge_start_date) {
    const startDate = new Date(edition.forge_start_date);
    if (edition.forge_end_date) {
      const endDate = new Date(edition.forge_end_date);
      if (startDate.getMonth() === endDate.getMonth()) {
        dateRange = `${format(startDate, 'MMM d')}-${format(endDate, 'd, yyyy')}`;
      } else {
        dateRange = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      }
    } else {
      dateRange = format(startDate, 'MMM d, yyyy');
    }
  }

  return {
    editionNumber,
    cohortName,
    city: edition.city || '',
    dateRange,
  };
};

export const EnhancedCountdown: React.FC<EnhancedCountdownProps> = ({ edition }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const editionInfo = parseEditionInfo(edition);

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

  const TimeBlock = ({ value, label, prevValue }: { value: number; label: string; prevValue: number }) => {
    const hasChanged = value !== prevValue;
    
    return (
      <div className="flex flex-col items-center">
        <div 
          className={cn(
            "relative w-10 h-11 sm:w-12 sm:h-14 rounded-lg overflow-hidden",
            "bg-gradient-to-br from-foreground/10 to-foreground/5",
            "border border-foreground/20 backdrop-blur-sm",
            "shadow-md shadow-primary/10"
          )}
        >
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/15 via-transparent to-transparent" />
          
          {/* Number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className={cn(
                "text-lg sm:text-xl font-bold text-foreground tabular-nums",
                "transition-all duration-300",
                hasChanged && "animate-pulse"
              )}
            >
              {value.toString().padStart(2, '0')}
            </span>
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        </div>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mt-1 font-medium">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl reveal-section">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
      
      {/* Animated particles/glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />

      <div className="relative p-4 sm:p-5">
        {/* Compact Layout - All in one row on larger screens */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Edition Info */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="p-2 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/20 shrink-0">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {editionInfo?.cohortName || 'Forge'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {editionInfo?.editionNumber && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                    {editionInfo.editionNumber}
                  </span>
                )}
                {editionInfo?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{editionInfo.city}</span>
                  </div>
                )}
                {editionInfo?.dateRange && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{editionInfo.dateRange}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center: Countdown Timer - Compact */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground mr-2 hidden sm:block">Starts in</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TimeBlock value={timeLeft.days} label="Days" prevValue={prevTimeLeft.days} />
              <span className="text-foreground/30 text-lg font-light">:</span>
              <TimeBlock value={timeLeft.hours} label="Hrs" prevValue={prevTimeLeft.hours} />
              <span className="text-foreground/30 text-lg font-light">:</span>
              <TimeBlock value={timeLeft.minutes} label="Min" prevValue={prevTimeLeft.minutes} />
              <span className="text-foreground/30 text-lg font-light">:</span>
              <TimeBlock value={timeLeft.seconds} label="Sec" prevValue={prevTimeLeft.seconds} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

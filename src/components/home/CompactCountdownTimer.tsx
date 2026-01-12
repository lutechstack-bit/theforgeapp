import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const PAYMENT_LINK = 'https://razorpay.com/payment-link/your-link-here';

export const CompactCountdownTimer: React.FC<CompactCountdownTimerProps> = ({ edition }) => {
  const { isBalancePaid } = useAuth();
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

  const handlePayClick = () => {
    window.open(PAYMENT_LINK, '_blank');
  };

  // Compact time block with flip animation feel
  const TimeBlock = ({ value, label, prevValue }: { value: number; label: string; prevValue: number }) => {
    const hasChanged = value !== prevValue;
    
    return (
      <div className="flex flex-col items-center">
        <div 
          className={cn(
            "relative w-11 h-12 sm:w-12 sm:h-14 rounded-lg overflow-hidden",
            "bg-gradient-to-b from-primary to-accent",
            "shadow-lg shadow-primary/30",
            "border border-primary/30"
          )}
        >
          {/* Top shine */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
          
          {/* Center divider line */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/30" />
          
          {/* Number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className={cn(
                "text-xl sm:text-2xl font-bold text-primary-foreground tabular-nums drop-shadow-lg",
                "transition-transform duration-200",
                hasChanged && "scale-110"
              )}
            >
              {value.toString().padStart(2, '0')}
            </span>
          </div>
          
          {/* Bottom shadow */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1.5 font-medium">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-xl glass-card reveal-section">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
      
      <div className="relative px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Left: Title with icon */}
          <div className="flex items-center gap-2 sm:gap-3 animate-fade-in">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20 shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {edition?.city ? `${edition.city} Edition` : 'Forge'} starts in
              </p>
            </div>
          </div>

          {/* Center: Timer blocks */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <TimeBlock value={timeLeft.days} label="Days" prevValue={prevTimeLeft.days} />
            <span className="text-muted-foreground/50 text-lg font-light pb-4">:</span>
            <TimeBlock value={timeLeft.hours} label="Hrs" prevValue={prevTimeLeft.hours} />
            <span className="text-muted-foreground/50 text-lg font-light pb-4">:</span>
            <TimeBlock value={timeLeft.minutes} label="Min" prevValue={prevTimeLeft.minutes} />
            <span className="text-muted-foreground/50 text-lg font-light pb-4">:</span>
            <TimeBlock value={timeLeft.seconds} label="Sec" prevValue={prevTimeLeft.seconds} />
          </div>

          {/* Right: Payment CTA */}
          {!isBalancePaid && (
            <Button
              onClick={handlePayClick}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-1.5 shrink-0 shadow-lg shadow-amber-500/20 rounded-lg"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Pay Balance</span>
              <span className="sm:hidden">Pay</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

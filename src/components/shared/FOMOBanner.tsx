import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, X, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PAYMENT_LINK = 'https://razorpay.com/payment-link/your-link-here';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

export const FOMOBanner: React.FC = () => {
  const { isBalancePaid, edition } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  // Generate a consistent "users unlocked" count per session
  const usersUnlocked = useMemo(() => Math.floor(Math.random() * 10) + 3, []);

  useEffect(() => {
    // Check if dismissed this session
    const dismissed = sessionStorage.getItem('fomo-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (!edition?.forge_start_date) return;

    const calculateTimeLeft = () => {
      const forgeStart = new Date(edition.forge_start_date!);
      const now = new Date();
      const difference = forgeStart.getTime() - now.getTime();

      if (difference <= 0) return null;

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);

    return () => clearInterval(timer);
  }, [edition?.forge_start_date]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('fomo-banner-dismissed', 'true');
  };

  const handlePayClick = () => {
    window.open(PAYMENT_LINK, '_blank');
  };

  // Don't show if user has paid balance or banner is dismissed
  if (isBalancePaid || isDismissed) return null;

  return (
    <div className="relative mx-0 sm:mx-4 mb-4 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
      {/* Animated pulse effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 animate-shimmer" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {/* Social proof */}
          <div className="flex items-center gap-2 text-amber-200">
            <Users className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">
              {usersUnlocked} users unlocked full access today
            </span>
          </div>

          {/* Countdown */}
          {timeLeft && (
            <div className="flex items-center gap-2 text-amber-100/80">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="text-sm">
                Forge starts in {timeLeft.days}d {timeLeft.hours}h
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={handlePayClick}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-1.5 whitespace-nowrap flex-1 sm:flex-initial"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Pay Balance
          </Button>
          
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-200/60 hover:text-amber-200 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

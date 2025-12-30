import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const cohortNames: Record<string, string> = {
  'FORGE': 'Forge Filmmaking',
  'FORGE_WRITING': 'Forge Writing',
  'FORGE_CREATORS': 'Forge Creators',
};

const cohortMessages: Record<string, string> = {
  'FORGE': 'Your filmmaking journey begins in',
  'FORGE_WRITING': 'Your writing adventure starts in',
  'FORGE_CREATORS': 'Your creator journey kicks off in',
};

export const CountdownBanner: React.FC = () => {
  const { profile } = useAuth();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Fetch edition data for the user
  const { data: edition } = useQuery({
    queryKey: ['user-edition', profile?.edition_id],
    queryFn: async () => {
      if (!profile?.edition_id) return null;
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .eq('id', profile.edition_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.edition_id,
  });

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
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [edition?.forge_start_date]);

  if (!edition?.forge_start_date) return null;

  const cohortType = edition.cohort_type || 'FORGE';
  const cohortName = cohortNames[cohortType] || 'The Forge';
  const cohortMessage = cohortMessages[cohortType] || 'Your journey begins in';

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex items-center gap-1.5">
      <div className="glass-card px-3 py-2 rounded-lg min-w-[48px] text-center border border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.15)]">
        <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-card to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
      </div>
      
      {/* Border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative container flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 py-3 px-4">
        {/* Cohort badge + message */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 glass-card px-3 py-1.5 rounded-full border border-primary/30">
            <Flame className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{cohortName}</span>
          </div>
          <span className="text-sm sm:text-base text-foreground font-medium">
            {cohortMessage}
          </span>
        </div>

        {/* Countdown timer */}
        <div className="flex items-center gap-2 sm:gap-3">
          <TimeBlock value={timeLeft.days} label="Days" />
          <span className="text-primary text-xl font-bold hidden sm:block">:</span>
          <TimeBlock value={timeLeft.hours} label="Hrs" />
          <span className="text-primary text-xl font-bold hidden sm:block">:</span>
          <TimeBlock value={timeLeft.minutes} label="Min" />
          <span className="text-primary text-xl font-bold hidden sm:block">:</span>
          <TimeBlock value={timeLeft.seconds} label="Sec" />
        </div>

        {/* FOMO indicator */}
        <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs">Limited spots remaining</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flame } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const cohortNames: Record<string, string> = {
  'FORGE': 'FORGE FILMMAKING',
  'FORGE_WRITING': 'FORGE WRITING',
  'FORGE_CREATORS': 'FORGE CREATORS',
};

const cohortMessages: Record<string, string> = {
  'FORGE': 'Your filmmaking journey begins in',
  'FORGE_WRITING': 'Your writing adventure starts in',
  'FORGE_CREATORS': 'Your creator journey kicks off in',
};

export const CountdownBanner: React.FC = () => {
  const { profile } = useAuth();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [edition?.forge_start_date]);

  if (!edition?.forge_start_date) return null;

  const cohortType = edition.cohort_type || 'FORGE';
  const cohortName = cohortNames[cohortType] || 'THE FORGE';
  const cohortMessage = cohortMessages[cohortType] || 'Your journey begins in';

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex items-center gap-1">
      <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums min-w-[40px] text-center">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-card/95 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-center gap-4 sm:gap-8 py-3 px-4">
        {/* Cohort badge */}
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary tracking-widest">{cohortName}</span>
        </div>

        {/* Message */}
        <span className="hidden sm:block text-sm text-foreground">{cohortMessage}</span>

        {/* Countdown */}
        <div className="flex items-center gap-2 sm:gap-4">
          <TimeBlock value={timeLeft.days} label="DAYS" />
          <span className="text-muted-foreground">:</span>
          <TimeBlock value={timeLeft.hours} label="HRS" />
          <span className="text-muted-foreground">:</span>
          <TimeBlock value={timeLeft.minutes} label="MIN" />
          <span className="text-muted-foreground">:</span>
          <TimeBlock value={timeLeft.seconds} label="SEC" />
        </div>
      </div>
    </div>
  );
};

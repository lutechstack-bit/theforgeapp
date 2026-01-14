import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Map, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProgressCardProps {
  number: string;
  title: string;
  subtitle: string;
  progress: string;
  icon: React.ReactNode;
  variant: 'dark' | 'gold' | 'accent';
  onClick: () => void;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  number,
  title,
  subtitle,
  progress,
  icon,
  variant,
  onClick,
}) => {
  const variantStyles = {
    dark: 'bg-gradient-to-br from-card to-background border-border',
    gold: 'bg-gradient-to-br from-accent to-forge-orange border-accent/50',
    accent: 'bg-gradient-to-br from-primary to-accent border-primary/50',
  };

  const textStyles = {
    dark: 'text-foreground',
    gold: 'text-black',
    accent: 'text-black',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] p-3 sm:p-4 rounded-xl border",
        "transition-all duration-300 hover:scale-[1.02]",
        "hover:shadow-[0_0_25px_hsl(41_100%_62%/0.3),0_0_50px_hsl(39_90%_44%/0.2)]",
        "hover:border-primary/50",
        "text-left group",
        variantStyles[variant]
      )}
    >
      {/* Number badge */}
      <div className={cn(
        "absolute -top-2 -left-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center",
        "text-[10px] sm:text-xs font-bold shadow-lg",
        variant === 'accent' ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
      )}>
        {number}
      </div>

      {/* Icon */}
      <div className={cn(
        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3",
        variant === 'dark' ? 'bg-primary/20' : 'bg-black/10'
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: cn('w-4 h-4 sm:w-5 sm:h-5', variant !== 'dark' && 'text-black') })}
      </div>

      {/* Content */}
      <h4 className={cn("text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 line-clamp-1", textStyles[variant])}>
        {title}
      </h4>
      <p className={cn(
        "text-[10px] sm:text-xs mb-1.5 sm:mb-2 line-clamp-1",
        variant === 'dark' ? 'text-muted-foreground' : 'text-black/70'
      )}>
        {subtitle}
      </p>

      {/* Progress indicator */}
      <div className={cn(
        "text-[10px] sm:text-xs font-medium flex items-center gap-1",
        variant === 'dark' ? 'text-primary' : 'text-black/90'
      )}>
        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        {progress}
      </div>

      {/* Hover arrow */}
      <ArrowRight className={cn(
        "absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity",
        textStyles[variant]
      )} />
    </button>
  );
};

export const ProgressHeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  // Get first name for greeting
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Creator';

  // Fetch edition data for days countdown
  const { data: edition } = useQuery({
    queryKey: ['user-edition-progress', profile?.edition_id],
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

  // Fetch prep checklist progress
  const { data: prepProgress } = useQuery({
    queryKey: ['prep-progress-hero', profile?.edition_id],
    queryFn: async () => {
      if (!profile?.edition_id || !user?.id) return { completed: 0, total: 0 };
      
      const [itemsResult, progressResult] = await Promise.all([
        supabase
          .from('prep_checklist_items')
          .select('id')
          .eq('edition_id', profile.edition_id),
        supabase
          .from('user_prep_progress')
          .select('id')
          .eq('user_id', user.id),
      ]);
      
      return {
        completed: progressResult.data?.length || 0,
        total: itemsResult.data?.length || 0,
      };
    },
    enabled: !!profile?.edition_id && !!user?.id,
  });

  // Calculate days until Forge
  const daysUntilForge = React.useMemo(() => {
    if (!edition?.forge_start_date) return null;
    const start = new Date(edition.forge_start_date);
    const now = new Date();
    const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [edition?.forge_start_date]);

  // Progress message
  const progressMessage = React.useMemo(() => {
    if (daysUntilForge !== null && daysUntilForge > 0) {
      return `Your Forge journey begins in ${daysUntilForge} days!`;
    }
    if (profile?.ky_form_completed) {
      return "You're all set for Forge!";
    }
    return "Complete your onboarding to get started.";
  }, [daysUntilForge, profile?.ky_form_completed]);

  const kyfStatus = profile?.ky_form_completed ? '100% done' : 'Pending';
  const roadmapStatus = daysUntilForge !== null ? `${daysUntilForge} days` : 'Explore now';
  const prepStatus = prepProgress?.total 
    ? `${prepProgress.completed}/${prepProgress.total} items`
    : '0 items';

  return (
    <div className="relative rounded-2xl reveal-section" style={{ animationDelay: '0.05s' }}>
      {/* Background gradient - pure black to dark */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-background rounded-2xl border border-border" />
      
      {/* Subtle gold glow */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent rounded-2xl" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-accent/5 to-transparent rounded-2xl" />

      <div className="relative p-4 sm:p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
          {/* Left side: Greeting */}
          <div className="flex-shrink-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1.5 sm:mb-2">
              Hi, {firstName}! 👋
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-3 sm:mb-4 max-w-sm">
              {progressMessage}
            </p>
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10 gap-1 -ml-3"
            >
              See All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right side: Progress cards - with proper overflow spacing for badges */}
          <div className="flex gap-2.5 sm:gap-4 overflow-x-auto pt-3 pb-3 pl-3 -mx-4 pr-4 sm:-mx-5 sm:pr-5 md:mx-0 md:px-0 md:pl-3 scrollbar-hide">
            <ProgressCard
              number="01"
              title="KYF Form"
              subtitle="Complete your profile"
              progress={kyfStatus}
              icon={<FileText className="w-5 h-5 text-primary" />}
              variant="dark"
              onClick={() => navigate('/kyf')}
            />
            <ProgressCard
              number="02"
              title="Roadmap"
              subtitle="Explore your journey"
              progress={roadmapStatus}
              icon={<Map className="w-5 h-5 text-foreground" />}
              variant="gold"
              onClick={() => navigate('/roadmap')}
            />
            <ProgressCard
              number="03"
              title="Prep Checklist"
              subtitle="Get ready for Forge"
              progress={prepStatus}
              icon={<CheckCircle className="w-5 h-5 text-primary-foreground" />}
              variant="accent"
              onClick={() => navigate('/roadmap/prep')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

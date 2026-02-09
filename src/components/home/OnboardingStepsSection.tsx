import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  key: string;
  title: string;
  description: string;
  route: string;
  isCompleted: boolean;
}

interface OnboardingStepsSectionProps {
  title?: string;
  subtitle?: string;
}

const OnboardingStepsSection: React.FC<OnboardingStepsSectionProps> = ({
  title = 'Complete Your Onboarding',
  subtitle,
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  // Build steps from profile state
  const steps: OnboardingStep[] = useMemo(() => {
    if (!profile) return [];

    return [
      {
        key: 'profile_setup',
        title: 'Set up your profile',
        description: 'Add your name, avatar, and choose your Forge edition',
        route: '/profile-setup',
        isCompleted: !!profile.profile_setup_completed,
      },
      {
        key: 'ky_form',
        title: 'Complete your KY Form',
        description: 'Tell us about your background, preferences, and emergency contacts',
        route: '/kyf',
        isCompleted: !!profile.ky_form_completed,
      },
      {
        key: 'profile_photo',
        title: 'Add your profile photo',
        description: 'Upload a clear headshot for your Forge ID card',
        route: '/profile',
        isCompleted: !!profile.avatar_url,
      },
    ];
  }, [profile]);

  const completedCount = steps.filter(s => s.isCompleted).length;
  const totalCount = steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Don't show if all steps completed
  if (completedCount === totalCount && totalCount > 0) return null;
  if (!profile || steps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-card/80 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
              {completedCount} of {totalCount}
            </span>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          <Progress value={progressPercent} className="h-1.5 mt-3" />
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground ml-3 transition-transform duration-200 flex-shrink-0',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Steps List */}
      {isExpanded && (
        <div className="border-t border-border/30 divide-y divide-border/20">
          {steps.map((step, index) => {
            // A step is unlocked if all previous steps are completed
            const isLocked = index > 0 && !steps[index - 1].isCompleted;
            const isCompleted = step.isCompleted;
            const isActive = !isCompleted && !isLocked;

            return (
              <button
                key={step.key}
                onClick={() => {
                  if (!isLocked && !isCompleted) {
                    navigate(step.route);
                  }
                }}
                disabled={isLocked}
                className={cn(
                  'w-full flex items-center gap-4 p-4 px-5 text-left transition-all duration-200',
                  isActive && 'hover:bg-primary/5 cursor-pointer',
                  isCompleted && 'opacity-60',
                  isLocked && 'opacity-40 cursor-not-allowed'
                )}
              >
                {/* Step Number / Status */}
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isActive && 'bg-primary/15 text-primary border border-primary/30',
                    isLocked && 'bg-secondary text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isCompleted
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {step.description}
                  </p>
                </div>

                {/* Arrow */}
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OnboardingStepsSection;

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KYFormProgressBar } from '@/components/kyform/KYFormProgressBar';
import { getSectionsForCohort } from '@/components/kyform/KYSectionConfig';

const KYProfileCard: React.FC = () => {
  const { profile, edition } = useAuth();
  const navigate = useNavigate();

  const cohortType = edition?.cohort_type || 'FORGE';
  const sections = useMemo(() => getSectionsForCohort(cohortType), [cohortType]);

  const sectionProgress = (profile as any)?.ky_section_progress as Record<string, boolean> | null;

  const isSectionCompleted = (key: string) => !!sectionProgress?.[key];

  const completedCount = sections.filter((s) => isSectionCompleted(s.key)).length;
  const totalCount = sections.length;

  // Don't render if all sections complete
  if (completedCount === totalCount) return null;

  const handleOpenSection = (sectionKey: string) => {
    navigate(`/ky-section/${sectionKey}`);
  };

  return (
    <>
      <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15 hover:from-[#FFBF00]/50 hover:via-[#FFBF00]/25 hover:to-[#FFBF00]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300">
      <div className="rounded-[13px] bg-card/80 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-foreground">Complete Your Profile</h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {completedCount} of {totalCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Required before bootcamp</p>
          <KYFormProgressBar currentStep={completedCount} totalSteps={totalCount} />
        </div>

        {/* Section list */}
        <div className="divide-y divide-border/30">
          {sections.map((section, index) => {
            const completed = isSectionCompleted(section.key);
            const isLocked = index > 0 && !isSectionCompleted(sections[index - 1].key);
            const isActive = !completed && !isLocked;

            return (
              <button
                key={section.key}
                disabled={isLocked || completed}
                onClick={() => isActive && handleOpenSection(section.key)}
                className={cn(
                  'w-full flex items-center gap-4 px-5 py-4 text-left transition-all',
                  isActive && 'hover:bg-primary/5 cursor-pointer',
                  completed && 'bg-primary/5',
                  isLocked && 'opacity-40 cursor-not-allowed'
                )}
              >
                {/* Section icon */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0',
                    completed && 'bg-primary/15',
                    isActive && 'bg-primary/10 border border-primary/20',
                    isLocked && 'bg-secondary'
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    section.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      completed ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {index + 1}. {section.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {section.subtitle}
                  </p>
                </div>

                {/* Action */}
                {isActive && (
                  <span className="text-xs font-bold text-primary flex items-center gap-0.5 shrink-0">
                    {completedCount > 0 && index === completedCount ? 'Continue' : 'Start now'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </>
  );
};

export default KYProfileCard;

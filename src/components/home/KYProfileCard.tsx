import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KYFormProgressBar } from '@/components/kyform/KYFormProgressBar';
import { KYSectionSheet } from '@/components/kyform/KYSectionSheet';
import { getSectionsForCohort } from '@/components/kyform/KYSectionConfig';
import type { KYSection } from '@/components/kyform/KYSectionConfig';

const KYProfileCard: React.FC = () => {
  const { profile, edition, refreshProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<KYSection | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const cohortType = edition?.cohort_type || 'FORGE';
  const sections = useMemo(() => getSectionsForCohort(cohortType), [cohortType]);

  const sectionProgress = (profile as any)?.ky_section_progress as Record<string, boolean> | null;

  const isSectionCompleted = (key: string) => !!sectionProgress?.[key];

  const completedCount = sections.filter((s) => isSectionCompleted(s.key)).length;
  const totalCount = sections.length;

  // Don't render if all sections complete
  if (completedCount === totalCount) return null;

  const handleOpenSection = (section: KYSection, index: number) => {
    setActiveSection(section);
    setActiveSectionIndex(index);
  };

  const handleSectionComplete = () => {
    setActiveSection(null);
    refreshProfile();
  };

  return (
    <>
      <div className="rounded-2xl border border-forge-gold/30 bg-card/80 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_-8px_hsl(var(--primary)/0.2)]">
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
                onClick={() => isActive && handleOpenSection(section, index)}
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

      {/* Section Sheet */}
      {activeSection && (
        <KYSectionSheet
          open={!!activeSection}
          onOpenChange={(open) => !open && setActiveSection(null)}
          section={activeSection}
          onComplete={handleSectionComplete}
          isLastSection={activeSectionIndex === sections.length - 1}
        />
      )}
    </>
  );
};

export default KYProfileCard;

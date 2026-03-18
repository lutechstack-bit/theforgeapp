import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveCohort } from "@/hooks/useEffectiveCohort";
import { CheckCircle2, Lock, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { KYFormProgressBar } from "@/components/kyform/KYFormProgressBar";
import { getSectionsForCohort } from "@/components/kyform/KYSectionConfig";

const KYProfileCard: React.FC = () => {
  const { profile } = useAuth();
  const { effectiveCohortType } = useEffectiveCohort();
  const navigate = useNavigate();

  const cohortType = effectiveCohortType || "FORGE";
  const sections = useMemo(() => getSectionsForCohort(cohortType), [cohortType]);

  const sectionProgress = (profile as any)?.ky_section_progress as Record<string, boolean> | null;

  const isSectionCompleted = (key: string) => !!sectionProgress?.[key];

  // Separate required and optional sections
  const requiredSections = sections.filter((s) => !s.isOptional);
  const optionalSections = sections.filter((s) => s.isOptional);

  const completedRequired = requiredSections.filter((s) => isSectionCompleted(s.key)).length;
  const totalRequired = requiredSections.length;

  // Don't render if all required sections complete AND all optional sections complete
  const allOptionalDone = optionalSections.every((s) => isSectionCompleted(s.key));
  if (completedRequired === totalRequired && allOptionalDone) return null;

  const handleOpenSection = (sectionKey: string) => {
    navigate(`/ky-section/${sectionKey}`);
  };

  return (
    <>
      <div className="rounded-2xl border border-[#FFBF00]/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-foreground">
              {{ FORGE: "Know Your Filmmaker Profile", FORGE_WRITING: "Know Your Writer Profile", FORGE_CREATORS: "Know Your Creator Profile" }[cohortType] || "Know Your Filmmaker Profile"}
            </h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {completedRequired} of {totalRequired}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Help us get to know you</p>
          <KYFormProgressBar currentStep={completedRequired} totalSteps={totalRequired} />
        </div>

        {/* Required section list */}
        <div className="divide-y divide-border/30">
          {requiredSections.map((section, index) => {
            const completed = isSectionCompleted(section.key);
            const isLocked = index > 0 && !isSectionCompleted(requiredSections[index - 1].key);
            const isActive = !completed && !isLocked;

            return (
              <button
                key={section.key}
                disabled={isLocked || completed}
                onClick={() => isActive && handleOpenSection(section.key)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 text-left transition-all",
                  isActive && "hover:bg-primary/5 cursor-pointer",
                  completed && "bg-primary/5",
                  isLocked && "opacity-40 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0",
                    completed && "bg-primary/15",
                    isActive && "bg-primary/10 border border-primary/20",
                    isLocked && "bg-secondary",
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

                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold", completed ? "text-primary" : "text-foreground")}>
                    {index + 1}. {section.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{section.subtitle}</p>
                </div>

                {isActive && (
                  <span className="text-xs font-bold text-primary flex items-center gap-0.5 shrink-0">
                    {completedRequired > 0 && index === completedRequired ? "Continue" : "Start now"}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}

          {/* Optional sections */}
          {optionalSections.map((section) => {
            const completed = isSectionCompleted(section.key);
            // Optional sections are unlocked when all required sections are done
            const isLocked = completedRequired < totalRequired;
            const isActive = !completed && !isLocked;

            return (
              <button
                key={section.key}
                disabled={isLocked || completed}
                onClick={() => isActive && handleOpenSection(section.key)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 text-left transition-all",
                  isActive && "hover:bg-primary/5 cursor-pointer",
                  completed && "bg-primary/5",
                  isLocked && "opacity-40 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0",
                    completed && "bg-primary/15",
                    isActive && "bg-primary/10 border border-primary/20",
                    isLocked && "bg-secondary",
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-semibold", completed ? "text-primary" : "text-foreground")}>
                      {section.title}
                    </p>
                    <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{section.subtitle}</p>
                </div>

                {isActive && (
                  <span className="text-xs font-bold text-primary flex items-center gap-0.5 shrink-0">
                    Set up
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default KYProfileCard;

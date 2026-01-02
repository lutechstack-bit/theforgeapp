import React from 'react';
import { Lock } from 'lucide-react';
import { CohortType } from '@/contexts/ThemeContext';
import forgeLogoImg from '@/assets/forge-logo.png';
import forgeWritingLogoImg from '@/assets/forge-writing-logo.png';
import forgeCreatorsLogoImg from '@/assets/forge-creators-logo.png';

interface CohortCrossSellProps {
  currentCohort: CohortType;
  onCohortClick: (cohortType: CohortType) => void;
}

const cohortLogos: Record<CohortType, string> = {
  FORGE: forgeLogoImg,
  FORGE_WRITING: forgeWritingLogoImg,
  FORGE_CREATORS: forgeCreatorsLogoImg,
};

const cohortNames: Record<CohortType, string> = {
  FORGE: 'The Forge',
  FORGE_WRITING: 'Forge Writing',
  FORGE_CREATORS: 'Forge Creators',
};

const CohortCrossSell: React.FC<CohortCrossSellProps> = ({ currentCohort, onCohortClick }) => {
  const otherCohorts = (Object.keys(cohortNames) as CohortType[]).filter(
    type => type !== currentCohort
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
        Explore Other Programs
      </p>
      {otherCohorts.map(cohortType => (
        <button
          key={cohortType}
          onClick={() => onCohortClick(cohortType)}
          className="w-full glass-card-hover rounded-xl p-3 flex items-center gap-3 group transition-all duration-300 text-left"
        >
          <div className="relative w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center overflow-hidden border border-border/30">
            <img 
              src={cohortLogos[cohortType]} 
              alt={cohortNames[cohortType]}
              className="w-8 h-8 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {cohortNames[cohortType]}
            </p>
            <p className="text-xs text-muted-foreground">Preview roadmap</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default CohortCrossSell;

import React from 'react';
import { BentoTile } from './BentoTile';

interface BentoProficiencyTileProps {
  cohortType: string | null;
  kyfResponse?: any;
  kywResponse?: any;
  kycResponse?: any;
  onEdit?: () => void;
}

const levelMap: Record<string, { label: string; width: string }> = {
  beginner: { label: 'Beginner · Level 1', width: '25%' },
  developing: { label: 'Developing · Level 2', width: '50%' },
  intermediate: { label: 'Intermediate · Level 3', width: '65%' },
  advanced: { label: 'Advanced · Level 4', width: '85%' },
  expert: { label: 'Expert · Level 5', width: '100%' },
};

const ProfRow: React.FC<{ name: string; level: string | null }> = ({ name, level }) => {
  if (!level) return null;
  const config = levelMap[level.toLowerCase()] || levelMap.beginner;
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[13px] text-muted-foreground">{name}</span>
        <span className="text-[10px] text-primary font-medium">{config.label}</span>
      </div>
      <div className="h-[3px] bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: config.width,
            background: 'linear-gradient(90deg, hsl(var(--forge-gold)), hsl(var(--primary)))',
          }}
        />
      </div>
    </div>
  );
};

export const BentoProficiencyTile: React.FC<BentoProficiencyTileProps> = ({
  cohortType,
  kyfResponse,
  kywResponse,
  kycResponse,
  onEdit,
}) => {
  const isFilmmaking = cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS';

  return (
    <BentoTile
      label="Craft Proficiency"
      icon="◈"
      className="col-span-full md:col-span-7"
      onEdit={onEdit}
      animationDelay={0.12}
    >
      <div className="flex flex-col gap-4">
        {isFilmmaking && kyfResponse && (
          <>
            <ProfRow name="Screenwriting" level={kyfResponse.proficiency_screenwriting} />
            <ProfRow name="Direction" level={kyfResponse.proficiency_direction} />
            <ProfRow name="Cinematography" level={kyfResponse.proficiency_cinematography} />
            <ProfRow name="Editing" level={kyfResponse.proficiency_editing} />
          </>
        )}
        {cohortType === 'FORGE_WRITING' && kywResponse && (
          <>
            <ProfRow name="Writing" level={kywResponse.proficiency_writing} />
            <ProfRow name="Story & Voice" level={kywResponse.proficiency_story_voice} />
          </>
        )}
        {cohortType === 'FORGE_CREATORS' && kycResponse && (
          <>
            <ProfRow name="Content Creation" level={kycResponse.proficiency_content_creation} />
            <ProfRow name="Storytelling" level={kycResponse.proficiency_storytelling} />
            <ProfRow name="Video Production" level={kycResponse.proficiency_video_production} />
          </>
        )}
        {!kyfResponse && !kywResponse && !kycResponse && (
          <p className="text-sm text-muted-foreground/50">Complete your KY form to see proficiency data</p>
        )}
      </div>
    </BentoTile>
  );
};

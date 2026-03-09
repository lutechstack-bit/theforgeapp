import React from 'react';
import { BentoTile } from './BentoTile';

interface BentoPracticeTileProps {
  cohortType: string | null;
  kywResponse?: any;
  kyfResponse?: any;
  kyData?: any;
  onEdit?: () => void;
}

export const BentoPracticeTile: React.FC<BentoPracticeTileProps> = ({
  cohortType,
  kywResponse,
  kyfResponse,
  kyData,
  onEdit,
}) => {
  const isWriting = cohortType === 'FORGE_WRITING';
  const writingTypes = kywResponse?.writing_types || [];
  const allTypes = ['Fiction', 'Non-fiction', 'Poetry', 'Screenwriting', 'Journaling', 'Not writing consistently yet'];

  return (
    <BentoTile
      label={isWriting ? 'Writing Practice' : 'Filmmaking Practice'}
      icon="✍"
      className="col-span-full md:col-span-7 row-span-3"
      onEdit={onEdit}
      animationDelay={0.20}
    >
      <div className="space-y-4">
        {isWriting && (
          <div>
            <div className="font-mono text-[8px] tracking-[2px] uppercase text-muted-foreground mb-2">
              Writing Types — select all that apply
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allTypes.map((type) => (
                <span
                  key={type}
                  className={`px-3 py-1 rounded-full text-[11.5px] border transition-colors ${
                    writingTypes.includes(type)
                      ? 'bg-primary/12 border-primary text-primary'
                      : 'bg-secondary border-primary/10 text-muted-foreground'
                  }`}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {kyData?.emergency_contact_name && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-primary/10">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] tracking-[2px] uppercase text-muted-foreground">Emergency Contact</span>
              <span className="text-[13px] text-foreground">{kyData.emergency_contact_name}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] tracking-[2px] uppercase text-muted-foreground">Emergency Number</span>
              <span className="text-[13px] text-foreground">{kyData.emergency_contact_number || '—'}</span>
            </div>
          </div>
        )}

        {!isWriting && !kyData?.emergency_contact_name && (
          <p className="text-sm text-muted-foreground/50 italic">Complete your KY form to see practice data</p>
        )}
      </div>
    </BentoTile>
  );
};

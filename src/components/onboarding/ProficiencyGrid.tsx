import React from 'react';
import { cn } from '@/lib/utils';

interface ProficiencySkill {
  key: string;
  label: string;
}

interface ProficiencyGridProps {
  skills: ProficiencySkill[];
  levels: string[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  required?: boolean;
}

export const ProficiencyGrid: React.FC<ProficiencyGridProps> = ({
  skills,
  levels,
  values,
  onChange,
  required = false,
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground">
        Rate your proficiency {required && <span className="text-destructive">*</span>}
      </label>

      <div className="rounded-2xl border border-forge-gold/20 bg-card/40 backdrop-blur-sm overflow-x-auto">
        {/* Header row */}
        <div className="grid min-w-[380px]" style={{ gridTemplateColumns: `minmax(110px, 1.3fr) repeat(${levels.length}, 1fr)` }}>
          <div className="p-3 md:p-4" />
          {levels.map((level) => (
            <div
              key={level}
              className="p-2.5 md:p-3 text-center text-[11px] md:text-xs font-bold text-forge-gold uppercase tracking-wider"
            >
              {level}
            </div>
          ))}
        </div>

        {/* Skill rows */}
        {skills.map((skill, idx) => (
          <div
            key={skill.key}
            className={cn(
              'grid items-center border-t border-border/30 min-w-[380px]',
              idx % 2 === 0 ? 'bg-card/20' : 'bg-card/40'
            )}
            style={{ gridTemplateColumns: `minmax(110px, 1.3fr) repeat(${levels.length}, 1fr)` }}
          >
            <div className="p-3 md:p-4 text-xs md:text-sm font-medium text-foreground leading-tight">
              {skill.label}
            </div>
            {levels.map((level) => {
              const levelValue = level.toLowerCase();
              const isSelected = values[skill.key] === levelValue;
              return (
                <div key={level} className="flex items-center justify-center p-3 md:p-4">
                  <button
                    type="button"
                    onClick={() => onChange(skill.key, levelValue)}
                    className={cn(
                      'w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                      isSelected
                        ? 'border-forge-gold bg-forge-gold scale-110 shadow-[0_0_14px_-2px_hsl(var(--forge-gold)/0.5)]'
                        : 'border-muted-foreground/30 hover:border-forge-gold/50 active:scale-95'
                    )}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-background" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

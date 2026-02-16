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
      <label className="text-sm font-medium text-foreground">
        Rate your proficiency {required && <span className="text-destructive">*</span>}
      </label>

      <div className="rounded-2xl border border-forge-gold/20 bg-card/40 backdrop-blur-sm overflow-hidden">
        {/* Header row */}
        <div className="grid" style={{ gridTemplateColumns: `minmax(100px, 1.2fr) repeat(${levels.length}, 1fr)` }}>
          <div className="p-2.5 md:p-3" />
          {levels.map((level) => (
            <div
              key={level}
              className="p-2 md:p-3 text-center text-[10px] md:text-xs font-bold text-forge-gold uppercase tracking-wider"
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
              'grid items-center border-t border-border/30',
              idx % 2 === 0 ? 'bg-card/20' : 'bg-card/40'
            )}
            style={{ gridTemplateColumns: `minmax(100px, 1.2fr) repeat(${levels.length}, 1fr)` }}
          >
            <div className="p-2.5 md:p-3 text-xs md:text-sm font-medium text-foreground">
              {skill.label}
            </div>
            {levels.map((level) => {
              const levelValue = level.toLowerCase();
              const isSelected = values[skill.key] === levelValue;
              return (
                <div key={level} className="flex items-center justify-center p-2 md:p-3">
                  <button
                    type="button"
                    onClick={() => onChange(skill.key, levelValue)}
                    className={cn(
                      'w-6 h-6 md:w-7 md:h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                      isSelected
                        ? 'border-forge-gold bg-forge-gold scale-110 shadow-[0_0_12px_-2px_hsl(var(--forge-gold)/0.5)]'
                        : 'border-muted-foreground/30 hover:border-forge-gold/50 active:scale-95'
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-background" />
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

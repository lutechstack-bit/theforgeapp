import React from 'react';
import { cn } from '@/lib/utils';

interface ProficiencyOption {
  value: string;
  label: string;
}

interface ProficiencyFieldProps {
  label: string;
  options: ProficiencyOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const ProficiencyField: React.FC<ProficiencyFieldProps> = ({
  label,
  options,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="space-y-1.5">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'w-full p-2 rounded-xl border text-left transition-all flex items-start gap-2.5 active:scale-[0.98]',
                isSelected
                  ? 'border-forge-gold bg-forge-gold/10 shadow-[0_0_15px_-4px_hsl(var(--forge-gold)/0.3)]'
                  : 'border-border bg-card/60 hover:border-forge-gold/40'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                isSelected
                  ? 'border-forge-gold bg-forge-gold scale-110'
                  : 'border-muted-foreground/40'
              )}>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-background" />
                )}
              </div>
              <span className={cn('text-[13px]', isSelected ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

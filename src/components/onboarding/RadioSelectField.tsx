import React from 'react';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioSelectFieldProps {
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  columns?: 1 | 2 | 3;
}

export const RadioSelectField: React.FC<RadioSelectFieldProps> = ({
  label,
  options,
  value,
  onChange,
  required = false,
  columns = 1,
}) => {
  const gridCols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className={`grid ${gridCols} gap-2`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all active:scale-[0.98]',
                isSelected
                  ? 'border-forge-gold bg-forge-gold/10 shadow-[0_0_15px_-4px_hsl(var(--forge-gold)/0.3)]'
                  : 'border-border bg-card/60 hover:border-forge-gold/40'
              )}
            >
              <span className={cn('text-sm font-medium', isSelected ? 'text-forge-gold' : 'text-foreground')}>
                {option.label}
              </span>
              {option.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectFieldProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  maxSelections?: number;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  options,
  value,
  onChange,
  required = false,
  maxSelections,
}) => {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else if (!maxSelections || value.length < maxSelections) {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
        {maxSelections && (
          <span className="text-muted-foreground font-normal ml-1">
            (Select up to {maxSelections})
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                'px-4 py-2 rounded-full border text-sm transition-all active:scale-[0.96]',
                isSelected
                  ? 'border-forge-gold bg-forge-gold/15 text-forge-gold shadow-[0_0_10px_-3px_hsl(var(--forge-gold)/0.3)]'
                  : 'border-border bg-card/60 text-muted-foreground hover:border-forge-gold/40'
              )}
            >
              {isSelected && <Check className="inline h-3 w-3 mr-1 text-forge-gold" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

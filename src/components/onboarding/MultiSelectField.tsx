import React from 'react';
import { Check } from 'lucide-react';

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
              className={`px-4 py-2 rounded-full border text-sm transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50'
              }`}
            >
              {isSelected && <Check className="inline h-3 w-3 mr-1" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

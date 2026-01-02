import React from 'react';

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
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`p-3 rounded-xl border text-left transition-all ${
              value === option.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <span className={`text-sm font-medium ${value === option.value ? 'text-primary' : 'text-foreground'}`}>
              {option.label}
            </span>
            {option.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

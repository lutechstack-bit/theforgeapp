import React from 'react';

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
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
              value === option.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              value === option.value ? 'border-primary bg-primary' : 'border-muted-foreground'
            }`}>
              {value === option.value && (
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              )}
            </div>
            <span className={`text-sm ${value === option.value ? 'text-foreground' : 'text-muted-foreground'}`}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

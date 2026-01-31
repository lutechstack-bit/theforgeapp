import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRIES, getStatesForCountry, getCountryByName } from '@/lib/countryStateData';

interface CountryStateSelectorProps {
  country: string;
  state: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  required?: boolean;
  className?: string;
}

export const CountryStateSelector: React.FC<CountryStateSelectorProps> = ({
  country,
  state,
  onCountryChange,
  onStateChange,
  required = false,
  className = '',
}) => {
  // Get states for the selected country
  const countryData = getCountryByName(country);
  const states = countryData ? getStatesForCountry(countryData.code) : [];
  const hasStates = states.length > 0;

  const handleCountryChange = (value: string) => {
    onCountryChange(value);
    // Clear state when country changes
    onStateChange('');
  };

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <div className="space-y-2">
        <Label>Country {required && '*'}</Label>
        <Select value={country} onValueChange={handleCountryChange}>
          <SelectTrigger className="h-11 bg-secondary/50">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50 max-h-[300px]">
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>State {required && '*'}</Label>
        <Select 
          value={state} 
          onValueChange={onStateChange}
          disabled={!country || !hasStates}
        >
          <SelectTrigger className="h-11 bg-secondary/50">
            <SelectValue placeholder={!country ? 'Select country first' : hasStates ? 'Select state' : 'Enter below'} />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50 max-h-[300px]">
            {states.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

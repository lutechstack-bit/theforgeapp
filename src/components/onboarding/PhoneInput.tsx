import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PHONE_COUNTRIES,
  getDefaultPhoneCountry,
  validatePhoneNumber,
  parsePhoneValue,
  formatPhoneValue,
} from '@/lib/phoneCountryCodes';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  label = 'Phone number',
  required = false,
  className = '',
}) => {
  const parsed = parsePhoneValue(value);
  const [dialCode, setDialCode] = useState(parsed.dialCode);
  const [number, setNumber] = useState(parsed.number);
  const [touched, setTouched] = useState(false);

  // Sync internal state when external value changes
  useEffect(() => {
    const parsed = parsePhoneValue(value);
    setDialCode(parsed.dialCode);
    setNumber(parsed.number);
  }, [value]);

  const validation = validatePhoneNumber(dialCode, number);
  const showError = touched && number.length > 0 && !validation.valid;

  const handleDialCodeChange = (newDialCode: string) => {
    setDialCode(newDialCode);
    onChange(formatPhoneValue(newDialCode, number));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const digits = e.target.value.replace(/\D/g, '');
    setNumber(digits);
    onChange(formatPhoneValue(dialCode, digits));
  };

  const selectedCountry = PHONE_COUNTRIES.find(c => c.dialCode === dialCode) || getDefaultPhoneCountry();

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label>
          {label} {required && '*'}
        </Label>
      )}
      <div className="flex gap-2">
        <Select value={dialCode} onValueChange={handleDialCodeChange}>
          <SelectTrigger className="w-[110px] h-11 bg-secondary/50 shrink-0">
            <SelectValue>
              <span className="flex items-center gap-1.5">
                <span>{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover z-50 max-h-[300px]">
            {PHONE_COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.dialCode}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.dialCode}</span>
                  <span className="text-muted-foreground text-xs">{country.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={handleNumberChange}
          onBlur={() => setTouched(true)}
          placeholder={`e.g. ${'9'.repeat(selectedCountry.minDigits)}`}
          className={`h-11 bg-secondary/50 flex-1 ${showError ? 'border-destructive' : ''}`}
        />
      </div>
      
      {showError && (
        <p className="text-sm text-destructive">{validation.error}</p>
      )}
      
      {!showError && touched && number.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {number.length}/{selectedCountry.minDigits === selectedCountry.maxDigits 
            ? selectedCountry.minDigits 
            : `${selectedCountry.minDigits}-${selectedCountry.maxDigits}`} digits
        </p>
      )}
    </div>
  );
};

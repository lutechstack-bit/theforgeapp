// Phone country codes with validation rules

export interface PhoneCountry {
  code: string;
  name: string;
  dialCode: string;
  minDigits: number;
  maxDigits: number;
  flag: string;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: 'IN', name: 'India', dialCode: '+91', minDigits: 10, maxDigits: 10, flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', minDigits: 10, maxDigits: 10, flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', minDigits: 10, maxDigits: 11, flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', minDigits: 10, maxDigits: 10, flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', minDigits: 9, maxDigits: 9, flag: '🇦🇺' },
  { code: 'AE', name: 'UAE', dialCode: '+971', minDigits: 9, maxDigits: 9, flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', minDigits: 8, maxDigits: 8, flag: '🇸🇬' },
  { code: 'DE', name: 'Germany', dialCode: '+49', minDigits: 10, maxDigits: 11, flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', minDigits: 9, maxDigits: 9, flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', minDigits: 9, maxDigits: 9, flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', minDigits: 9, maxDigits: 9, flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', minDigits: 9, maxDigits: 9, flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', minDigits: 10, maxDigits: 11, flag: '🇦🇹' },
  { code: 'IT', name: 'Italy', dialCode: '+39', minDigits: 9, maxDigits: 10, flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', minDigits: 9, maxDigits: 9, flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', minDigits: 9, maxDigits: 9, flag: '🇵🇹' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', minDigits: 9, maxDigits: 10, flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', minDigits: 8, maxDigits: 8, flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', minDigits: 8, maxDigits: 8, flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', minDigits: 9, maxDigits: 10, flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', minDigits: 9, maxDigits: 9, flag: '🇮🇪' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', minDigits: 9, maxDigits: 10, flag: '🇳🇿' },
  { code: 'JP', name: 'Japan', dialCode: '+81', minDigits: 10, maxDigits: 11, flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', minDigits: 10, maxDigits: 11, flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', minDigits: 11, maxDigits: 11, flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', minDigits: 8, maxDigits: 8, flag: '🇭🇰' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', minDigits: 9, maxDigits: 10, flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', minDigits: 9, maxDigits: 9, flag: '🇹🇭' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', minDigits: 10, maxDigits: 12, flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', minDigits: 10, maxDigits: 10, flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', minDigits: 9, maxDigits: 10, flag: '🇻🇳' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', minDigits: 10, maxDigits: 10, flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', minDigits: 10, maxDigits: 10, flag: '🇵🇰' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', minDigits: 9, maxDigits: 9, flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', minDigits: 10, maxDigits: 10, flag: '🇳🇵' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', minDigits: 9, maxDigits: 9, flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', minDigits: 10, maxDigits: 10, flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', minDigits: 9, maxDigits: 9, flag: '🇰🇪' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', minDigits: 10, maxDigits: 10, flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', minDigits: 9, maxDigits: 9, flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', minDigits: 8, maxDigits: 8, flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', minDigits: 8, maxDigits: 8, flag: '🇰🇼' },
  { code: 'OM', name: 'Oman', dialCode: '+968', minDigits: 8, maxDigits: 8, flag: '🇴🇲' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', minDigits: 8, maxDigits: 8, flag: '🇧🇭' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', minDigits: 10, maxDigits: 10, flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', minDigits: 10, maxDigits: 11, flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', minDigits: 10, maxDigits: 10, flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', minDigits: 9, maxDigits: 9, flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', minDigits: 10, maxDigits: 10, flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dialCode: '+51', minDigits: 9, maxDigits: 9, flag: '🇵🇪' },
];

export const getPhoneCountryList = (): PhoneCountry[] => PHONE_COUNTRIES;

export const getPhoneCountryByDialCode = (dialCode: string): PhoneCountry | undefined => {
  return PHONE_COUNTRIES.find(c => c.dialCode === dialCode);
};

export const getPhoneCountryByCode = (code: string): PhoneCountry | undefined => {
  return PHONE_COUNTRIES.find(c => c.code === code);
};

export const getDefaultPhoneCountry = (): PhoneCountry => {
  return PHONE_COUNTRIES[0]; // India
};

export interface PhoneValidationResult {
  valid: boolean;
  error?: string;
}

export const validatePhoneNumber = (dialCode: string, number: string): PhoneValidationResult => {
  const country = getPhoneCountryByDialCode(dialCode);
  if (!country) {
    return { valid: false, error: 'Invalid country code' };
  }

  const digits = number.replace(/\D/g, '');
  
  if (digits.length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  if (digits.length < country.minDigits) {
    return { valid: false, error: `Must be at least ${country.minDigits} digits` };
  }
  
  if (digits.length > country.maxDigits) {
    return { valid: false, error: `Cannot exceed ${country.maxDigits} digits` };
  }
  
  return { valid: true };
};

export const formatPhoneValue = (dialCode: string, number: string): string => {
  const digits = number.replace(/\D/g, '');
  return `${dialCode} ${digits}`;
};

export const parsePhoneValue = (value: string): { dialCode: string; number: string } => {
  if (!value) return { dialCode: '+91', number: '' };
  
  // Try to match dial code at the start
  for (const country of PHONE_COUNTRIES) {
    if (value.startsWith(country.dialCode)) {
      return {
        dialCode: country.dialCode,
        number: value.slice(country.dialCode.length).trim()
      };
    }
  }
  
  // Default to India if no match
  return { dialCode: '+91', number: value.replace(/^\+?\d*\s*/, '') };
};

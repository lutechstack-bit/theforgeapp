import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioSelectField } from '@/components/onboarding/RadioSelectField';
import { MultiSelectField } from '@/components/onboarding/MultiSelectField';
import { ProficiencyField } from '@/components/onboarding/ProficiencyField';
import { PhotoUploadField } from '@/components/onboarding/PhotoUploadField';
import { PhoneInput } from '@/components/onboarding/PhoneInput';
import { TagInput } from '@/components/onboarding/TagInput';
import { TermsModal } from '@/components/onboarding/TermsModal';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionStep } from './KYSectionConfig';

const MBTI_TYPES = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];
const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

interface KYSectionFieldsProps {
  step: SectionStep;
  formData: Record<string, any>;
  updateField: (key: string, value: any) => void;
}

export const KYSectionFields: React.FC<KYSectionFieldsProps> = ({
  step,
  formData,
  updateField,
}) => {
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
        {step.subtitle && (
          <p className="text-sm text-muted-foreground">{step.subtitle}</p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-5">
        {step.fields.map((field) => {
          const value = formData[field.key] ?? (field.type === 'multi-select' || field.type === 'tags' ? [] : '');

          switch (field.type) {
            case 'text':
            case 'textarea':
              return (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.helperText && (
                    <p className="text-xs text-muted-foreground">{field.helperText}</p>
                  )}
                  <Input
                    value={value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="rounded-xl border-border bg-secondary/50 focus:ring-primary/30"
                  />
                </div>
              );

            case 'date':
              return (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    type="date"
                    value={value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="rounded-xl border-border bg-secondary/50 focus:ring-primary/30"
                  />
                  {value && (
                    <p className="text-xs text-muted-foreground">
                      Age: {(() => {
                        const today = new Date();
                        const birth = new Date(value);
                        let age = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                        return age;
                      })()} years
                    </p>
                  )}
                </div>
              );

            case 'radio':
              return (
                <RadioSelectField
                  key={field.key}
                  label={field.label}
                  options={field.options || []}
                  value={value}
                  onChange={(v) => updateField(field.key, v)}
                  required={field.required}
                  columns={field.columns}
                />
              );

            case 'multi-select':
              return (
                <MultiSelectField
                  key={field.key}
                  label={field.label}
                  options={(field.options || []).map((o) => typeof o === 'string' ? o : o.label)}
                  value={value}
                  onChange={(v) => updateField(field.key, v)}
                  required={field.required}
                />
              );

            case 'proficiency':
              return (
                <ProficiencyField
                  key={field.key}
                  label={field.label}
                  options={field.options || []}
                  value={value}
                  onChange={(v) => updateField(field.key, v)}
                  required={field.required}
                />
              );

            case 'photo':
              return (
                <PhotoUploadField
                  key={field.key}
                  label={field.label}
                  value={value}
                  onChange={(url) => updateField(field.key, url)}
                  folder={field.photoFolder || field.key}
                  required={field.required}
                  description={field.photoDescription}
                />
              );

            case 'phone':
              return (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <PhoneInput
                    value={value}
                    onChange={(v) => updateField(field.key, v)}
                  />
                </div>
              );

            case 'tags':
              return (
                <TagInput
                  key={field.key}
                  label={field.label}
                  value={value}
                  onChange={(v) => updateField(field.key, v)}
                  placeholder={field.placeholder}
                  maxItems={field.maxItems || 3}
                  required={field.required}
                />
              );

            case 'mbti':
              return (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.helperText && (
                    <a
                      href="https://www.16personalities.com/free-personality-test"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {field.helperText} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <div className="grid grid-cols-4 gap-2">
                    {MBTI_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateField(field.key, type)}
                        className={cn(
                          'py-2.5 rounded-xl border text-sm font-bold transition-all',
                          value === type
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              );

            case 'meal-preference':
              return (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'vegetarian', emoji: '🥬', label: 'Vegetarian' },
                      { value: 'non_vegetarian', emoji: '🍗', label: 'Non-Veg' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField(field.key, option.value)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all',
                          value === option.value
                            ? 'border-primary bg-primary/10 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]'
                            : 'border-border bg-card hover:border-primary/40'
                        )}
                      >
                        <span className="text-3xl">{option.emoji}</span>
                        <span className={cn(
                          'text-sm font-semibold',
                          value === option.value ? 'text-primary' : 'text-foreground'
                        )}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );

            case 'tshirt-size':
              return (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {TSHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateField(field.key, size)}
                        className={cn(
                          'px-4 py-2.5 rounded-xl border text-sm font-bold transition-all min-w-[52px]',
                          value === size
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              );

            case 'checkbox':
              return (
                <div key={field.key} className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-secondary/30">
                    <Checkbox
                      id={field.key}
                      checked={!!value}
                      onCheckedChange={(checked) => updateField(field.key, !!checked)}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <label htmlFor={field.key} className="text-sm font-medium text-foreground cursor-pointer">
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </label>
                      <button
                        type="button"
                        onClick={() => setTermsModalOpen(true)}
                        className="block text-xs text-primary hover:underline"
                      >
                        Read Terms & Conditions
                      </button>
                    </div>
                  </div>
                  <TermsModal
                    open={termsModalOpen}
                    onOpenChange={setTermsModalOpen}
                  />
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

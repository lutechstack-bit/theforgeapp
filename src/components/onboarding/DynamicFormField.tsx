import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioSelectField } from './RadioSelectField';
import { MultiSelectField } from './MultiSelectField';
import { ProficiencyField } from './ProficiencyField';
import { PhotoUploadField } from './PhotoUploadField';

export interface FormFieldConfig {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  placeholder?: string;
  helper_text?: string;
  is_required: boolean;
  options?: { value: string; label: string }[];
  grid_cols?: number;
}

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
}) => {
  const labelText = `${field.label}${field.is_required ? ' *' : ''}`;

  switch (field.field_type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <div className="space-y-2">
          <Label>{labelText}</Label>
          <Input
            type={field.field_type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="h-12 bg-secondary/50"
          />
          {field.helper_text && (
            <p className="text-xs text-muted-foreground">{field.helper_text}</p>
          )}
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label>{labelText}</Label>
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="h-12 bg-secondary/50"
          />
          {field.helper_text && (
            <p className="text-xs text-muted-foreground">{field.helper_text}</p>
          )}
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <Label>{labelText}</Label>
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 bg-secondary/50"
          />
          {field.helper_text && (
            <p className="text-xs text-muted-foreground">{field.helper_text}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label>{labelText}</Label>
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="bg-secondary/50"
          />
          {field.helper_text && (
            <p className="text-xs text-muted-foreground">{field.helper_text}</p>
          )}
        </div>
      );

    case 'radio':
    case 'select':
      return (
        <RadioSelectField
          label={field.label}
          required={field.is_required}
          options={field.options || []}
          value={value || ''}
          onChange={onChange}
        />
      );

    case 'multi_select':
      return (
        <MultiSelectField
          label={field.label}
          required={field.is_required}
          options={(field.options || []).map(o => o.label)}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );

    case 'proficiency':
      return (
        <ProficiencyField
          label={field.label}
          required={field.is_required}
          options={field.options || []}
          value={value || ''}
          onChange={onChange}
        />
      );

    case 'photo_upload':
      return (
        <PhotoUploadField
          label={field.label}
          required={field.is_required}
          value={value || ''}
          onChange={onChange}
          folder={field.field_key}
        />
      );

    case 'checkbox':
      return (
        <div className="flex items-start gap-3">
          <Checkbox
            id={field.field_key}
            checked={value === true}
            onCheckedChange={(checked) => onChange(checked === true)}
          />
          <label htmlFor={field.field_key} className="text-sm text-muted-foreground cursor-pointer">
            {field.label}
          </label>
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label>{labelText}</Label>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="h-12 bg-secondary/50"
          />
        </div>
      );
  }
};

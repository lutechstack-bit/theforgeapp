import React, { useState, KeyboardEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  maxItems?: number;
  required?: boolean;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  label,
  placeholder = 'Type and press Enter...',
  maxItems = 3,
  required = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    
    // Check for duplicates (case-insensitive)
    const isDuplicate = value.some(
      (existing) => existing.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (isDuplicate) {
      setInputValue('');
      return;
    }
    
    if (value.length < maxItems) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // If user types a comma, add the tag
    if (newValue.includes(',')) {
      const parts = newValue.split(',');
      parts.forEach((part) => addTag(part));
    } else {
      setInputValue(newValue);
    }
  };

  const isAtMax = value.length >= maxItems;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <Label>
            {label} {required && '*'}
          </Label>
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxItems}
          </span>
        </div>
      )}
      
      <div className="min-h-[56px] p-2.5 rounded-xl border border-border bg-secondary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                'bg-forge-gold/20 text-forge-gold border border-forge-gold/30'
              )}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:bg-forge-gold/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
        
        {/* Input */}
        {!isAtMax && (
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : 'Add another...'}
            className="border-0 bg-transparent h-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          />
        )}
        
        {isAtMax && (
          <p className="text-xs text-muted-foreground">
            Maximum of {maxItems} items reached
          </p>
        )}
      </div>
    </div>
  );
};

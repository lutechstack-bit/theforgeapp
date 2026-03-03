import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          placeholder=" "
          className={cn(
            'peer pt-5 pb-1.5 h-auto min-h-[3rem]',
            error && 'border-destructive focus-visible:ring-destructive',
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 origin-[0] text-sm text-muted-foreground',
            'transition-all duration-200 ease-out',
            'peer-focus:top-2.5 peer-focus:-translate-y-0 peer-focus:scale-75 peer-focus:text-primary',
            'peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:scale-75',
            error && 'peer-focus:text-destructive',
          )}
        >
          {label}
        </label>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  },
);

FloatingInput.displayName = 'FloatingInput';

export { FloatingInput };

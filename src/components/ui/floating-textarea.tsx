import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="relative">
        <Textarea
          ref={ref}
          id={textareaId}
          placeholder=" "
          className={cn(
            'peer pt-7 pb-2',
            error && 'border-destructive focus-visible:ring-destructive',
            className,
          )}
          {...props}
        />
        <label
          htmlFor={textareaId}
          className={cn(
            'pointer-events-none absolute left-3 top-4 origin-[0] text-sm text-muted-foreground',
            'transition-all duration-200 ease-out',
            'peer-focus:top-1 peer-focus:scale-75 peer-focus:text-primary',
            'peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:scale-75',
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

FloatingTextarea.displayName = 'FloatingTextarea';

export { FloatingTextarea };

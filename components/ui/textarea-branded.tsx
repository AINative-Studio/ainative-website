import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaBrandedProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

const TextareaBranded = React.forwardRef<
  HTMLTextAreaElement,
  TextareaBrandedProps
>(({ className, error, success, disabled, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles
        'flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm text-white',
        'bg-[#131726] border transition-colors duration-200',
        'placeholder:text-muted-foreground resize-y',
        // Focus styles
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131726]',
        // Border states
        {
          'border-[#31395a] focus-visible:border-[#5867EF] focus-visible:ring-[#5867EF]/20':
            !error && !success && !disabled,
          'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/20':
            error && !disabled,
          'border-green-400 focus-visible:border-green-400 focus-visible:ring-green-400/20':
            success && !disabled,
          'opacity-50 cursor-not-allowed bg-vite-bg': disabled,
        },
        className
      )}
      ref={ref}
      disabled={disabled}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  );
});
TextareaBranded.displayName = 'TextareaBranded';

export { TextareaBranded };

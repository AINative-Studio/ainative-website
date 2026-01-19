import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputBrandedProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

const InputBranded = React.forwardRef<HTMLInputElement, InputBrandedProps>(
  ({ className, type, error, success, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-10 w-full rounded-md px-3 py-2 text-sm text-white',
          'bg-[#131726] border transition-colors duration-200',
          'placeholder:text-muted-foreground',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white',
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
  }
);
InputBranded.displayName = 'InputBranded';

export { InputBranded };

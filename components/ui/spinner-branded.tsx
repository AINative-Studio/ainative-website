import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-[3px]',
        xl: 'h-12 w-12 border-[3px]',
      },
      variant: {
        primary: 'text-primary',
        secondary: 'text-secondary',
        accent: 'text-accent',
        white: 'text-white',
        muted: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label || 'Loading'}
        className={cn('inline-flex items-center gap-2', className)}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, variant }))} />
        {label && (
          <span className="text-sm text-muted-foreground motion-reduce:hidden">
            {label}
          </span>
        )}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';

const SpinnerDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'primary' | 'secondary' | 'accent' }
>(({ className, variant = 'primary', ...props }, ref) => {
  const dotColor = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
  }[variant];

  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    >
      <div
        className={cn(
          'h-2 w-2 rounded-full motion-reduce:animate-none',
          dotColor,
          'animate-[bounce_1.4s_infinite_0s]'
        )}
      />
      <div
        className={cn(
          'h-2 w-2 rounded-full motion-reduce:animate-none',
          dotColor,
          'animate-[bounce_1.4s_infinite_0.2s]'
        )}
      />
      <div
        className={cn(
          'h-2 w-2 rounded-full motion-reduce:animate-none',
          dotColor,
          'animate-[bounce_1.4s_infinite_0.4s]'
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
});
SpinnerDots.displayName = 'SpinnerDots';

const SpinnerPulse = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }[size];

  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn('relative inline-flex items-center justify-center', className)}
      {...props}
    >
      <div
        className={cn(
          sizeClasses,
          'absolute rounded-full bg-primary/20',
          'animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]',
          'motion-reduce:animate-none'
        )}
      />
      <div className={cn(sizeClasses, 'relative rounded-full bg-primary')} />
      <span className="sr-only">Loading...</span>
    </div>
  );
});
SpinnerPulse.displayName = 'SpinnerPulse';

const LoadingOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    message?: string;
    variant?: 'default' | 'blur';
  }
>(({ className, message = 'Loading...', variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center gap-4',
        variant === 'blur' && 'backdrop-blur-sm bg-background/50',
        variant === 'default' && 'bg-background/80',
        className
      )}
      {...props}
    >
      <Spinner size="xl" variant="primary" />
      {message && (
        <p className="text-sm font-medium text-foreground">{message}</p>
      )}
    </div>
  );
});
LoadingOverlay.displayName = 'LoadingOverlay';

export { Spinner, SpinnerDots, SpinnerPulse, LoadingOverlay, spinnerVariants };

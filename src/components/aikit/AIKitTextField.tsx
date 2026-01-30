import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export interface AIKitTextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  showClearButton?: boolean;
}

const AIKitTextField = React.forwardRef<HTMLInputElement, AIKitTextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      type = 'text',
      fullWidth = false,
      variant = 'default',
      leftIcon,
      rightIcon,
      onClear,
      showClearButton = false,
      className,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `aikit-textfield-${React.useId()}`;
    const hasError = Boolean(error);
    const [isFocused, setIsFocused] = React.useState(false);

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    const baseInputClasses = cn(
      'flex h-10 w-full rounded-md px-3 py-2 text-sm transition-all duration-200',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
      {
        // Variant styles
        'border border-input bg-transparent shadow-sm focus-visible:ring-ring':
          variant === 'default',
        'border-0 bg-[#1C2128] focus-visible:ring-[#4B6FED]': variant === 'filled',
        'border-2 border-[#2D333B] bg-transparent focus-visible:border-[#4B6FED] focus-visible:ring-0':
          variant === 'outlined',
        // Error state
        'border-red-500 focus-visible:ring-red-500 dark:border-red-500': hasError,
        // Full width
        'w-full': fullWidth,
        // Icon padding
        'pl-10': leftIcon,
        'pr-10': rightIcon || showClearButton,
      },
      className
    );

    const wrapperClasses = cn('relative', {
      'w-full': fullWidth,
    });

    const labelClasses = cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      {
        'text-red-500 dark:text-red-500': hasError,
      }
    );

    const helperTextClasses = cn('text-xs mt-1', {
      'text-red-500 dark:text-red-500': hasError,
      'text-muted-foreground': !hasError,
    });

    return (
      <div className={cn('space-y-2', { 'w-full': fullWidth })}>
        {label && (
          <Label htmlFor={inputId} className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className={wrapperClasses}>
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={baseInputClasses}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {(rightIcon || (showClearButton && props.value)) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightIcon ? (
                rightIcon
              ) : showClearButton && props.value && !disabled ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear input"
                  tabIndex={-1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6" />
                    <path d="m9 9 6 6" />
                  </svg>
                </button>
              ) : null}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            id={error ? `${inputId}-error` : `${inputId}-helper`}
            className={helperTextClasses}
            role={error ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

AIKitTextField.displayName = 'AIKitTextField';

export { AIKitTextField };

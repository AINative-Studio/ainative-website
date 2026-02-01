'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon, DividerHorizontalIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const aiKitCheckBoxVariants = cva(
  'shrink-0 rounded-md border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      error: {
        true: 'border-red-500 focus-visible:ring-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-600',
        false:
          'border-[#4B6FED]/40 hover:border-[#4B6FED]/60 focus-visible:ring-[#4B6FED] data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-[#4B6FED] data-[state=checked]:to-[#8A63F4] data-[state=checked]:border-[#4B6FED] data-[state=checked]:text-white',
      },
    },
    defaultVariants: {
      size: 'default',
      error: false,
    },
  }
);

export interface AIKitCheckBoxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'asChild'>,
    VariantProps<typeof aiKitCheckBoxVariants> {
  /**
   * Optional label text to display alongside the checkbox
   */
  label?: string;
  /**
   * Position of the label relative to the checkbox
   * @default 'right'
   */
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * Whether the checkbox is in an error state
   * @default false
   */
  error?: boolean;
  /**
   * Size variant of the checkbox
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg';
}

const AIKitCheckBox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  AIKitCheckBoxProps
>(
  (
    {
      className,
      label,
      labelPosition = 'right',
      error = false,
      size = 'default',
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const uniqueId = React.useId();
    const checkboxId = id || uniqueId;

    const checkbox = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(aiKitCheckBoxVariants({ size, error: error ? true : false, className }))}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn('flex items-center justify-center text-current')}
        >
          {props.checked === 'indeterminate' ? (
            <DividerHorizontalIcon
              className={cn({
                'h-3 w-3': size === 'sm',
                'h-4 w-4': size === 'default',
                'h-5 w-5': size === 'lg',
              })}
            />
          ) : (
            <CheckIcon
              className={cn({
                'h-3 w-3': size === 'sm',
                'h-4 w-4': size === 'default',
                'h-5 w-5': size === 'lg',
              })}
            />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    // If no label, return just the checkbox
    if (!label) {
      return checkbox;
    }

    // Determine flex direction based on label position
    const containerClasses = cn(
      'inline-flex items-center gap-2',
      {
        'flex-row': labelPosition === 'right',
        'flex-row-reverse': labelPosition === 'left',
        'flex-col': labelPosition === 'top',
        'flex-col-reverse': labelPosition === 'bottom',
      }
    );

    // Render checkbox with label
    return (
      <div className={containerClasses}>
        {checkbox}
        <label
          htmlFor={checkboxId}
          className={cn(
            'text-sm font-medium leading-none cursor-pointer select-none',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error ? 'text-red-500' : 'text-gray-200'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

AIKitCheckBox.displayName = 'AIKitCheckBox';

export { AIKitCheckBox, aiKitCheckBoxVariants };

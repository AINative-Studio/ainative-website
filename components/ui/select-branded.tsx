import * as React from 'react';
import { CaretSortIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/lib/utils';

const SelectBranded = SelectPrimitive.Root;

const SelectBrandedGroup = SelectPrimitive.Group;

const SelectBrandedValue = SelectPrimitive.Value;

export interface SelectBrandedTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  error?: boolean;
  success?: boolean;
}

const SelectBrandedTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectBrandedTriggerProps
>(({ className, children, error, success, disabled, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      'flex h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white',
      'bg-[#131726] border transition-colors duration-200',
      'placeholder:text-muted-foreground',
      '[&>span]:line-clamp-1',
      // Focus styles
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#131726]',
      // Border states
      {
        'border-[#31395a] focus:border-[#5867EF] focus:ring-[#5867EF]/20':
          !error && !success && !disabled,
        'border-red-400 focus:border-red-400 focus:ring-red-400/20':
          error && !disabled,
        'border-green-400 focus:border-green-400 focus:ring-green-400/20':
          success && !disabled,
        'opacity-50 cursor-not-allowed bg-vite-bg': disabled,
      },
      className
    )}
    disabled={disabled}
    aria-invalid={error ? 'true' : 'false'}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretSortIcon className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectBrandedTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectBrandedScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUpIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectBrandedScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectBrandedScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDownIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectBrandedScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectBrandedContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md',
        'bg-[#131726] border border-[#31395a] text-white shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectBrandedScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectBrandedScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectBrandedContent.displayName = SelectPrimitive.Content.displayName;

const SelectBrandedLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold text-white', className)}
    {...props}
  />
));
SelectBrandedLabel.displayName = SelectPrimitive.Label.displayName;

const SelectBrandedItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm',
      'outline-none transition-colors',
      'focus:bg-[#5867EF]/20 focus:text-white',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4 text-[#5867EF]" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectBrandedItem.displayName = SelectPrimitive.Item.displayName;

const SelectBrandedSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-[#31395a]', className)}
    {...props}
  />
));
SelectBrandedSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  SelectBranded,
  SelectBrandedGroup,
  SelectBrandedValue,
  SelectBrandedTrigger,
  SelectBrandedContent,
  SelectBrandedLabel,
  SelectBrandedItem,
  SelectBrandedSeparator,
  SelectBrandedScrollUpButton,
  SelectBrandedScrollDownButton,
};

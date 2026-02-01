import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'border bg-card text-card-foreground shadow',
        glassmorphism: [
          'border border-primary/20 shadow-xl',
          'bg-dark-2/60',
          'backdrop-blur-[10px]',
          'supports-[backdrop-filter]:bg-dark-2/60',
        ].join(' '),
        'gradient-border': [
          'relative bg-card text-card-foreground shadow-lg',
          'before:absolute before:inset-0 before:rounded-xl before:p-[1px]',
          'before:bg-gradient-to-r before:from-brand-primary before:to-vite-secondary',
          'before:-z-10',
          'after:absolute after:inset-[1px] after:rounded-[11px] after:bg-card after:-z-10',
        ].join(' '),
      },
      hoverEffect: {
        none: '',
        lift: [
          'hover:-translate-y-2 hover:shadow-2xl',
          'motion-safe:hover:-translate-y-2',
        ].join(' '),
        glow: [
          'hover:shadow-[0_0_30px_rgba(88,103,239,0.3)]',
          'hover:border-primary/40',
        ].join(' '),
        'lift-glow': [
          'hover:-translate-y-2 hover:shadow-2xl',
          'hover:shadow-[0_0_30px_rgba(88,103,239,0.3)]',
          'hover:border-primary/40',
          'motion-safe:hover:-translate-y-2',
        ].join(' '),
      },
      interactive: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      hoverEffect: 'none',
      interactive: false,
    },
  }
);

export interface CardAdvancedProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const CardAdvanced = React.forwardRef<HTMLDivElement, CardAdvancedProps>(
  ({ className, variant, hoverEffect, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hoverEffect, interactive, className }))}
        {...props}
      />
    );
  }
);
CardAdvanced.displayName = 'CardAdvanced';

const CardAdvancedHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardAdvancedHeader.displayName = 'CardAdvancedHeader';

const CardAdvancedTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardAdvancedTitle.displayName = 'CardAdvancedTitle';

const CardAdvancedDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardAdvancedDescription.displayName = 'CardAdvancedDescription';

const CardAdvancedContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardAdvancedContent.displayName = 'CardAdvancedContent';

const CardAdvancedFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardAdvancedFooter.displayName = 'CardAdvancedFooter';

export {
  CardAdvanced,
  CardAdvancedHeader,
  CardAdvancedFooter,
  CardAdvancedTitle,
  CardAdvancedDescription,
  CardAdvancedContent,
  cardVariants,
};

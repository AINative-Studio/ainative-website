import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gradientTextVariants = cva(
  'bg-clip-text text-transparent bg-gradient-to-r font-bold',
  {
    variants: {
      variant: {
        primary: 'from-[#5867EF] to-[#9747FF]',
        secondary: 'from-[#338585] to-[#22BCDE]',
        accent: 'from-[#FCAE39] to-[#FF6B6B]',
        rainbow: 'from-[#5867EF] via-[#9747FF] to-[#22BCDE]',
        sunset: 'from-[#FF6B6B] via-[#FCAE39] to-[#FF8E53]',
        ocean: 'from-[#22BCDE] via-[#338585] to-[#1A7575]',
      },
      size: {
        // Display sizes - For hero sections and major page titles
        'display-1': 'text-display-1', // 72px (48px mobile)
        'display-2': 'text-display-2', // 60px (40px mobile)
        'display-3': 'text-display-3', // 48px (36px mobile)
        // Title sizes - For section headings (mobile-optimized)
        'title-1': 'text-title-1',     // 28px (24px mobile)
        'title-2': 'text-title-2',     // 24px (20px mobile)
        'title-3': 'text-title-3',     // 24px (18px mobile)
        'title-4': 'text-title-4',     // 20px
        // Body sizes - For content and paragraphs
        'body-lg': 'text-body-lg',     // 18px
        'body': 'text-body',           // 16px (default)
        'body-sm': 'text-body-sm',     // 14px
        // UI sizes - For interface elements
        'ui': 'text-ui',               // 14px
      },
      animated: {
        true: 'bg-[length:200%_auto] animate-gradient-shift',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'body',
      animated: false,
    },
  }
);

export interface GradientTextProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof gradientTextVariants> {
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

const GradientText = React.forwardRef<HTMLElement, GradientTextProps>(
  ({ className, variant, size, animated, as: Comp = 'span', children, ...props }, ref) => {
    return (
      <Comp
        ref={ref as React.Ref<never>}
        className={cn(gradientTextVariants({ variant, size, animated, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
GradientText.displayName = 'GradientText';

const GradientBorder = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'primary' | 'secondary' | 'rainbow';
    borderWidth?: '1' | '2' | '3';
  }
>(
  (
    { className, variant = 'primary', borderWidth = '1', children, ...props },
    ref
  ) => {
    const gradients = {
      primary: 'from-[#5867EF] to-[#9747FF]',
      secondary: 'from-[#338585] to-[#22BCDE]',
      rainbow: 'from-[#5867EF] via-[#9747FF] to-[#22BCDE]',
    };

    const widths = {
      '1': 'p-[1px]',
      '2': 'p-[2px]',
      '3': 'p-[3px]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg bg-gradient-to-r',
          gradients[variant],
          widths[borderWidth],
          className
        )}
        {...props}
      >
        <div className="relative h-full w-full rounded-[calc(0.5rem-1px)] bg-card">
          {children}
        </div>
      </div>
    );
  }
);
GradientBorder.displayName = 'GradientBorder';

export { GradientText, GradientBorder, gradientTextVariants };

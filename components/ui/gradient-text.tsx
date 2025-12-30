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
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
        '6xl': 'text-6xl',
      },
      animated: {
        true: 'bg-[length:200%_auto] animate-gradient-shift',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'base',
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
        ref={ref as any}
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

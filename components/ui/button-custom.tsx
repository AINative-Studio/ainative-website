'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonCustomProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonCustom = React.forwardRef<HTMLButtonElement, ButtonCustomProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-primary text-white hover:bg-primary/90 active:bg-primary/95': variant === 'primary',
            'border-2 border-[#374151] bg-transparent hover:bg-[#1f2937] text-[#e5e7eb]': variant === 'outline',
            'bg-transparent hover:bg-[#1f2937] text-[#e5e7eb]': variant === 'ghost',
            'text-sm px-3 py-1.5 h-8': size === 'sm',
            'text-base px-4 py-2 h-10': size === 'md',
            'text-lg px-6 py-3 h-12': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

ButtonCustom.displayName = "ButtonCustom";

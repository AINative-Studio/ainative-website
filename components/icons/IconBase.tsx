import { SVGProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Base Icon Component
 *
 * A reusable wrapper for SVG icons that provides consistent styling and behavior.
 *
 * @example
 * ```tsx
 * <IconBase className="h-6 w-6 text-blue-500">
 *   <path d="..." />
 * </IconBase>
 * ```
 *
 * @features
 * - Accepts all standard SVG props
 * - Supports Tailwind sizing classes (h-4, h-6, h-8, etc.)
 * - Supports Tailwind color classes via currentColor
 * - Default 24x24 viewBox for consistent scaling
 * - Accessible with proper ARIA attributes
 */
export interface IconBaseProps extends SVGProps<SVGSVGElement> {
  children: React.ReactNode;
}

export function IconBase({
  children,
  className,
  ...props
}: IconBaseProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

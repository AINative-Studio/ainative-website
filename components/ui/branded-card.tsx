import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * BrandedCard - Enhanced card component with AINative brand styling
 *
 * Features:
 * - Consistent hover effects with brand colors
 * - Smooth scale and translate transforms
 * - Border glow on hover matching .card-vite styles
 * - Optional highlight variant for featured content
 *
 * Usage:
 * ```tsx
 * <BrandedCard>
 *   <BrandedCardHeader>
 *     <BrandedCardTitle>Title</BrandedCardTitle>
 *     <BrandedCardDescription>Description</BrandedCardDescription>
 *   </BrandedCardHeader>
 *   <BrandedCardContent>Content</BrandedCardContent>
 * </BrandedCard>
 * ```
 */

export interface BrandedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight'
}

const BrandedCard = React.forwardRef<HTMLDivElement, BrandedCardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base styles matching .card-vite
        "card-vite",
        "rounded-xl border bg-[#161B22] text-white shadow-sm",
        "transition-all duration-300 ease-in-out",
        // Hover effects
        "hover:border-[#4B6FED]/30",
        "hover:scale-[1.02]",
        "hover:-translate-y-1",
        "hover:shadow-lg hover:shadow-[#4B6FED]/10",
        // Variant styles
        variant === 'highlight' && [
          "border-[#4B6FED]/50",
          "bg-gradient-to-br from-[#161B22] to-[#1C2128]",
          "shadow-md shadow-[#4B6FED]/20"
        ],
        className
      )}
      {...props}
    />
  )
)
BrandedCard.displayName = "BrandedCard"

const BrandedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
BrandedCardHeader.displayName = "BrandedCardHeader"

const BrandedCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
))
BrandedCardTitle.displayName = "BrandedCardTitle"

const BrandedCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-gray-400", className)}
    {...props}
  />
))
BrandedCardDescription.displayName = "BrandedCardDescription"

const BrandedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props}, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
BrandedCardContent.displayName = "BrandedCardContent"

const BrandedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
BrandedCardFooter.displayName = "BrandedCardFooter"

export {
  BrandedCard,
  BrandedCardHeader,
  BrandedCardFooter,
  BrandedCardTitle,
  BrandedCardDescription,
  BrandedCardContent
}

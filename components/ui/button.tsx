import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Adapts to light/dark mode using CSS variables
        default: "bg-brand-primary hover:bg-vite-primary-hover text-white shadow-lg hover:shadow-xl hover:shadow-brand-primary/20 transform hover:-translate-y-0.5 dark:bg-brand-primary dark:hover:bg-vite-primary-hover",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // Outline: Adapts border and text colors for light/dark mode
        outline:
          "border-2 border-input hover:border-brand-primary/40 bg-transparent hover:bg-accent text-foreground dark:border-dark-2 dark:hover:bg-dark-3 dark:text-white",
        // Secondary: Uses semantic color tokens
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 dark:bg-vite-secondary dark:text-white dark:hover:bg-vite-secondary/80",
        // Ghost: Subtle hover with semantic tokens
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-dark-3 dark:hover:text-white",
        // Link: Uses primary color for text
        link: "text-primary underline-offset-4 hover:underline dark:text-brand-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

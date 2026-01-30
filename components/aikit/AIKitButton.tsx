import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const aiKitButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6FED] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // AI Kit Primary - Enhanced gradient with glow effect
        default: "bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A53E4] text-white shadow-lg hover:shadow-xl hover:shadow-[#4B6FED]/30 transform hover:-translate-y-0.5",

        // Destructive - For critical actions
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-sm hover:shadow-md",

        // Outline - AI Kit themed outline
        outline:
          "border-2 border-[#4B6FED]/40 hover:border-[#4B6FED] bg-transparent hover:bg-[#4B6FED]/10 text-white backdrop-blur-sm",

        // Secondary - Purple gradient
        secondary:
          "bg-gradient-to-r from-[#8A63F4] to-[#A78BFA] hover:from-[#7A53E4] hover:to-[#9F7AEA] text-white shadow-sm",

        // Ghost - Minimal style with AI Kit theming
        ghost: "hover:bg-[#4B6FED]/10 hover:text-white text-gray-300",

        // Link - Text link style
        link: "text-[#4B6FED] underline-offset-4 hover:underline hover:text-[#6B8AF8]",

        // Success - For positive actions
        success:
          "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm",

        // Warning - For cautionary actions
        warning:
          "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface AIKitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof aiKitButtonVariants> {
  asChild?: boolean
}

const AIKitButton = React.forwardRef<HTMLButtonElement, AIKitButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(aiKitButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
AIKitButton.displayName = "AIKitButton"

export { AIKitButton, aiKitButtonVariants }

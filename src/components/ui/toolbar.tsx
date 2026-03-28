import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button-shadcn"

// Air Toolbar Component - Based on Figma design specifications
// Two variants: regular and floating with different button sizes
const toolbarVariants = cva(
  [
    "flex items-center",
  ],
  {
    variants: {
      variant: {
        // Regular toolbar - inline placement, no background
        regular: [
          "gap-[2px]", // toolbar/padding/between-buttons from Figma
          "p-0", // toolbar/padding from Figma (all 0)
        ],
        // Floating toolbar - elevated with background, border radius  
        floating: [
          "gap-[2px]", // toolbar/padding/between-buttons from Figma
          "p-[2px]", // toolbar/floating/padding from Figma
          "rounded-[var(--fleet-radius-md)]", // toolbar/floating/corner-radius from Figma
          "bg-[var(--fleet-popup-background)]", // popup/background/default from Figma
          "border border-[var(--fleet-popup-border)]", // popup/border/default from Figma
          "shadow-sm",
        ]
      },
      size: {
        // Default size uses 20x20 buttons (icon size)
        default: "",
        // Large size uses 28x28 buttons (toolbarLg size)
        large: ""
      }
    },
    defaultVariants: {
      variant: "regular",
      size: "default"
    }
  }
)

// Toolbar Separator Component - matches Figma separator specs
const toolbarSeparatorVariants = cva(
  [
    "w-px h-4 flex-shrink-0",
    "bg-[var(--fleet-separator-default)]", // separator/default from Figma
  ]
)

export interface ToolbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toolbarVariants> {
  children: React.ReactNode
}

export interface ToolbarButtonProps {
  icon?: string
  tooltip?: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

export type ToolbarSeparatorProps = React.HTMLAttributes<HTMLDivElement>

// Main Toolbar Component
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        className={cn(toolbarVariants({ variant, size }), className)}
        ref={ref}
        role="toolbar"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === ToolbarButton) {
            return React.cloneElement(child as React.ReactElement<ToolbarButtonProps & { toolbarSize?: "default" | "large" }>, { toolbarSize: size || "default" });
          }
          return child;
        })}
      </div>
    )
  }
)
Toolbar.displayName = "Toolbar"

// Toolbar Button Component - Uses the exact same buttons as in the buttons page
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps & { toolbarSize?: "default" | "large" }>(
  ({ icon, tooltip, className, toolbarSize = "default", children, ...props }, ref) => {
    // Map toolbar size to button size - same as buttons page
    // default (20x20) -> icon, large (28x28) -> toolbarLg
    const buttonSize = toolbarSize === "large" ? "toolbarLg" : "icon"
    
    return (
      <Button
        variant="ghost"
        size={buttonSize}
        className={className}
        iconLeft={icon}
        ref={ref}
        title={tooltip}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
ToolbarButton.displayName = "ToolbarButton"

// Toolbar Separator Component
export const ToolbarSeparator = React.forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(toolbarSeparatorVariants(), className)}
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        {...props}
      />
    )
  }
)
ToolbarSeparator.displayName = "ToolbarSeparator"

// Export variants for customization
export { toolbarVariants, toolbarSeparatorVariants }
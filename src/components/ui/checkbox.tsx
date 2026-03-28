"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"
import { Typography } from "@/components/ui/typography"

interface FleetCheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode
  defaultLabel?: string
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  FleetCheckboxProps
>(({ className, label, defaultLabel = "Checkbox option", children, ...props }, ref) => {
  const displayLabel = label || (defaultLabel && !props.id ? defaultLabel : null)

  return (
    <label className={cn("flex items-center gap-1.5 cursor-pointer", props.disabled && "cursor-not-allowed")}>
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          // Figma: 16x16, corner-radius 2px
          "peer relative size-4 shrink-0 rounded-sm border transition-colors outline-none",
          // Off/Default
          "border-[var(--fleet-checkbox-off-border-default)]",
          "bg-[var(--fleet-checkbox-off-background-default)]",
          // Off/Hovered
          "hover:border-[var(--fleet-checkbox-off-border-hovered)]",
          "hover:bg-[var(--fleet-checkbox-off-background-hovered)]",
          // On/Default
          "data-[state=checked]:bg-[var(--fleet-checkbox-on-background-default)]",
          "data-[state=checked]:border-[var(--fleet-checkbox-on-border-default)]",
          "data-[state=checked]:text-[var(--fleet-checkbox-icon-default)]",
          // On/Hovered
          "data-[state=checked]:hover:bg-[var(--fleet-checkbox-on-background-hovered)]",
          "data-[state=checked]:hover:border-[var(--fleet-checkbox-on-border-hovered)]",
          // Indeterminate (same as checked)
          "data-[state=indeterminate]:bg-[var(--fleet-checkbox-on-background-default)]",
          "data-[state=indeterminate]:border-[var(--fleet-checkbox-on-border-default)]",
          "data-[state=indeterminate]:text-[var(--fleet-checkbox-icon-default)]",
          // Focus: off
          "focus-visible:ring-2 focus-visible:ring-[var(--fleet-checkbox-off-focusOutline)] focus-visible:ring-offset-0",
          // Focus: on
          "data-[state=checked]:focus-visible:ring-[var(--fleet-checkbox-on-focusOutline)]",
          "data-[state=checked]:focus-visible:border-[var(--fleet-checkbox-on-focusBorder)]",
          "data-[state=indeterminate]:focus-visible:ring-[var(--fleet-checkbox-on-focusOutline)]",
          "data-[state=indeterminate]:focus-visible:border-[var(--fleet-checkbox-on-focusBorder)]",
          // Disabled: off
          "disabled:cursor-not-allowed",
          "disabled:border-[var(--fleet-checkbox-off-border-disabled)]",
          "disabled:bg-[var(--fleet-checkbox-off-background-disabled)]",
          // Disabled: on
          "disabled:data-[state=checked]:bg-[var(--fleet-checkbox-on-background-disabled)]",
          "disabled:data-[state=checked]:border-[var(--fleet-checkbox-on-border-disabled)]",
          "disabled:data-[state=checked]:text-[var(--fleet-checkbox-icon-disabled)]",
          "disabled:data-[state=indeterminate]:bg-[var(--fleet-checkbox-on-background-disabled)]",
          "disabled:data-[state=indeterminate]:border-[var(--fleet-checkbox-on-border-disabled)]",
          "disabled:data-[state=indeterminate]:text-[var(--fleet-checkbox-icon-disabled)]",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className="flex items-center justify-center text-current"
        >
          {props.checked === "indeterminate" ? (
            <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="10" height="2" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <Icon fleet="checkbox-checked" size="sm" className="size-3.5" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {displayLabel && (
        <Typography
          as="span"
          variant="default"
          style={{ color: 'var(--fleet-checkbox-text-default)', maxWidth: 400 }}
          className="peer-disabled:text-[var(--fleet-checkbox-text-disabled)]"
        >
          {displayLabel}
        </Typography>
      )}

      {children}
    </label>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

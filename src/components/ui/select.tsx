"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"

// ===== RADIX PRIMITIVES WITH AIR STYLING =====

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />
}

type SelectTriggerSize = "default" | "lg"
type SelectTriggerVariant = "default" | "inline"

const selectTriggerSizes: Record<SelectTriggerSize, string> = {
  // 24px — matches Figma select/field padding: 2px top/bottom, 6px left, 2px right
  default: "h-6 pl-1.5 pr-0.5 py-0.5",
  // 28px — taller variant for pairing with lg buttons
  lg: "h-7 px-2 py-1",
}

function SelectTrigger({
  className,
  children,
  error,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  error?: boolean
  size?: SelectTriggerSize
  variant?: SelectTriggerVariant
}) {
  const isInline = variant === "inline"

  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex items-center justify-between gap-0.5",
        "text-default leading-default tracking-default",
        "rounded-[var(--fleet-radius-sm)] transition-colors outline-none",
        isInline
          ? [
              // Inline: compact, no bg/border by default
              "w-auto pl-1 pr-0.5 py-0.5 border border-transparent bg-transparent",
              error
                ? "border-[var(--fleet-dropdown-border-error)] text-[var(--fleet-dropdown-simple-text-disabled)]"
                : [
                    "text-[var(--fleet-dropdown-simple-text-default)]",
                    "hover:bg-[var(--fleet-dropdown-simple-background-hovered)]",
                    "focus-visible:border-[var(--fleet-dropdown-focusBorder-default)]",
                  ],
              "disabled:text-[var(--fleet-dropdown-simple-text-disabled)]",
            ]
          : [
              // Default: boxed with bg and border
              "w-full",
              selectTriggerSizes[size],
              "border",
              error
                ? [
                    "border-[var(--fleet-dropdown-border-error)]",
                    "bg-[var(--fleet-dropdown-background-error)]",
                    "text-[var(--fleet-dropdown-text-error)]",
                    "hover:border-[var(--fleet-dropdown-border-error)]",
                    "hover:bg-[var(--fleet-dropdown-background-error)]",
                    "focus-visible:border-[var(--fleet-dropdown-focusBorder-error)]",
                    "focus-visible:ring-2",
                    "focus-visible:ring-[var(--fleet-dropdown-focusOutline-error)]",
                    "focus-visible:ring-offset-0",
                  ]
                : [
                    "border-[var(--fleet-dropdown-border-default)]",
                    "bg-[var(--fleet-dropdown-background-default)]",
                    "text-[var(--fleet-dropdown-text-default)]",
                    "hover:border-[var(--fleet-dropdown-border-hovered)]",
                    "hover:bg-[var(--fleet-dropdown-background-hovered)]",
                    "focus-visible:border-[var(--fleet-dropdown-focusBorder-default)]",
                    "focus-visible:ring-2",
                    "focus-visible:ring-[var(--fleet-dropdown-focusOutline-default)]",
                    "focus-visible:ring-offset-0",
                  ],
              "disabled:cursor-not-allowed disabled:opacity-50",
              "disabled:border-[var(--fleet-dropdown-border-disabled)]",
              "disabled:bg-[var(--fleet-dropdown-background-disabled)]",
              "data-[placeholder]:text-[var(--fleet-inputField-hint-default)]",
            ],
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <Icon fleet="chevron-down" size="sm" colorize className="opacity-50 flex-shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "relative z-50 overflow-hidden",
          "min-w-[140px] max-w-[400px]",
          "rounded-[var(--fleet-radius-sm)] border-[0.5px] p-1.5",
          "bg-[var(--fleet-popup-background)]",
          "border-[var(--fleet-popup-border)]",
          "shadow-[var(--fleet-shadow-lg)]",
          "text-default leading-default tracking-default",
          // Animations
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        "px-2 py-1",
        "text-default leading-default tracking-default",
        "text-[var(--fleet-listItem-text-secondary)]",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default items-center",
        "rounded-[var(--fleet-radius-sm)] px-2 py-1 pr-8",
        "min-h-6",
        "text-default leading-default tracking-default",
        "select-none outline-none transition-colors",
        // Default
        "text-[var(--fleet-listItem-text-default)]",
        // Hover & focus — matches context menu item styling
        "hover:bg-[var(--fleet-ghostButton-off-background-hovered)]",
        "focus:bg-[var(--fleet-listItem-background-focused)]",
        "focus:text-[var(--fleet-listItem-text-focused)]",
        "data-[highlighted]:bg-[var(--fleet-listItem-background-focused)]",
        "data-[highlighted]:text-[var(--fleet-listItem-text-focused)]",
        // Disabled
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Icon fleet="checkmark" size="sm" colorize />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn(
        "-mx-1 my-1 h-px",
        "bg-[var(--fleet-separator-default)]",
        className
      )}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <Icon fleet="chevron-up" size="sm" colorize className="opacity-50" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <Icon fleet="chevron-down" size="sm" colorize className="opacity-50" />
    </SelectPrimitive.ScrollDownButton>
  )
}

// ===== HIGH-LEVEL FLEET SELECT =====

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FleetSelectProps {
  options?: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  variant?: SelectTriggerVariant
  size?: SelectTriggerSize
  className?: string
}

const defaultOptions: SelectOption[] = [
  { value: "option-1", label: "Option 1" },
  { value: "option-2", label: "Option 2" },
  { value: "option-3", label: "Option 3" },
]

const FleetSelect = React.forwardRef<HTMLButtonElement, FleetSelectProps>(
  ({
    options: externalOptions,
    value,
    defaultValue,
    onValueChange,
    placeholder = "Select...",
    disabled,
    error,
    variant,
    size,
    className,
  }, ref) => {
    const options = externalOptions ?? defaultOptions

    return (
      <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger ref={ref} className={className} error={error} variant={variant} size={size}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
)
FleetSelect.displayName = "FleetSelect"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  FleetSelect,
}

export { FleetSelect as AirSelect }
export type { FleetSelectProps as AirSelectProps }

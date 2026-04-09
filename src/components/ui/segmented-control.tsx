"use client"

import * as React from "react"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const segmentedControlItemVariants = cva(
  [
    "relative inline-flex items-center justify-center box-border min-w-[60px] max-w-[184px] cursor-pointer select-none outline-none rounded-sm",
    "bg-[var(--fleet-segmentedControl-button-background-default-default)]",
    "text-[var(--fleet-segmentedControl-button-text-default)]",
    "data-[state=checked]:z-[1] data-[state=checked]:bg-[var(--fleet-segmentedControl-button-background-selected-default)] data-[state=checked]:shadow-[inset_0_0_0_1px_var(--fleet-segmentedControl-button-border-default)]",
    "data-[state=checked]:hover:bg-[var(--fleet-segmentedControl-button-background-selected-hovered)] data-[state=checked]:hover:shadow-[inset_0_0_0_1px_var(--fleet-segmentedControl-button-border-hovered)]",
    "focus-visible:z-[2] focus-visible:outline-2 focus-visible:outline-[var(--fleet-button-secondary-focusOutline)] focus-visible:outline-offset-1",
  ],
  {
    variants: {
      size: {
        default: "h-7 px-2 py-1.5",
        small: "h-6 px-2 py-1",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type SegmentedControlSize = "default" | "small"

const SegmentedControlContext = React.createContext<{ size: SegmentedControlSize }>({
  size: "default",
})

export interface SegmentedControlRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "dir"> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  size?: SegmentedControlSize
}

const SegmentedControlRoot = React.forwardRef<HTMLDivElement, SegmentedControlRootProps>(
  ({ value, defaultValue, onChange, size = "default", className, children, ...props }, ref) => (
    <SegmentedControlContext.Provider value={{ size }}>
      <RadioGroup.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onChange}
        className={cn(
          "relative inline-flex items-center rounded-sm bg-[var(--fleet-segmentedControl-background)] before:absolute before:inset-0 before:rounded-sm before:pointer-events-none before:shadow-[inset_0_0_0_1px_var(--fleet-segmentedControl-border)]",
          className
        )}
        {...props}
      >
        {children}
      </RadioGroup.Root>
    </SegmentedControlContext.Provider>
  )
)
SegmentedControlRoot.displayName = "SegmentedControl.Root"

export interface SegmentedControlItemProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "children"> {
  value: string
  icon?: React.ReactNode
  shortcut?: string
  children?: React.ReactNode
}

const SegmentedControlItem = ({
  value,
  icon,
  shortcut,
  children,
  className,
  ...props
}: SegmentedControlItemProps) => {
  const { size } = React.useContext(SegmentedControlContext)

  return (
    <RadioGroup.Item
      value={value}
      className={cn(segmentedControlItemVariants({ size }), className)}
      {...props}
    >
      {icon && (
        <span className="inline-flex items-center justify-center shrink-0 [&_svg]:size-4">
          {icon}
        </span>
      )}
      <span className="flex gap-1 min-w-0 px-1">
        <span className="overflow-hidden whitespace-nowrap text-ellipsis text-default leading-default">
          {children}
        </span>
        {shortcut && (
          <span className="opacity-70 text-default leading-default">{shortcut}</span>
        )}
      </span>
    </RadioGroup.Item>
  )
}
SegmentedControlItem.displayName = "SegmentedControl.Item"

export const SegmentedControl = {
  Root: SegmentedControlRoot,
  Item: SegmentedControlItem,
}

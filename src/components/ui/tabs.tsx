"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon } from "./icon"

// Air Tabs Root Component
const fleetTabsVariants = cva(
  "flex flex-col text-default leading-default font-body-regular tracking-default",
  {
    variants: {
      orientation: {
        horizontal: "flex-col",
        vertical: "flex-row",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

interface FleetTabsProps
  extends Omit<React.ComponentProps<typeof TabsPrimitive.Root>, 'orientation'>,
    VariantProps<typeof fleetTabsVariants> {}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  FleetTabsProps
>(({ className, orientation, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    orientation={orientation || "horizontal"}
    className={cn(fleetTabsVariants({ orientation: orientation || "horizontal" }), className)}
    {...props}
  />
))
Tabs.displayName = TabsPrimitive.Root.displayName

// Air Tabs List Component
const fleetTabsListVariants = cva(
  "inline-flex items-center justify-start",
  {
    variants: {
      orientation: {
        horizontal: "h-10 w-full flex-row gap-1 items-center",
        vertical: "h-auto w-auto flex-col gap-1 items-start",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

interface FleetTabsListProps
  extends Omit<React.ComponentProps<typeof TabsPrimitive.List>, 'orientation'>,
    VariantProps<typeof fleetTabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  FleetTabsListProps
>(({ className, orientation, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(fleetTabsListVariants({ orientation: orientation || "horizontal" }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

// Air Tabs Trigger Component
const fleetTabsTriggerVariants = cva(
  // Air typography foundation + layout - Air specs: 28dp height, 4dp border radius, 8dp horizontal padding
  "text-default leading-default font-body-semibold tracking-default inline-flex items-center justify-center whitespace-nowrap rounded transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 h-7",
  {
    variants: {
      variant: {
        default: [
          "px-2 gap-1",
          "bg-[var(--fleet-tab-background-default)]",
          "border border-[var(--fleet-tab-border-default)]",
          "text-[var(--fleet-tab-text-default)]",
        ],
        file: [
          "px-2 gap-1",
          "bg-[var(--fleet-tab-background-default)]",
          "border border-[var(--fleet-tab-border-default)]",
          "text-[var(--fleet-tab-text-default)]",
        ],
      },
      size: {
        default: "", // Uses base text-default from foundation
        sm: "h-6 px-1.5", // Uses base text-default from foundation
        lg: "h-8 px-3", // Uses base text-default from foundation
      },
      state: {
        default: "",
        selected: [
          "bg-[var(--fleet-tab-background-selected)]",
          "border-[var(--fleet-tab-border-selected)]",
          "text-[var(--fleet-tab-text-selected)]",
          "font-semibold",
        ],
        selectedFocused: [
          "bg-[var(--fleet-tab-background-selectedFocused)]",
          "border-[var(--fleet-tab-border-selectedFocused)]",
          "text-[var(--fleet-tab-text-selectedFocused)]",
          "font-semibold",
          "focus-visible:ring-[var(--fleet-tab-focusOutline-dragAndDrop)]",
        ],
        deselected: [
          "bg-[var(--fleet-tab-background-default)]",
          "border-[var(--fleet-tab-border-default)]",
          "text-[var(--fleet-tab-text-default)]",
          "opacity-70",
        ],
      },
    },
    compoundVariants: [],
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

interface FleetTabsTriggerProps
  extends React.ComponentProps<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof fleetTabsTriggerVariants> {
  /** Show modified indicator dot */
  isModified?: boolean
  /** Show close button */
  closable?: boolean
  /** Close button click handler */
  onClose?: (e: React.MouseEvent) => void
  /** Counter/badge number */
  counter?: number
  /** Tab icon */
  icon?: React.ReactNode
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  FleetTabsTriggerProps
>(({ className, variant, size, state, isModified, closable, onClose, counter, icon, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      fleetTabsTriggerVariants({ variant, size, state }),
      // Use Air CSS variables for states handled by Radix
      "data-[state=active]:bg-[var(--fleet-tab-background-selected)]",
      "data-[state=active]:border-[var(--fleet-tab-border-selected)]",
      "data-[state=active]:text-[var(--fleet-tab-text-selected)]",
      "data-[state=inactive]:bg-[var(--fleet-tab-background-default)]",
      "data-[state=inactive]:border-[var(--fleet-tab-border-default)]",
      "data-[state=inactive]:text-[var(--fleet-tab-text-default)]",
      "data-[state=inactive]:hover:bg-[var(--fleet-tab-background-selected)]",
      "data-[state=inactive]:hover:text-[var(--fleet-tab-text-selected)]",
      "focus-visible:ring-[var(--fleet-tab-focusOutline-dragAndDrop)]",
      className
    )}
    {...props}
  >
    <>
      {/* Icon */}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      
      {/* Content with modified indicator inline */}
      <span className="truncate flex items-center gap-1">
        {children}
        {/* Modified indicator */}
        {isModified && (
          <span className="w-1.5 h-1.5 bg-[var(--fleet-tab-text-default)] rounded-full inline-block" />
        )}
      </span>
      
      {/* Counter */}
      {counter !== undefined && (
        <span className="px-1 h-[18px] text-xs text-[var(--fleet-tab-text-selected)] bg-[var(--fleet-search-counter-background)] rounded-[15px] flex items-center justify-center min-w-[18px]">
          {counter}
        </span>
      )}
      
      {/* Close button */}
      {closable && (
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.(e)
          }}
          className="h-4 w-4 p-0 min-w-4 min-h-4 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Close tab"
        >
          <Icon fleet="close-small" size="sm" />
        </span>
      )}
    </>
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Air Tabs Content Component
const fleetTabsContentVariants = cva(
  "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
)

interface FleetTabsContentProps
  extends React.ComponentProps<typeof TabsPrimitive.Content>,
    VariantProps<typeof fleetTabsContentVariants> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  FleetTabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(fleetTabsContentVariants(), className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Convenient component variants for common usage patterns
const DefaultTabs = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  FleetTabsProps
>(({ ...props }, ref) => (
  <Tabs ref={ref} {...props} />
))
DefaultTabs.displayName = "DefaultTabs"

const VerticalTabs = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  FleetTabsProps
>(({ ...props }, ref) => (
  <Tabs ref={ref} orientation="vertical" {...props} />
))
VerticalTabs.displayName = "VerticalTabs"

// Specialized Tab Variants based on Air Gallery

// File Tab - Tab with file icon, close button, and optional modified indicator
interface FileTabProps extends Omit<FleetTabsTriggerProps, 'variant'> {
  filename: string
  fileIcon?: React.ReactNode
  isModified?: boolean
  onClose?: (e: React.MouseEvent) => void
}

const FileTab = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  FileTabProps
>(({ filename, fileIcon, isModified, onClose, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    variant="file"
    icon={fileIcon}
    isModified={isModified}
    closable={true}
    onClose={onClose}
    {...props}
  >
    {filename}
  </TabsTrigger>
))
FileTab.displayName = "FileTab"

// Counter Tab - Tab with badge/counter
interface CounterTabProps extends FleetTabsTriggerProps {
  count: number
}

const CounterTab = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  CounterTabProps
>(({ count, children, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    counter={count}
    {...props}
  >
    {children}
  </TabsTrigger>
))
CounterTab.displayName = "CounterTab"

// Icon Tab - Tab with icon
interface IconTabProps extends FleetTabsTriggerProps {
  icon: React.ReactNode
}

const IconTab = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  IconTabProps
>(({ icon, children, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    icon={icon}
    {...props}
  >
    {children}
  </TabsTrigger>
))
IconTab.displayName = "IconTab"

export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  DefaultTabs,
  VerticalTabs,
  FileTab,
  CounterTab,
  IconTab,
  fleetTabsVariants,
  fleetTabsListVariants,
  fleetTabsTriggerVariants,
  fleetTabsContentVariants,
  type FleetTabsProps,
  type FleetTabsListProps,
  type FleetTabsTriggerProps,
  type FleetTabsContentProps,
  type FileTabProps,
  type CounterTabProps,
  type IconTabProps,
}

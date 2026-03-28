"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"

// ===== VARIANTS =====

const toolSidebarVariants = cva(
  "flex flex-col justify-between rounded-[var(--fleet-radius-md)] w-[32px] overflow-clip",
  {
    variants: {
      variant: {
        default: "bg-[var(--fleet-island-background)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const toolSidebarButtonVariants = cva(
  // Figma: Ghost Button — border 1px transparent, padding 6px, icon 16px → total 28px with border-box
  "flex items-center justify-center p-[5px] border border-transparent rounded-[var(--fleet-radius-sm)] cursor-pointer transition-colors",
  {
    variants: {
      active: {
        true: "bg-transparent",
        false: "bg-transparent hover:bg-[var(--fleet-ghostButton-off-background-hovered)]",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

// ===== TYPES =====

export interface ToolSidebarItem {
  id: string
  icon: string
  tooltip?: string
  lucideIcon?: string
}

export interface ToolSidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toolSidebarVariants> {
  topItems?: ToolSidebarItem[]
  bottomItems?: ToolSidebarItem[]
  activeItem?: string | null
  onItemClick?: (id: string) => void
  showRunningIndicator?: boolean
  runningItemId?: string
}

// ===== DEFAULT DATA =====

const defaultTopItems: ToolSidebarItem[] = [
  { id: "files", icon: "folder", tooltip: "Files" },
  { id: "search", icon: "search", tooltip: "Search" },
  { id: "review", icon: "vcs-diff", tooltip: "Review" },
  { id: "history", icon: "vcs-history", tooltip: "History" },
  { id: "comments", icon: "file-scan", lucideIcon: "MessageSquare", tooltip: "Comments" },
  { id: "terminal", icon: "terminal", tooltip: "Terminal" },
]

const defaultBottomItems: ToolSidebarItem[] = [
  { id: "goto", icon: "search", lucideIcon: "Search", tooltip: "Go to" },
  { id: "notifications", icon: "notifications", tooltip: "Notifications" },
  { id: "snapshots", icon: "ai-snapshot", tooltip: "Snapshots" },
  { id: "settings", icon: "settings", tooltip: "Settings" },
]

// ===== COMPONENTS =====

const ToolSidebarButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    item: ToolSidebarItem
    active?: boolean
    showRunning?: boolean
  }
>(({ item, active = false, showRunning = false, className, ...props }, ref) => (
  <button
    ref={ref}
    title={item.tooltip}
    className={cn(toolSidebarButtonVariants({ active }), "relative", className)}
    {...props}
  >
    {item.lucideIcon ? (
      <Icon
        lucide={item.lucideIcon as any}
        size="sm"
        colorize
        style={{ color: active ? "var(--fleet-icon-primary)" : "var(--fleet-icon-secondary)" }}
      />
    ) : (
      <Icon
        fleet={item.icon}
        size="sm"
        colorize
        style={{ color: active ? "var(--fleet-icon-primary)" : "var(--fleet-icon-secondary)" }}
      />
    )}
    {showRunning && (
      <span className="absolute top-0.5 right-0.5 size-[6px] rounded-full bg-[var(--fleet-text-accent)]" />
    )}
  </button>
))
ToolSidebarButton.displayName = "ToolSidebarButton"

const ToolSidebarSeparator = () => (
  // Figma: rotated Separator, container 28×5px, line 20px wide × 1px
  <div className="flex items-center justify-center w-full py-0.5">
    <div className="w-[20px] h-px bg-[var(--fleet-separator-default)]" />
  </div>
)

const ToolSidebar = React.forwardRef<HTMLDivElement, ToolSidebarProps>(
  (
    {
      className,
      variant,
      topItems: externalTopItems,
      bottomItems: externalBottomItems,
      activeItem: externalActiveItem,
      onItemClick: externalOnItemClick,
      showRunningIndicator = false,
      runningItemId = "terminal",
      ...props
    },
    ref
  ) => {
    const [internalActiveItem, setInternalActiveItem] = React.useState<string | null>("files")

    const topItems = externalTopItems ?? defaultTopItems
    const bottomItems = externalBottomItems ?? defaultBottomItems
    const activeItem = externalActiveItem !== undefined ? externalActiveItem : internalActiveItem

    const handleItemClick = (id: string) => {
      if (externalOnItemClick) {
        externalOnItemClick(id)
      } else {
        setInternalActiveItem(activeItem === id ? null : id)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(toolSidebarVariants({ variant }), className)}
        {...props}
      >
        {/* Top section */}
        <div className="flex flex-col gap-1 items-center p-0.5">
          {topItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {/* Separator before terminal (after comments) */}
              {index === topItems.length - 1 && topItems.length > 1 && (
                <ToolSidebarSeparator />
              )}
              <ToolSidebarButton
                item={item}
                active={activeItem === item.id}
                showRunning={showRunningIndicator && item.id === runningItemId}
                onClick={() => handleItemClick(item.id)}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-1 items-center p-0.5">
          {bottomItems.map((item) => (
            <ToolSidebarButton
              key={item.id}
              item={item}
              active={activeItem === item.id}
              showRunning={showRunningIndicator && item.id === runningItemId}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </div>
      </div>
    )
  }
)
ToolSidebar.displayName = "ToolSidebar"

export {
  ToolSidebar,
  ToolSidebarButton,
  ToolSidebarSeparator,
  toolSidebarVariants,
  toolSidebarButtonVariants,
  defaultTopItems,
  defaultBottomItems,
}

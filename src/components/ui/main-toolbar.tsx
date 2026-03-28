"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"

// ===== FIGMA: Main Toolbar =====
// Types: Task, Project, Startup Screen
// Layout: Left Toolbar (macOS buttons + toolbar buttons + separator + workspace/branch/task) | Right Toolbar (progress? + tool panel)

// ===== VARIANTS =====

const mainToolbarVariants = cva(
  // Figma: bg=#090909, flex, items-center, justify-between, pl=4px, pr=2px, py=8px
  "flex items-center justify-between w-full",
  {
    variants: {
      type: {
        task: "",
        project: "",
        startup: "",
      },
    },
    defaultVariants: {
      type: "task",
    },
  }
)

const separatorVariants = cva(
  // Figma: separator/default, toolbar/separator/padding
  "w-px self-stretch",
  {
    variants: {
      height: {
        default: "",
        full: "h-full",
      },
    },
    defaultVariants: {
      height: "default",
    },
  }
)

// ===== TYPES =====

export interface MainToolbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mainToolbarVariants> {
  projectName?: string
  branchName?: string
  taskBranch?: string
  taskName?: string
  taskIcon?: string
  taskTargetIcon?: string
  progress?: React.ReactNode
  showProgress?: boolean
  leftExtra?: React.ReactNode
  rightExtra?: React.ReactNode
  onLeftPanelToggle?: () => void
  leftPanelActive?: boolean
  onRightPanelToggle?: () => void
  rightPanelActive?: boolean
  children?: React.ReactNode
}

export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string
  tooltip?: string
  active?: boolean
  children?: React.ReactNode
}

export interface ToolbarSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {}

export interface WorkspaceWidgetProps {
  projectName?: string
  branchName?: string
  className?: string
}

export interface ProgressWidgetProps {
  visible?: boolean
  text?: string
  hint?: string
  className?: string
}

// ===== GHOST BUTTON (Figma: Ghost Button) =====
// Figma: padding 6px, corner-radius 4px, gap 4px, bg transparent, border transparent

const GhostButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ className, icon, tooltip, active, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center gap-1 rounded-[var(--fleet-radius-sm)] p-1.5 transition-colors",
          "bg-transparent border border-transparent",
          "hover:bg-[var(--fleet-ghostButton-off-background-hovered)]",
          active && "bg-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        title={tooltip}
        {...props}
      >
        {icon && <Icon fleet={icon} size="sm" />}
        {children}
      </button>
    )
  }
)
GhostButton.displayName = "GhostButton"

// ===== TOOLBAR BUTTON (Figma: Toolbar > Ghost Button wrapper) =====

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ className, icon, tooltip, active, children, ...props }, ref) => {
    return (
      <GhostButton
        ref={ref}
        icon={icon}
        tooltip={tooltip}
        active={active}
        className={className}
        {...props}
      >
        {children}
      </GhostButton>
    )
  }
)
ToolbarButton.displayName = "ToolbarButton"

// ===== TOOLBAR SEPARATOR (Figma: separator/default=#ffffff21, padding 2px h, 4px v) =====

export const ToolbarSeparator = React.forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  ({ className, height, ...props }, ref) => {
    return (
      <div
        className={cn("flex items-stretch px-0.5 py-1 self-stretch", className)}
        ref={ref}
        {...props}
      >
        <div
          className={cn(separatorVariants({ height }), "h-full")}
          style={{ background: 'var(--fleet-separator-default)' }}
        />
      </div>
    )
  }
)
ToolbarSeparator.displayName = "ToolbarSeparator"

// ===== MAIN TOOLBAR BUTTON (Figma: _Main Toolbar Button) =====
// Used for workspace, branch, and task text buttons in the toolbar
// Figma specs: max-width 422px, padding 4px, corner-radius 4px, gap 6px (icon+text), gap 4px (inner)
// Uses ghostButton semantic tokens for all states

const mainToolbarButtonVariants = cva(
  [
    "flex items-center max-w-[422px] rounded-[var(--fleet-radius-sm)] transition-colors cursor-pointer",
    "border border-transparent",
  ].join(" "),
  {
    variants: {
      size: {
        default: "px-1 py-1 gap-1.5",  // 4px padding, 6px gap
        compact: "px-0.5 py-0.5 gap-1", // 2px padding, 4px gap
      },
      variant: {
        default: [
          "bg-[var(--fleet-ghostButton-off-background-default)]",
          "hover:bg-[var(--fleet-ghostButton-off-background-hovered)]",
          "active:bg-[var(--fleet-ghostButton-off-background-pressed)]",
        ].join(" "),
        muted: [
          "bg-[var(--fleet-ghostButton-off-background-default)]",
          "hover:bg-[var(--fleet-ghostButton-off-background-hovered)]",
          "active:bg-[var(--fleet-ghostButton-off-background-pressed)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface MainToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mainToolbarButtonVariants> {
  icon?: React.ReactNode
  trailingIcon?: React.ReactNode
  textVariant?: "bold" | "regular" | "disabled"
}

const MainToolbarButton = React.forwardRef<HTMLButtonElement, MainToolbarButtonProps>(
  ({ variant = "default", size = "default", textVariant = "regular", children, icon, trailingIcon, className, disabled, ...props }, ref) => {
    const isDisabled = disabled || textVariant === "disabled"

    const textColor = isDisabled
      ? "var(--fleet-ghostButton-off-text-disabled)"
      : "var(--fleet-ghostButton-off-text-default)"

    const hoverTextColor = isDisabled
      ? undefined
      : "var(--fleet-ghostButton-off-text-hovered)"

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          mainToolbarButtonVariants({ variant, size }),
          isDisabled && "cursor-default",
          "group/mtb",
          className
        )}
        {...props}
      >
        {icon && (
          <span className="flex-shrink-0 flex items-center justify-center size-5">
            {icon}
          </span>
        )}
        <Typography
          variant="header-3-semibold"
          className="whitespace-nowrap truncate"
          style={{
            color: textColor,
            fontWeight: textVariant === "bold" ? 600 : undefined,
            // @ts-expect-error CSS custom property for hover
            "--hover-color": hoverTextColor,
          }}
        >
          {children}
        </Typography>
        {trailingIcon && (
          <span className="flex-shrink-0 flex items-center justify-center">
            {trailingIcon}
          </span>
        )}
      </button>
    )
  }
)
MainToolbarButton.displayName = "MainToolbarButton"

// ===== WORKSPACE WIDGET (Figma: _Workspace & Branch) =====
// Figma: workspace name (bold disabled) + branch icon + branch name

export const WorkspaceWidget = React.forwardRef<HTMLDivElement, WorkspaceWidgetProps>(
  ({ projectName = "pet-store", branchName = "main", className }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center gap-0.5", className)}>
        <MainToolbarButton textVariant="disabled">
          {projectName}
        </MainToolbarButton>
        <div className="flex-shrink-0 size-5 flex items-center justify-center">
          <Icon fleet="branch" size="sm" className="opacity-35" />
        </div>
        <MainToolbarButton textVariant="disabled">
          {branchName}
        </MainToolbarButton>
      </div>
    )
  }
)
WorkspaceWidget.displayName = "WorkspaceWidget"

// ===== PROGRESS WIDGET =====

export const ProgressWidget = React.forwardRef<HTMLDivElement, ProgressWidgetProps>(
  ({ visible = false, text = "", hint = "", className }, ref) => {
    if (!visible) return null

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-sm", className)}
      >
        <Icon fleet="indexing-progress" size="sm" />
        <div className="flex items-center gap-1">
          <Typography variant="default" style={{ color: 'var(--fleet-progress-label)' }}>
            {text}
          </Typography>
          {hint && (
            <Typography variant="default" style={{ color: 'var(--fleet-progress-hint)' }}>
              {hint}
            </Typography>
          )}
        </div>
      </div>
    )
  }
)
ProgressWidget.displayName = "ProgressWidget"

// ===== MAIN TOOLBAR =====

export const MainToolbar = React.forwardRef<HTMLDivElement, MainToolbarProps>(
  ({
    className,
    type = "task",
    projectName = "pet-store",
    branchName,
    taskBranch = "air/add-item-search-2546",
    taskName = "Add item search to catalogue page",
    taskIcon = "task-draft",
    taskTargetIcon = "configure",
    progress,
    showProgress = false,
    leftExtra,
    rightExtra,
    onLeftPanelToggle,
    leftPanelActive,
    onRightPanelToggle,
    rightPanelActive,
    children,
    ...props
  }, ref) => {
    // Default branch based on type
    const resolvedBranch = branchName ?? (type === "task" ? taskBranch : "main")

    if (children) {
      return (
        <div
          className={cn(mainToolbarVariants({ type }), "p-2", className)}
          style={{ background: 'var(--fleet-background-primary)' }}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    return (
      <div
        className={cn(mainToolbarVariants({ type }), "p-2", className)}
        style={{ background: 'var(--fleet-background-primary)' }}
        ref={ref}
        {...props}
      >
        {/* Left Toolbar */}
        <div className="flex items-center shrink-0">
          {type !== "startup" && (
            <div className="flex items-center gap-1">
              {/* _Left Toolbar: macOS buttons placeholder + toolbar buttons */}
              <div className="flex items-center gap-3">
                {/* macOS traffic light buttons placeholder */}
                <div className="flex items-center gap-2 w-[52px] h-3">
                  <div className="size-3 rounded-full bg-[#FF5F57]" />
                  <div className="size-3 rounded-full bg-[#FEBC2E]" />
                  <div className="size-3 rounded-full bg-[#28C840]" />
                </div>

                {/* Toolbar buttons */}
                <div className="flex items-center gap-1">
                  <ToolbarButton icon={leftPanelActive ? "panel-left-open" : "panel-left-closed"} tooltip="Left panel" active={leftPanelActive} onClick={onLeftPanelToggle} />
                  <ToolbarButton icon="panel-chat-open" tooltip="Chat" />
                  <ToolbarButton icon="add" tooltip="Add task" />
                  <ToolbarSeparator />
                </div>
              </div>

              {/* Task/Project header */}
              {type === "task" && (
                <div className="flex items-center gap-1">
                  <WorkspaceWidget
                    projectName={projectName}
                    branchName={resolvedBranch}
                  />
                  <Typography
                    variant="header-3-semibold"
                    style={{ color: 'var(--fleet-text-disabled)' }}
                  >
                    /
                  </Typography>
                  <MainToolbarButton
                    icon={
                      <div className="size-5 flex items-center justify-center">
                        <Icon fleet={taskIcon} size="sm" />
                      </div>
                    }
                    trailingIcon={
                      <Icon fleet={taskTargetIcon} size="sm" className="opacity-60" />
                    }
                  >
                    {taskName}
                  </MainToolbarButton>
                </div>
              )}

              {type === "project" && (
                <WorkspaceWidget
                  projectName={projectName}
                  branchName={resolvedBranch}
                />
              )}

              {leftExtra}
            </div>
          )}

          {type === "startup" && (
            <div className="flex items-center gap-2 w-[52px] h-3">
              <div className="size-3 rounded-full bg-[#FF5F57]" />
              <div className="size-3 rounded-full bg-[#FEBC2E]" />
              <div className="size-3 rounded-full bg-[#28C840]" />
            </div>
          )}
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center gap-3 shrink-0">
          {showProgress && progress}

          {rightExtra}

          <div className="flex items-center">
            {type !== "startup" && (
              <ToolbarButton icon={rightPanelActive ? "panel-right-open" : "panel-right-closed"} tooltip="Tool panel" active={rightPanelActive} onClick={onRightPanelToggle} />
            )}
            {type === "startup" && (
              <div className="w-7 h-7" />
            )}
          </div>
        </div>
      </div>
    )
  }
)
MainToolbar.displayName = "MainToolbar"

// Pre-built toolbar sections
export const LeftToolbarSection = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">{children}</div>
)

export const RightToolbarSection = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">{children}</div>
)

// Export variants and components
export { MainToolbarButton, mainToolbarVariants, mainToolbarButtonVariants, separatorVariants }

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"

// ===== App Toolbar =====
// Simplified toolbar for web app layouts — no macOS traffic lights, no right panel toggle.
// Shows workspace/branch info and optional task, with slots for extra content.

export interface AppToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  projectName?: string
  branchName?: string
  taskName?: string
  taskIcon?: string
  leftExtra?: React.ReactNode
  rightExtra?: React.ReactNode
}

export const AppToolbar = React.forwardRef<HTMLDivElement, AppToolbarProps>(
  ({
    className,
    projectName,
    branchName,
    taskName,
    taskIcon = "task-draft",
    leftExtra,
    rightExtra,
    children,
    ...props
  }, ref) => {
    if (children) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center justify-between w-full px-2 py-2.5 shrink-0", className)}
          style={{ background: "var(--fleet-background-primary)" }}
          {...props}
        >
          {children}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between w-full px-2 py-2.5 shrink-0", className)}
        style={{ background: "var(--fleet-background-primary)" }}
        {...props}
      >
        {/* Left */}
        <div className="flex items-center gap-0.5 min-w-0">
          {projectName && (
            <Typography
              variant="default-semibold"
              className="shrink-0"
              style={{ color: "var(--fleet-ghostButton-off-text-disabled)" }}
            >
              {projectName}
            </Typography>
          )}
          {branchName && (
            <>
              <div className="shrink-0 size-5 flex items-center justify-center">
                <Icon fleet="branch" size="sm" className="opacity-35" />
              </div>
              <Typography
                variant="default-semibold"
                className="shrink-0"
                style={{ color: "var(--fleet-ghostButton-off-text-disabled)" }}
              >
                {branchName}
              </Typography>
            </>
          )}
          {taskName && (
            <>
              <Typography
                variant="default-semibold"
                className="shrink-0 px-1"
                style={{ color: "var(--fleet-text-disabled)" }}
              >
                /
              </Typography>
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon fleet={taskIcon} size="sm" className="shrink-0" />
                <Typography variant="default-semibold" className="truncate">
                  {taskName}
                </Typography>
              </div>
            </>
          )}
          {leftExtra}
        </div>

        {/* Right */}
        {rightExtra && (
          <div className="flex items-center gap-2 shrink-0">
            {rightExtra}
          </div>
        )}
      </div>
    )
  }
)
AppToolbar.displayName = "AppToolbar"

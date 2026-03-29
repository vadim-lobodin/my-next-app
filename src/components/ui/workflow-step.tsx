"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"

// ===== Workflow Step =====
// Timeline-style step with status icon and connecting line.
// States: done (positive), in-progress (info), todo (neutral)

export type WorkflowStepStatus = "done" | "in-progress" | "todo"

export interface WorkflowStepProps {
  title: string
  /** Secondary text displayed on the right (e.g. file name) */
  hint?: string
  status?: WorkflowStepStatus
  /** Whether this is the last step (hides the connecting line below) */
  isLast?: boolean
  className?: string
  onClick?: () => void
}

const statusConfig: Record<WorkflowStepStatus, { icon: string; animate?: boolean }> = {
  done: { icon: "task-completed" },
  "in-progress": { icon: "progress", animate: true },
  todo: { icon: "task-draft" },
}

const lineColors: Record<WorkflowStepStatus, string> = {
  done: "var(--fleet-banner-border-positive, #255a44)",
  "in-progress": "var(--fleet-border-disabled, rgba(255,255,255,0.11))",
  todo: "var(--fleet-border-disabled, rgba(255,255,255,0.11))",
}

export const WorkflowStep = React.forwardRef<HTMLDivElement, WorkflowStepProps>(
  ({ title, hint, status = "todo", isLast = false, className, onClick }, ref) => {
    const config = statusConfig[status]
    const lineColor = lineColors[status]

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-2 items-start",
          onClick && "cursor-pointer",
          className,
        )}
        onClick={onClick}
      >
        {/* Status icon */}
        <div className="flex items-center w-4 shrink-0 mt-[3px]">
          <Icon
            fleet={config.icon}
            size="sm"
            className={cn("shrink-0", config.animate && "animate-spin")}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <Typography variant="default-semibold">
            {title}
          </Typography>
          {hint && (
            <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>
              {hint}
            </Typography>
          )}
        </div>
      </div>
    )
  }
)
WorkflowStep.displayName = "WorkflowStep"

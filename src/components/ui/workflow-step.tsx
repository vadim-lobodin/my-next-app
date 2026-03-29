"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"

// ===== Workflow Step =====
// Timeline-style step with status icon.
// States: done (positive), in-progress (info), todo (neutral)

export type WorkflowStepStatus = "done" | "in-progress" | "todo"

export interface WorkflowStepProps {
  title: string
  /** Secondary text displayed on the right (e.g. file name) */
  hint?: string
  status?: WorkflowStepStatus
  /** Whether this is the last step */
  isLast?: boolean
  /** Whether this step is currently selected */
  isActive?: boolean
  className?: string
  onClick?: () => void
}

const statusConfig: Record<WorkflowStepStatus, { icon: string; animate?: boolean }> = {
  done: { icon: "task-completed" },
  "in-progress": { icon: "progress", animate: true },
  todo: { icon: "task-draft" },
}

export const WorkflowStep = React.forwardRef<HTMLDivElement, WorkflowStepProps>(
  ({ title, hint, status = "todo", isLast = false, isActive = false, className, onClick }, ref) => {
    const config = statusConfig[status]

    return (
      <motion.div
        ref={ref}
        className={cn(
          "flex relative group",
          onClick && "cursor-pointer",
          className,
        )}
        onClick={onClick}
      >
        {/* Hover background — CSS-driven since it's on the parent */}
        {!isActive && (
          <div
            className="absolute inset-0 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ background: "var(--fleet-listItem-background-hovered)" }}
          />
        )}

        {/* Active background indicator */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-[4px]"
              style={{ background: "var(--fleet-listItem-background-focused)" }}
              layoutId="workflow-step-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 700, damping: 40 }}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0 relative z-[1]">
          <div className="flex items-center gap-2">
            <Icon
              fleet={config.icon}
              size="sm"
              className={cn("shrink-0", config.animate && "animate-spin")}
            />
            <Typography variant="default-semibold">
              {title}
            </Typography>
          </div>
          {hint && (
            <Typography variant="default" className="pl-[24px]" style={{ color: "var(--fleet-text-secondary)" }}>
              {hint}
            </Typography>
          )}
        </div>
      </motion.div>
    )
  }
)
WorkflowStep.displayName = "WorkflowStep"

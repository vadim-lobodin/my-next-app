"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"

// ===== FIGMA: Workflow Step =====
// States: done (positive), in-progress (info), todo (inline/neutral)
// Layout: [status icon] [title + optional hint] [spacer] [agent tag]
// Figma: rounded 8px, padding 12px, gap 8px between icon and text

export type WorkflowStepStatus = "done" | "in-progress" | "todo"

export interface WorkflowStepProps {
  title: string
  hint?: string
  status?: WorkflowStepStatus
  /** Agent name displayed in tag on the right */
  agent?: string
  /** Fleet icon name for the agent (e.g. "codex", "claude-code") */
  agentIcon?: string
  className?: string
  onClick?: () => void
}

const stepVariants = cva(
  "flex items-start justify-between p-3 rounded-lg w-full border transition-[filter] duration-150 hover:brightness-[1.15]",
  {
    variants: {
      status: {
        done: "",
        "in-progress": "",
        todo: "",
      },
    },
    defaultVariants: {
      status: "todo",
    },
  }
)

const statusConfig: Record<WorkflowStepStatus, { icon: string; animate?: boolean }> = {
  done: { icon: "task-completed" },
  "in-progress": { icon: "progress", animate: true },
  todo: { icon: "run" },
}

const statusStyles: Record<WorkflowStepStatus, { background: string; border: string }> = {
  done: {
    background: "var(--fleet-banner-background-positive)",
    border: "var(--fleet-banner-border-positive)",
  },
  "in-progress": {
    background: "var(--fleet-banner-background-info)",
    border: "var(--fleet-banner-border-info)",
  },
  todo: {
    background: "var(--fleet-banner-inline-background, rgba(255,255,255,0.09))",
    border: "var(--fleet-border-disabled, rgba(255,255,255,0.11))",
  },
}

export const WorkflowStep = React.forwardRef<HTMLDivElement, WorkflowStepProps>(
  ({ title, hint, status = "todo", agent, agentIcon, className, onClick }, ref) => {
    const config = statusConfig[status]
    const styles = statusStyles[status]

    return (
      <div
        ref={ref}
        className={cn(
          stepVariants({ status }),
          onClick && "cursor-pointer",
          className,
        )}
        style={{
          background: styles.background,
          borderColor: styles.border,
        }}
        onClick={onClick}
      >
        {/* Left: icon + title + hint */}
        <div className="flex flex-1 gap-2 items-start min-w-0">
          <div className="flex items-center pt-0.5 shrink-0">
            <Icon
              fleet={config.icon}
              size="sm"
              className={config.animate ? "animate-spin" : ""}
            />
          </div>
          <div className="flex flex-1 gap-2 items-center min-w-0 flex-wrap">
            <Typography variant="header-3-semibold" className="shrink-0">
              {title}
            </Typography>
            {hint && (
              <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>
                {hint}
              </Typography>
            )}
          </div>
        </div>

        {/* Right: agent tag */}
        {agent && (
          <div className="flex items-start shrink-0 ml-2">
            <div
              className="flex gap-[var(--fleet-tag-horizontal-gap,2px)] items-center px-1 py-px rounded-[var(--fleet-tag-corner-radius,4px)]"
              style={{
                border: "1px solid var(--fleet-tag-default-border)",
              }}
            >
              {agentIcon && (
                <Icon fleet={agentIcon} size="sm" />
              )}
              <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>
                {agent}
              </Typography>
            </div>
          </div>
        )}
      </div>
    )
  }
)
WorkflowStep.displayName = "WorkflowStep"

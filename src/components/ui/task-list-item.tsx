"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"

// ===== FIGMA: Task List Item =====
// Statuses: Draft, Running, Input Required, Review Required, Done, Canceled, Problem, Suspended
// Layout: List Item Detailed — icon + text column (heading + subtext with optional modified lines)
// Figma vars: corner-radius 6px, padding 8/4/4/4, icon-to-text gap 4px, icon top-padding 2px

export type TaskStatus =
  | "draft"
  | "running"
  | "input-required"
  | "review-required"
  | "done"
  | "canceled"
  | "problem"
  | "suspended"

export interface TaskListItemProps {
  title?: string
  description?: string
  status?: TaskStatus
  additions?: number
  deletions?: number
  className?: string
  onClick?: () => void
  selected?: boolean
}

const statusConfig: Record<TaskStatus, { icon: string; defaultTitle: string; defaultDescription: string }> = {
  "draft": { icon: "task-draft", defaultTitle: "Untitled task", defaultDescription: "Draft" },
  "running": { icon: "progress", defaultTitle: "Add item search to catalogue page", defaultDescription: "Updating the settings page for better navigation." },
  "input-required": { icon: "task-user-input", defaultTitle: "Add item search to catalogue page", defaultDescription: "Input required" },
  "review-required": { icon: "task-on-review", defaultTitle: "Add item search to catalogue page", defaultDescription: "Review requested" },
  "done": { icon: "task-completed", defaultTitle: "Add item search to catalogue page", defaultDescription: "Done" },
  "canceled": { icon: "task-canceled", defaultTitle: "Add item search to catalogue page", defaultDescription: "Canceled" },
  "problem": { icon: "task-error", defaultTitle: "Add item search to catalogue page", defaultDescription: "Problem" },
  "suspended": { icon: "task-canceled", defaultTitle: "Add item search to catalogue page", defaultDescription: "Suspended" },
}

export const TaskListItem = React.forwardRef<HTMLDivElement, TaskListItemProps>(
  ({
    title,
    description,
    status = "draft",
    additions,
    deletions,
    className,
    onClick,
    selected = false,
  }, ref) => {
    const config = statusConfig[status]
    const displayTitle = title ?? config.defaultTitle
    const displayDescription = description ?? config.defaultDescription

    return (
      <div
        ref={ref}
        className={cn("flex h-12 items-start w-full cursor-pointer", className)}
        onClick={onClick}
      >
        {/* Figma: List Item Detailed — bg transparent, rounded 6px, padding 4/8/4/4, gap 4px */}
        <div
          className="flex flex-1 gap-1 items-start min-h-0 min-w-0 overflow-clip relative rounded-[var(--fleet-radius-md)] transition-colors hover:bg-[var(--fleet-listItem-background-hovered)] pl-2 pr-1 py-1"
          style={{
            ...(selected && { background: 'var(--fleet-listItem-background-focused)' }),
          }}
        >

          {/* Figma: Icon with 2px top padding */}
          <div className="flex items-center pt-0.5 relative shrink-0">
            <Icon fleet={config.icon} size="sm" />
          </div>

          {/* Figma: Text column — gap 2px, padding-left 2px */}
          <div className="flex flex-1 flex-col gap-0.5 items-start min-h-0 min-w-0 overflow-clip pl-0.5 relative">
            {/* Heading row — 20px height */}
            <div className="flex gap-0.5 h-5 items-center shrink-0 w-full">
              <div className="flex flex-1 gap-1 items-center min-h-0 min-w-0 pr-0.5">
                <Typography
                  variant="default"
                  className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ color: 'var(--fleet-text-primary)' }}
                >
                  {displayTitle}
                </Typography>
              </div>
            </div>

            {/* Subtext row — description + modified lines inline */}
            <div className="flex gap-1 items-center pb-0.5 pr-0.5 shrink-0 w-full overflow-hidden">
              <Typography
                variant="medium"
                className="shrink-0 whitespace-nowrap"
                style={{ color: 'var(--fleet-text-secondary)' }}
              >
                {displayDescription}
              </Typography>

              {/* Modified lines — Figma: Medium style, git colors, inline after description */}
              {(additions !== undefined || deletions !== undefined) && (
                <div className="flex items-center gap-1 shrink-0">
                  {additions !== undefined && additions > 0 && (
                    <Typography variant="medium" as="span" style={{ color: 'var(--fleet-git-text-added)' }}>
                      +{additions}
                    </Typography>
                  )}
                  {deletions !== undefined && deletions > 0 && (
                    <Typography variant="medium" as="span" style={{ color: 'var(--fleet-git-text-deleted)' }}>
                      -{deletions}
                    </Typography>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)
TaskListItem.displayName = "TaskListItem"

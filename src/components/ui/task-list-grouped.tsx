"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"
import { TextInput } from "./input"

// ─── Types ───────────────────────────────────────────────────────────────────

export type TaskStatus =
  | "launching"
  | "cloning"
  | "starting"
  | "running"
  | "idle"
  | "failed"
  | "cancelled"
  | "archived"

export interface TaskItemData {
  id: string
  title: string
  repository?: string
  metadata?: string
  status: TaskStatus
  hasUnread?: boolean
  updatedAt: Date
  deliveryStatus?: {
    text: string
    added?: number
    removed?: number
  }
}

export interface TaskGroupData {
  title: string
  items: TaskItemData[]
}

// ─── Status config ───────────────────────────────────────────────────────────

const statusConfig: Record<TaskStatus, { icon: string; animate?: boolean }> = {
  idle: { icon: "task-user-input" },
  running: { icon: "progress", animate: true },
  launching: { icon: "progress", animate: true },
  cloning: { icon: "progress", animate: true },
  starting: { icon: "progress", animate: true },
  failed: { icon: "task-error" },
  cancelled: { icon: "task-canceled" },
  archived: { icon: "task-paused" },
}

function isRunning(status: TaskStatus) {
  return status === "running" || status === "launching" || status === "cloning" || status === "starting"
}

function isActive(status: TaskStatus) {
  return isRunning(status) || status === "idle"
}

function isStarting(status: TaskStatus) {
  return status === "launching" || status === "cloning" || status === "starting"
}

function getDefaultMetadata(status: TaskStatus): string | undefined {
  if (isStarting(status)) return "Starting..."
  switch (status) {
    case "idle": return "Input required"
    case "running": return "Plan & task breakdown..."
    case "archived": return "Suspended"
    case "failed": return "Problem"
    case "cancelled": return "Canceled"
    default: return undefined
  }
}

// ─── Highlight helper ────────────────────────────────────────────────────────

function highlightText(text: string, query: string | undefined): React.ReactNode {
  if (!query?.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="rounded-sm bg-[var(--air-tints-yellow-tint-20,rgba(255,200,0,0.2))]">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

// ─── TaskListItem ────────────────────────────────────────────────────────────

export interface TaskListGroupedItemProps extends TaskItemData {
  highlightQuery?: string
  onClick?: (id: string) => void
  onRename?: (id: string, newName: string) => void
  onDelete?: (id: string) => void
  className?: string
}

export const TaskListGroupedItem = React.forwardRef<HTMLDivElement, TaskListGroupedItemProps>(
  ({ id, title, repository, metadata, deliveryStatus, status, hasUnread, highlightQuery, onClick, className }, ref) => {
    const config = statusConfig[status] ?? statusConfig.idle
    const clickable = !!onClick && isActive(status)
    const displayMetadata = metadata ?? getDefaultMetadata(status)

    return (
      <div
        ref={ref}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? () => onClick(id) : undefined}
        onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(id) } } : undefined}
        className={cn(
          "flex items-start py-1 px-2 gap-1 rounded-[4px] transition-colors duration-150",
          clickable && "cursor-pointer hover:bg-[var(--air-tints-light-tint-9,rgba(255,255,255,0.09))] focus-visible:bg-[var(--air-tints-light-tint-9,rgba(255,255,255,0.09))] outline-none",
          className,
        )}
        data-task-id={id}
        data-task-status={status}
      >
        {/* Status icon */}
        <div className="shrink-0">
          <Icon
            fleet={config.icon}
            size="sm"
            className={cn("shrink-0", config.animate && "animate-spin")}
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col min-w-0 gap-0.5">
          {/* First line: title + repository */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-0.5 flex-1 min-w-0">
              <Typography
                variant="default"
                className="overflow-hidden whitespace-nowrap text-ellipsis"
                style={{ margin: 0 }}
              >
                {highlightText(title, highlightQuery)}
              </Typography>
              {hasUnread && (
                <Icon fleet="task-unread" size="sm" className="shrink-0 text-[var(--air-blue-110)]" />
              )}
            </div>
            {repository && (
              <div className="shrink-0 ml-2">
                <Typography
                  variant="default"
                  className="overflow-hidden whitespace-nowrap text-ellipsis text-right"
                  style={{ color: "var(--air-list-item-text-secondary, var(--fleet-text-secondary))", margin: 0, fontSize: "12px" }}
                >
                  {repository}
                </Typography>
              </div>
            )}
          </div>

          {/* Metadata line */}
          {(displayMetadata || deliveryStatus) && (
            <div className="flex items-center gap-1 pr-4">
              {deliveryStatus ? (
                <>
                  <Typography
                    variant="default"
                    className="overflow-hidden whitespace-nowrap text-ellipsis"
                    style={{ color: "var(--air-list-item-text-secondary, var(--fleet-text-secondary))", margin: 0, fontSize: "12px" }}
                  >
                    {deliveryStatus.text}
                  </Typography>
                  <div className="flex items-center gap-1">
                    {deliveryStatus.added !== undefined && (
                      <span className="text-[var(--air-text-positive,#169068)] text-[13px]">+{deliveryStatus.added}</span>
                    )}
                    {deliveryStatus.removed !== undefined && (
                      <span className="text-[var(--air-text-dangerous,#e1465e)] text-[13px]">-{deliveryStatus.removed}</span>
                    )}
                  </div>
                </>
              ) : (
                <Typography
                  variant="default"
                  className="overflow-hidden whitespace-nowrap text-ellipsis"
                  style={{ color: "var(--air-list-item-text-secondary, var(--fleet-text-secondary))", margin: 0, fontSize: "12px" }}
                >
                  {displayMetadata}
                </Typography>
              )}
            </div>
          )}
        </div>
      </div>
    )
  },
)
TaskListGroupedItem.displayName = "TaskListGroupedItem"

// ─── TaskListGroup ───────────────────────────────────────────────────────────

export interface TaskListGroupProps {
  title: string
  items: TaskItemData[]
  highlightQuery?: string
  onClick?: (id: string) => void
  onRename?: (id: string, newName: string) => void
  onDelete?: (id: string) => void
  className?: string
}

export function TaskListGroup({ title, items, highlightQuery, onClick, onRename, onDelete, className }: TaskListGroupProps) {
  const sorted = React.useMemo(
    () => [...items].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    [items],
  )

  if (items.length === 0) return null

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-1 py-1 px-1 pl-2">
        <Typography variant="default-semibold">{title}</Typography>
      </div>
      <div className="flex flex-col">
        {sorted.map((item) => (
          <TaskListGroupedItem
            key={item.id}
            {...item}
            highlightQuery={highlightQuery}
            onClick={onClick}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Grouping logic ──────────────────────────────────────────────────────────

type GroupMode = "date" | "status"

function groupByStatus(items: TaskItemData[]): TaskGroupData[] {
  const groups: Record<string, TaskItemData[]> = {
    "Action needed": [],
    "Running": [],
    "Problem": [],
    "Canceled": [],
    "Archived": [],
  }

  for (const item of items) {
    if (item.status === "idle") groups["Action needed"].push(item)
    else if (isRunning(item.status)) groups["Running"].push(item)
    else if (item.status === "failed") groups["Problem"].push(item)
    else if (item.status === "cancelled") groups["Canceled"].push(item)
    else if (item.status === "archived") groups["Archived"].push(item)
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([title, items]) => ({ title, items }))
}

function getDateGroupLabel(date: Date): string {
  if (isNaN(date.getTime())) return "Older"
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  if (date >= today) return "Today"
  if (date >= yesterday) return "Yesterday"
  if (date >= lastWeek) return "Last 7 days"
  return "Older"
}

function groupByDate(items: TaskItemData[]): TaskGroupData[] {
  const order = ["Today", "Yesterday", "Last 7 days", "Older"]
  const groups: Record<string, TaskItemData[]> = {}

  for (const item of items) {
    const label = getDateGroupLabel(item.updatedAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(item)
  }

  return order
    .filter((label) => groups[label]?.length > 0)
    .map((label) => ({ title: label, items: groups[label] }))
}

// ─── TaskListGrouped ─────────────────────────────────────────────────────────

export interface TaskListGroupedProps {
  items: TaskItemData[]
  isLoading?: boolean
  groupBy?: GroupMode
  onClick?: (id: string) => void
  onRename?: (id: string, newName: string) => void
  onDelete?: (id: string) => void
  className?: string
}

export function TaskListGrouped({
  items,
  isLoading,
  groupBy = "status",
  onClick,
  onRename,
  onDelete,
  className,
}: TaskListGroupedProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.repository?.toLowerCase().includes(q) ?? false),
    )
  }, [items, searchQuery])

  const groups = React.useMemo(() => {
    return groupBy === "status" ? groupByStatus(filtered) : groupByDate(filtered)
  }, [filtered, groupBy])

  if (isLoading && items.length === 0) {
    return (
      <div className={cn("flex flex-1 flex-col min-h-0 gap-3", className)}>
        <div className="flex items-center gap-2 p-4" style={{ color: "var(--fleet-text-secondary)" }}>
          <Icon fleet="progress" size="sm" className="animate-spin shrink-0" />
          <span className="text-[13px]">Loading tasks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-1 flex-col min-h-0 gap-3", className)}>
      {/* Search */}
      <div className="flex items-center gap-2 w-full">
        <TextInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") setSearchQuery("") }}
          placeholder="Search"
          className="flex-1 min-w-0"
        />
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="p-4 text-center" style={{ color: "var(--fleet-text-secondary)" }}>
          <p className="m-0 text-[13px]">No tasks found</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0 gap-3">
          {groups.map((group) => (
            <TaskListGroup
              key={group.title}
              title={group.title}
              items={group.items}
              highlightQuery={searchQuery}
              onClick={onClick}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

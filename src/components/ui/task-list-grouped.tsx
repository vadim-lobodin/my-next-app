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

export interface TaskAssignee {
  name: string
  src?: string
}

export interface TaskItemData {
  id: string
  title: string
  repository?: string
  metadata?: string
  status: TaskStatus
  hasUnread?: boolean
  updatedAt: Date
  /** Single assignee or array for mini avatar stack */
  assignee?: TaskAssignee | TaskAssignee[]
  /** Optional badge label shown on the right (e.g. "Linear integration"). Auto-derived from status if omitted. */
  badge?: string
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

const statusConfig: Record<TaskStatus, { icon: string; animate?: boolean; label: string }> = {
  idle:       { icon: "task-user-input", label: "Waiting" },
  running:    { icon: "progress", animate: true, label: "Running" },
  launching:  { icon: "progress", animate: true, label: "Starting" },
  cloning:    { icon: "progress", animate: true, label: "Starting" },
  starting:   { icon: "progress", animate: true, label: "Starting" },
  failed:     { icon: "task-error",              label: "Error" },
  cancelled:  { icon: "task-canceled",           label: "Canceled" },
  archived:   { icon: "task-completed",           label: "Finished" },
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

// ─── Time formatting ─────────────────────────────────────────────────────────

function formatShortDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)

  if (minutes < 1) return "now"
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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

// ─── Hash helper ─────────────────────────────────────────────────────────────

function hashName(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash)
}

// ─── Mini avatar (photo or initials) ─────────────────────────────────────────

function MiniAvatar({ user, size = 20 }: { user: TaskAssignee; size?: number }) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        outline: `2px solid var(--fleet-island-background, var(--fleet-background-primary))`,
      }}
      title={user.name}
    >
      {user.src ? (
        <img src={user.src} alt={user.name} className="size-full object-cover" />
      ) : (
        <div
          className="size-full flex items-center justify-center font-medium text-white"
          style={{ fontSize: Math.round(size * 0.42), background: `hsl(${hashName(user.name) % 360}, 55%, 45%)` }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

function MiniAvatarStack({ assignees }: { assignees: TaskAssignee[] }) {
  if (assignees.length === 0) return null
  return (
    <div className="flex items-center shrink-0">
      {assignees.slice(0, 3).map((user, i) => (
        <div key={user.name} className="shrink-0" style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }}>
          <MiniAvatar user={user} size={20} />
        </div>
      ))}
    </div>
  )
}

// ─── TaskListGroupedItem ─────────────────────────────────────────────────────
// Line 1: icon | title (+ unread)        | badge | avatars | date
// Line 2:        metadata + diff stats

export interface TaskListGroupedItemProps extends TaskItemData {
  highlightQuery?: string
  onClick?: (id: string) => void
  onRename?: (id: string, newName: string) => void
  onDelete?: (id: string) => void
  className?: string
}

export const TaskListGroupedItem = React.forwardRef<HTMLDivElement, TaskListGroupedItemProps>(
  ({ id, title, repository, metadata, badge, deliveryStatus, assignee, status, hasUnread, updatedAt, highlightQuery, onClick, className }, ref) => {
    const config = statusConfig[status] ?? statusConfig.idle
    const clickable = !!onClick && isActive(status)
    const dateStr = formatShortDate(updatedAt)
    const badgeLabel = badge ?? config.label
    const assignees = assignee ? (Array.isArray(assignee) ? assignee : [assignee]) : []
    const displayMetadata = metadata ?? getDefaultMetadata(status)

    return (
      <div
        ref={ref}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? () => onClick(id) : undefined}
        onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(id) } } : undefined}
        className={cn("flex items-start w-full", clickable && "cursor-pointer", className)}
        data-task-id={id}
        data-task-status={status}
      >
        {/* Grid row — fixed columns keep badge/avatars/date aligned */}
        <div
          className={cn(
            "grid flex-1 items-center min-w-0",
            "rounded-[var(--fleet-radius-md)] transition-colors",
            "hover:bg-[var(--fleet-listItem-background-hovered)]",
            "pl-2 pr-2 py-1",
          )}
          style={{ gridTemplateColumns: "16px 1fr auto 48px 44px", columnGap: 6, rowGap: 0 }}
        >
          {/* Col 1: Icon */}
          <div className="flex items-center justify-center pt-0.5 self-start">
            <Icon
              fleet={config.icon}
              size="sm"
              className={cn("shrink-0", config.animate && "animate-spin")}
            />
          </div>

          {/* Col 2: Title + unread */}
          <div className="flex items-center gap-1 min-w-0 h-5">
            <Typography
              variant="default"
              className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ color: "var(--fleet-text-primary)" }}
            >
              {highlightText(title, highlightQuery)}
            </Typography>
            {hasUnread && (
              <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--fleet-link-text-default,#3b82f6)]" />
            )}
          </div>

          {/* Col 3: Badge pill + diff stats */}
          <div className="flex items-center gap-2 justify-end">
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full whitespace-nowrap",
              "border border-[var(--fleet-border)]",
            )}>
              {repository && (
                <Icon fleet="vcs" size="sm" className="shrink-0 opacity-60" />
              )}
              <Typography variant="medium" style={{ color: "var(--fleet-text-secondary)" }}>
                {badgeLabel}
              </Typography>
            </div>
            {deliveryStatus && (deliveryStatus.added !== undefined || deliveryStatus.removed !== undefined) && (
              <div className="flex items-center gap-1 shrink-0">
                {deliveryStatus.added !== undefined && deliveryStatus.added > 0 && (
                  <Typography variant="medium" as="span" style={{ color: "var(--fleet-git-text-added)" }}>
                    +{deliveryStatus.added}
                  </Typography>
                )}
                {deliveryStatus.removed !== undefined && deliveryStatus.removed > 0 && (
                  <Typography variant="medium" as="span" style={{ color: "var(--fleet-git-text-deleted)" }}>
                    -{deliveryStatus.removed}
                  </Typography>
                )}
              </div>
            )}
          </div>

          {/* Col 4: Avatars — fixed width column */}
          <div className="flex items-center justify-end">
            {assignees.length > 0 && <MiniAvatarStack assignees={assignees} />}
          </div>

          {/* Col 5: Date — fixed width column */}
          <Typography
            variant="medium"
            className="whitespace-nowrap text-right"
            style={{ color: "var(--fleet-text-secondary)" }}
          >
            {dateStr}
          </Typography>

          {/* Row 2: metadata starts at col 2, spans to end */}
          {(displayMetadata || deliveryStatus) && (
            <div className="flex items-center gap-1 overflow-hidden" style={{ gridColumn: "2 / -1" }}>
              <Typography
                variant="medium"
                className="whitespace-nowrap"
                style={{ color: "var(--fleet-text-secondary)" }}
              >
                {deliveryStatus?.text ?? displayMetadata}
              </Typography>
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
      {/* Group header */}
      <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-[var(--fleet-radius-md)] bg-[rgba(255,255,255,0.02)]">
        <Typography variant="default-semibold">{title}</Typography>
        <Typography variant="medium" style={{ color: "var(--fleet-text-disabled)" }}>
          {items.length}
        </Typography>
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
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0 gap-2">
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

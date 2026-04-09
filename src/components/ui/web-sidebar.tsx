"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"
import { TextInput } from "./input"
import { Button } from "./button-shadcn"
import { TaskListItem, type TaskStatus } from "./task-list-item"
import { Navigation, NavigationItem, useNavigationExpanded, useNavigationPinned } from "./navigation"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WebSidebarTask {
  id: string
  title: string
  description: string
  status: TaskStatus
  additions?: number
  deletions?: number
}

export interface WebSidebarProps {
  /** Active nav section */
  active?: string
  /** Callback when nav section changes */
  onActiveChange?: (id: string) => void
  /** Tasks grouped by project/repository */
  taskGroups?: Record<string, WebSidebarTask[]>
  /** Callback when a task is clicked */
  onTaskClick?: (taskId: string) => void
  /** Callback when "New Task" is clicked */
  onNewTask?: () => void
  /** User display name */
  userName?: string
  /** User organization */
  userOrg?: string
  /** Whether nav is always expanded (pinned open) */
  alwaysExpanded?: boolean
  /** Callback when panel toggle is clicked */
  onTogglePin?: () => void
  className?: string
}

// ─── User Avatar ─────────────────────────────────────────────────────────────

function UserInitials({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        "shrink-0 rounded-full flex items-center justify-center font-medium text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.45),
        background: "var(--fleet-ghostButton-off-background-pressed, rgba(255,255,255,0.13))",
      }}
    >
      {initials}
    </div>
  )
}

// ─── Nav Content (inner) ─────────────────────────────────────────────────────

function WebSidebarContent({
  active = "tasks",
  onActiveChange,
  taskGroups = {},
  onTaskClick,
  onNewTask,
  onTogglePin,
  userName = "Daniel Moore",
  userOrg = "JetBrains",
}: Omit<WebSidebarProps, "alwaysExpanded" | "className">) {
  const expanded = useNavigationExpanded()
  const pinned = useNavigationPinned()
  const compact = !expanded
  const [search, setSearch] = React.useState("")

  const filteredGroups = React.useMemo(() => {
    if (!search.trim()) return taskGroups
    const q = search.toLowerCase()
    const result: Record<string, WebSidebarTask[]> = {}
    for (const [group, tasks] of Object.entries(taskGroups)) {
      const filtered = tasks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      )
      if (filtered.length > 0) result[group] = filtered
    }
    return result
  }, [taskGroups, search])

  return (
    <>
      <Navigation.Top>
        <Navigation.Items>
          <NavigationItem compact onClick={onTogglePin}>
            <Icon fleet={pinned ? "panel-left-open" : "panel-left-closed"} size="sm" className="shrink-0" />
          </NavigationItem>
          <NavigationItem compact={compact} isActive={active === "tasks"} onClick={() => { onActiveChange?.("tasks"); onNewTask?.() }}>
            <Icon fleet="add" size="sm" className="shrink-0" />
            <NavigationItem.Text>New Task</NavigationItem.Text>
          </NavigationItem>
          <NavigationItem compact={compact} isActive={active === "automations"} onClick={() => onActiveChange?.("automations")}>
            <Icon fleet="vcs-history" size="sm" className="shrink-0" />
            <NavigationItem.Text>Automations</NavigationItem.Text>
          </NavigationItem>
        </Navigation.Items>
        {expanded && (
          <>
            <div className="flex items-center gap-[6px] px-2">
              <TextInput
                prefix={<Icon fleet="search" size="sm" style={{ color: "var(--fleet-text-secondary)" }} />}
                placeholder="Search tasks"
                size="large"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <Icon fleet="configure" size="sm" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-none">
              {Object.entries(filteredGroups).map(([group, tasks]) => (
                <div key={group}>
                  <Typography variant="medium" className="px-2 pt-2 pb-0.5" style={{ color: "var(--fleet-text-secondary)" }}>
                    {group}
                  </Typography>
                  {tasks.map((task) => (
                    <TaskListItem
                      key={task.id}
                      title={task.title}
                      description={task.description}
                      status={task.status}
                      additions={task.additions}
                      deletions={task.deletions}
                      onClick={() => onTaskClick?.(task.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </Navigation.Top>
      <Navigation.Bottom>
        {expanded ? (
          /* Expanded: User info row — avatar + name/org + settings & notifications buttons */
          <div className="flex items-center justify-between pl-2 pr-1 py-2 rounded-[6px] hover:bg-[var(--fleet-listItem-background-hovered,rgba(255,255,255,0.09))] cursor-pointer">
            <div className="flex items-start gap-2">
              <UserInitials name={userName} size={32} />
              <div className="flex flex-col gap-1 text-[13px] font-[480] leading-4 tracking-[0.052px] whitespace-nowrap">
                <span style={{ color: "var(--fleet-text-primary)" }}>{userName}</span>
                <span style={{ color: "var(--fleet-text-secondary)" }}>{userOrg}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 h-7">
              <Button variant="ghost" size="icon" onClick={() => onActiveChange?.("settings")}>
                <Icon fleet="settings" size="sm" />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon fleet="notifications" size="sm" />
              </Button>
            </div>
          </div>
        ) : (
          /* Compact: stacked settings, notifications, avatar */
          <div className="flex flex-col items-center gap-1">
            <NavigationItem compact isActive={active === "settings"} onClick={() => onActiveChange?.("settings")}>
              <Icon fleet="settings" size="sm" className="shrink-0" />
            </NavigationItem>
            <NavigationItem compact>
              <Icon fleet="notifications" size="sm" className="shrink-0" />
            </NavigationItem>
            <NavigationItem compact>
              <UserInitials name={userName} size={20} />
            </NavigationItem>
          </div>
        )}
      </Navigation.Bottom>
    </>
  )
}

// ─── WebSidebar ──────────────────────────────────────────────────────────────

export function WebSidebar({
  alwaysExpanded,
  className,
  ...contentProps
}: WebSidebarProps) {
  return (
    <Navigation alwaysExpanded={alwaysExpanded} className={className}>
      <WebSidebarContent {...contentProps} />
    </Navigation>
  )
}

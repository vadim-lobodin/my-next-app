"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { TextInput } from "./input"
import { Typography } from "./typography"
import { TaskListItem, type TaskStatus } from "./task-list-item"

// ===== FIGMA: Task List =====
// Container with search, new task button, and grouped task items
// Figma vars: bg=#090909, rounded 8px, px 4px, py 8px, min-w 200px, max-w 350px, w 280px
// Groups gap: task-list/between-groups = 12px

export interface TaskItem {
  id: string
  title: string
  description?: string
  status: TaskStatus
  additions?: number
  deletions?: number
  trailingIcon?: string
}

export interface TaskGroup {
  label: string
  items: TaskItem[]
}

export interface TaskListProps {
  groups?: TaskGroup[]
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  onNewTask?: () => void
  onTaskClick?: (task: TaskItem) => void
  selectedTaskId?: string
  className?: string
  width?: number | string
  height?: number | string
}

// Default data for self-managing mode
const defaultGroups: TaskGroup[] = [
  {
    label: "Today",
    items: [
      { id: "1", title: "Add item search to catalogue page", description: "Starting...", status: "running" },
      { id: "2", title: "Implement shopping cart dropdown", description: "Updating dropdown styles...", status: "running" },
      { id: "3", title: "Add product filters by pet type", description: "Done", status: "done", additions: 157, deletions: 10 },
      { id: "4", title: "Create product detail page", description: "Input required", status: "input-required" },
      { id: "5", title: "Optimize checkout page speed", description: "Done", status: "done", additions: 978, deletions: 144 },
    ],
  },
  {
    label: "Previous 7 days",
    items: [
      { id: "6", title: "Design search bar UI", description: "Done", status: "done", additions: 112, deletions: 0 },
      { id: "7", title: "Add \"related items\" carousel", description: "Review required", status: "review-required", additions: 413, deletions: 0 },
      { id: "8", title: "Enable promo code input at chec...", description: "Suspended", status: "suspended", trailingIcon: "docker-small" },
    ],
  },
  {
    label: "August 2025",
    items: [
      { id: "9", title: "Improve mobile navigation menu", description: "Suspended", status: "suspended", trailingIcon: "docker-small" },
      { id: "10", title: "Test and optimize", description: "Suspended", status: "suspended", trailingIcon: "docker-small" },
      { id: "11", title: "Create an implementation plan", description: "Suspended", status: "suspended", trailingIcon: "docker-small" },
    ],
  },
]

export const TaskList = React.forwardRef<HTMLDivElement, TaskListProps>(
  ({
    groups,
    searchPlaceholder = "Search tasks",
    onSearch,
    onNewTask,
    onTaskClick,
    selectedTaskId,
    className,
    width,
    height,
  }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState("")
    const displayGroups = groups ?? defaultGroups

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
      onSearch?.(e.target.value)
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-start rounded-lg w-full h-full px-1 py-2", className)}
        style={{
          background: 'var(--fleet-background-primary)',
          border: '1px solid var(--fleet-task-list-static-border, transparent)',
          ...(width != null && { width }),
          ...(height != null && { height }),
        }}
      >
        {/* Inner scrollable container */}
        <div className="flex flex-1 flex-col gap-3 h-full items-start min-h-0 min-w-0 overflow-x-hidden overflow-y-auto w-full">

          {/* Search bar + filter button */}
          <div className="flex gap-1.5 items-center shrink-0 w-full">
            {/* Search input */}
            <div className="flex flex-1 min-w-0">
              <TextInput
                value={searchQuery}
                onChange={handleSearch}
                placeholder={searchPlaceholder}
                size="large"
                prefix="search"
                className="w-full"
              />
            </div>

            {/* Filter button */}
            <button
              className="flex items-center justify-between p-0.5 rounded-[var(--fleet-radius-xs)] shrink-0 transition-colors"
              style={{
                background: 'var(--fleet-ghostbutton-off-background-default)',
                border: '1px solid var(--fleet-ghostbutton-off-border-default)',
              }}
            >
              <Icon fleet="configure" size="sm" />
            </button>
          </div>

          {/* New Task button */}
          <button
            className="flex items-center gap-1 shrink-0 w-full rounded-[var(--fleet-radius-sm)] cursor-pointer transition-colors bg-transparent hover:bg-[var(--fleet-ghostbutton-off-background-hovered)] border border-transparent px-2 py-1"
            onClick={onNewTask}
          >
            <Icon fleet="add" size="sm" />
            <Typography variant="default" style={{ color: 'var(--fleet-text-primary)' }}>
              New Task
            </Typography>
          </button>

          {/* Task groups */}
          {displayGroups.map((group) => (
            <div key={group.label} className="flex flex-col shrink-0 w-full">
              {/* Group heading — Figma: ListItem type=heading, secondary style */}
              <div className="flex items-center w-full pl-2 pr-1 py-1">
                <Typography
                  variant="medium"
                  style={{ color: 'var(--fleet-listItem-text-secondary)' }}
                >
                  {group.label}
                </Typography>
              </div>

              {/* Task items */}
              {group.items.map((task) => (
                <div key={task.id} className={cn("flex items-start w-full relative", task.trailingIcon && "pr-7")}>
                  <TaskListItem
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    additions={task.additions}
                    deletions={task.deletions}
                    selected={selectedTaskId === task.id}
                    onClick={() => onTaskClick?.(task)}
                  />
                  {task.trailingIcon && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Icon fleet={task.trailingIcon} size="sm" className="opacity-45" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }
)
TaskList.displayName = "TaskList"

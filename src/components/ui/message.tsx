"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"

// ===== FIGMA: Message Component =====
// Types: AI Message, User Message, System Message, Progress
// Container: max-w 620px, min-w 320px, w 365px

export type MessageType = "ai" | "user" | "system" | "progress"

export interface MessageProps {
  type?: MessageType
  children?: React.ReactNode
  className?: string
}

export interface AiMessageProps {
  content?: string
  children?: React.ReactNode
  className?: string
}

export interface UserMessageProps {
  content?: string
  children?: React.ReactNode
  className?: string
}

export interface SystemMessageProps {
  children?: React.ReactNode
  linkText?: string
  linkHref?: string
  prefix?: string
  suffix?: string
  className?: string
}

export type ProgressSubstepStatus = "pending" | "running" | "success" | "error" | "blocked" | "skipped"

export interface ProgressSubstep {
  label: string
  status?: ProgressSubstepStatus
  fileTag?: { name: string; icon?: string }
}

export type ProgressMessageType = "loader" | "waiting" | "done" | "failed"

export interface ProgressMessageProps {
  /** "loader" for in-progress spinner, "waiting" for user input */
  type?: ProgressMessageType
  label?: string
  fileName?: string
  fileIcon?: string
  /** Substeps shown when expanded */
  substeps?: ProgressSubstep[]
  /** Whether the substep list is expanded */
  expanded?: boolean
  /** Called when expand/collapse is toggled */
  onToggleExpand?: () => void
  className?: string
}

// ===== AI MESSAGE =====
// Figma: plain text, rounded 4px, gap 8px, default-chat typography (13px/20px)

export const AiMessage = React.forwardRef<HTMLDivElement, AiMessageProps>(
  ({ content = "Change the line height to 2, and also increase bottom margin of h1 to 2rem", children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 items-start w-full", className)}
        style={{
          borderRadius: 'var(--fleet-radius-md)',
          background: 'var(--fleet-chat-message-ai-background-default)',
          border: '1px solid var(--fleet-chat-message-ai-border-default)',
        }}
      >
        <div className="flex flex-col gap-2 items-start w-full">
          {children ?? (
            <Typography
              variant="default-chat"
              style={{ color: 'var(--fleet-text-primary)' }}
            >
              {content}
            </Typography>
          )}
        </div>
      </div>
    )
  }
)
AiMessage.displayName = "AiMessage"

// ===== USER MESSAGE =====
// Figma: bg rgba(255,255,255,0.11), rounded 6px, px 10px, py 8px, pl-40px offset

export const UserMessage = React.forwardRef<HTMLDivElement, UserMessageProps>(
  ({ content = "Change the line height to 2, and also increase bottom margin of h1 to 2rem", children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-end w-full rounded-[var(--fleet-radius-md)]", className)}
      >
        <div
          className="flex flex-col gap-3 items-center justify-center max-w-[80%] rounded-[var(--fleet-radius-md)] px-2.5 py-2"
          style={{
            background: 'var(--fleet-chat-message-user-background-default)',
            border: '1px solid var(--fleet-chat-message-user-border-default)',
          }}
        >
          <div className="flex flex-col gap-2 items-start w-full">
            {children ?? (
              <Typography
                variant="default-chat"
                style={{ color: 'var(--fleet-text-primary)' }}
              >
                {content}
              </Typography>
            )}
          </div>
        </div>
      </div>
    )
  }
)
UserMessage.displayName = "UserMessage"

// ===== SYSTEM MESSAGE =====
// Figma: horizontal lines + centered text (medium 12px), secondary color, link in purple

export const SystemMessage = React.forwardRef<HTMLDivElement, SystemMessageProps>(
  ({
    prefix = "Context copied from",
    linkText = "Adding filters",
    suffix = "chat",
    linkHref,
    children,
    className,
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-1 gap-2 items-center min-h-0 min-w-0 w-full", className)}
      >
        {/* Left line */}
        <div className="flex-1 h-px min-h-0 min-w-0" style={{ background: 'var(--fleet-chat-messages-floating-bar-border)' }} />

        {/* Text */}
        {children ?? (
          <Typography variant="medium" as="span" className="shrink-0 whitespace-nowrap" style={{ color: 'var(--fleet-text-secondary)' }}>
            {prefix}{' '}
            {linkHref ? (
              <a href={linkHref} style={{ color: 'var(--fleet-link-text)' }}>{linkText}</a>
            ) : (
              <span style={{ color: 'var(--fleet-link-text)' }}>{linkText}</span>
            )}
            {suffix ? ` ${suffix}` : ''}
          </Typography>
        )}

        {/* Right line */}
        <div className="flex-1 h-px min-h-0 min-w-0" style={{ background: 'var(--fleet-chat-messages-floating-bar-border)' }} />
      </div>
    )
  }
)
SystemMessage.displayName = "SystemMessage"

// ===== FILE TAG =====

function FileTag({ name }: { name: string; icon?: string }) {
  return (
    <span
      className="inline-flex items-center px-1 rounded-[3px] shrink-0"
      style={{ background: "rgba(255,255,255,0.09)" }}
    >
      <Typography variant="medium" as="span" style={{ color: "var(--fleet-text-secondary)" }}>
        {name}
      </Typography>
    </span>
  )
}

// ===== SUBSTEP =====

const substepStatusConfig: Record<ProgressSubstepStatus, { icon: string; color?: string; animate?: boolean }> = {
  success: { icon: "checkmark" },
  running: { icon: "progress", animate: true },
  error: { icon: "task-canceled" },
  blocked: { icon: "task-canceled" },
  skipped: { icon: "task-draft" },
  pending: { icon: "task-draft" },
}

function Substep({ label, status = "success", fileTag }: ProgressSubstep) {
  const config = substepStatusConfig[status]
  return (
    <div className="flex items-center gap-1.5 py-0.5" style={{ color: config.color ?? "var(--fleet-text-secondary)" }}>
      <Icon fleet={config.icon} size="sm" colorize className={cn("shrink-0", config.animate && "animate-spin")} />
      <Typography variant="medium" className="!text-inherit">
        {label}
      </Typography>
      {fileTag && <FileTag name={fileTag.name} icon={fileTag.icon} />}
    </div>
  )
}

// ===== PROGRESS MESSAGE =====

export const ProgressMessage = React.forwardRef<HTMLDivElement, ProgressMessageProps>(
  ({
    type = "loader",
    label = "Reading",
    fileName,
    fileIcon,
    substeps,
    expanded,
    onToggleExpand,
    className,
  }, ref) => {
    const isDone = type === "done"
    const isFailed = type === "failed"
    const isWaiting = type === "waiting"
    const hasSubsteps = substeps && substeps.length > 0

    const iconMap = {
      done: { fleet: "checkmark", className: "shrink-0" },
      failed: { fleet: "task-canceled", className: "shrink-0" },
      waiting: { fleet: "task-user-input", className: "shrink-0" },
      loader: { fleet: "progress", className: "shrink-0 animate-spin" },
    }
    const icon = iconMap[type]

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-start w-full", className)}
      >
        {/* Main progress row */}
        <div
          className={cn(
            "flex items-center gap-1.5 w-full py-0.5 group",
            hasSubsteps && "cursor-pointer",
          )}
          style={{ color: isWaiting ? "var(--fleet-icon-yellow, #e59408)" : "var(--fleet-text-secondary)" }}
          onClick={hasSubsteps ? onToggleExpand : undefined}
        >
          {/* Status icon */}
          <Icon fleet={icon.fleet} size="sm" colorize className={icon.className} />

          {/* Label */}
          <Typography
            variant="medium"
            className="shrink-0 !text-inherit"
          >
            {label}
          </Typography>

          {/* File tag (not for waiting type) */}
          {!isWaiting && fileName && (
            <>
              <FileTag name={fileName} icon={fileIcon} />
              <Typography variant="medium" className="!text-inherit">...</Typography>
            </>
          )}

          {/* Expand/collapse chevron */}
          {hasSubsteps && (
            <Icon
              fleet={expanded ? "chevron-up" : "chevron-right"}
              size="sm"
              colorize
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>

        {/* Expanded substeps */}
        <AnimatePresence initial={false}>
          {expanded && hasSubsteps && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col pl-6 mt-0.5">
                {substeps.map((step, i) => (
                  <Substep key={i} {...step} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
ProgressMessage.displayName = "ProgressMessage"

// ===== MESSAGE (Unified wrapper) =====

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ type = "ai", children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-start w-full",
          type !== "system" && "max-w-[620px] min-w-[320px]",
          className,
        )}
      >
        {type === "ai" && <AiMessage>{children}</AiMessage>}
        {type === "user" && <UserMessage>{children}</UserMessage>}
        {type === "system" && <SystemMessage>{children}</SystemMessage>}
        {type === "progress" && <ProgressMessage />}
      </div>
    )
  }
)
Message.displayName = "Message"

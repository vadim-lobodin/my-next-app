"use client"

import * as React from "react"
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

export interface ProgressMessageProps {
  label?: string
  fileName?: string
  fileIcon?: string
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

// ===== PROGRESS MESSAGE =====
// Figma: border rgba(255,255,255,0.13), rounded 6px, icon + "Analyzing" + file tag

export const ProgressMessage = React.forwardRef<HTMLDivElement, ProgressMessageProps>(
  ({
    label = "Analyzing",
    fileName = "types.ts",
    fileIcon = "typescript",
    className,
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-start rounded-[var(--fleet-radius-md)] w-full px-1", className)}
      >
        <div
          className="absolute inset-0 rounded-[var(--fleet-radius-md)]"
          style={{
            background: 'var(--fleet-chat-widget-background-default)',
            border: '1px solid var(--fleet-chat-widget-border-default)',
          }}
        />
        <div className="flex items-center gap-1 w-full px-2 py-1.5 rounded-[var(--fleet-radius-sm)] relative overflow-clip">
          {/* Progress spinner */}
          <Icon fleet="progress" size="sm" className="shrink-0 animate-spin" />

          {/* Label */}
          <Typography
            variant="default"
            className="shrink-0"
            style={{ color: 'var(--fleet-text-primary)' }}
          >
            {label}
          </Typography>

          {/* File tag */}
          <div
            className="flex items-center gap-1 px-1 py-0.5 rounded-[var(--fleet-radius-xs)] shrink-0"
            style={{ background: 'var(--fleet-tag-default-background)' }}
          >
            <Icon fleet={fileIcon} size="xs" />
            <Typography variant="medium" style={{ color: 'var(--fleet-tag-default-text)' }}>
              {fileName}
            </Typography>
          </div>

          {/* Ellipsis */}
          <Typography
            variant="default"
            className="shrink-0"
            style={{ color: 'var(--fleet-text-secondary)' }}
          >
            ...
          </Typography>
        </div>
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

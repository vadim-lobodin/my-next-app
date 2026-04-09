"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Typography } from "./typography"
import { TerminalSnippet } from "./terminal-snippet"

// ===== ANSWER BADGE (_Answer Type) =====
// Figma: _Answer Type — 16×16 numbered badge, Single-Choice + State variants

export interface AnswerBadgeProps {
  /** Display number */
  number: number
  /** Whether this badge is focused (blue border) */
  focused?: boolean
  className?: string
}

export function AnswerBadge({ number, focused, className }: AnswerBadgeProps) {
  return (
    <div
      className={cn(
        "size-4 rounded flex items-center justify-center text-[10px] leading-[14px] font-medium tracking-[0.06px]",
        "bg-[var(--fleet-chat-message-numberedList-tag-background)]",
        focused && "border border-[var(--fleet-checkbox-off-focusBorder,#2a7deb)] shadow-[0_0_0_2px_var(--fleet-checkbox-off-focusOutline,#224271)]",
        className,
      )}
      style={{ color: "var(--fleet-text-primary)" }}
    >
      {number}
    </div>
  )
}

// ===== ANSWER OPTION (_Answer) =====
// Figma: _Answer — badge + text row, 6px gap, 2px horizontal padding

export interface AnswerOptionProps {
  /** 1-based index number */
  number: number
  /** Whether this option is focused/selected */
  focused?: boolean
  /** Hint text (e.g. "Esc") shown after main text in secondary color */
  hint?: string
  /** Description text shown below the main label */
  description?: string
  /** Click handler */
  onClick?: () => void
  children: React.ReactNode
}

export function AnswerOption({ number, focused, hint, description, onClick, children }: AnswerOptionProps) {
  return (
    <button
      className="flex gap-1.5 items-start px-0.5 w-full text-left bg-transparent border-0 cursor-pointer rounded-sm p-0 hover:bg-[var(--fleet-listItem-background-hovered)]"
      onClick={onClick}
    >
      {/* Badge container — h-5 (20px) to match text line-height */}
      <div className="shrink-0 w-4 h-5 flex items-center justify-center">
        <AnswerBadge number={number} focused={focused} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="m-0 text-[13px] leading-[20px] tracking-[0.052px]"
          style={{ color: "var(--fleet-text-primary)" }}
        >
          {children}
          {hint && (
            <span style={{ color: "var(--fleet-text-secondary)" }}> {hint}</span>
          )}
        </p>
        {description && (
          <p
            className="m-0 text-[13px] leading-[18px] tracking-[0.052px] pb-0.5"
            style={{ color: "var(--fleet-text-secondary)" }}
          >
            {description}
          </p>
        )}
      </div>
    </button>
  )
}

// ===== PERMISSION WIDGET =====

export interface PermissionWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title shown in link/blue color (e.g. "Bash command") */
  title: string
  /** Description text (e.g. "List files in current directory") */
  description?: string
  /** Command to show in a terminal snippet */
  command?: string
  /** Question text (e.g. "Do you want to proceed?") */
  question?: string
  /** Answer options */
  answers?: {
    label: React.ReactNode
    hint?: string
    focused?: boolean
    onClick?: () => void
  }[]
}

export const PermissionWidget = React.forwardRef<HTMLDivElement, PermissionWidgetProps>(
  ({ className, title, description, command, question, answers, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-2 items-start pt-2.5 pb-3 px-3 rounded-lg border",
          className,
        )}
        style={{
          background: "var(--fleet-banner-background-info, #18263c)",
          borderColor: "var(--fleet-banner-border-info, #225090)",
        }}
        {...props}
      >
        {/* Command section */}
        <div className="flex flex-col gap-1.5 w-full">
          <Typography
            variant="default"
            style={{ color: "var(--fleet-link-text-default, #4b8dec)" }}
          >
            {title}
          </Typography>

          {(description || command) && (
            <div className="flex flex-col gap-2 w-full">
              {description && (
                <Typography
                  variant="default"
                  style={{ color: "var(--fleet-text-secondary)" }}
                >
                  {description}
                </Typography>
              )}
              {command && (
                <TerminalSnippet command={command} defaultExpanded={false} />
              )}
            </div>
          )}
        </div>

        {/* Question + answers section */}
        {(question || answers) && (
          <div className="flex flex-col gap-2 w-full">
            {question && (
              <Typography
                variant="default"
                className="leading-[20px]"
                style={{ color: "var(--fleet-text-primary)" }}
              >
                {question}
              </Typography>
            )}
            {answers && answers.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                {answers.map((answer, i) => (
                  <AnswerOption
                    key={i}
                    number={i + 1}
                    focused={answer.focused}
                    hint={answer.hint}
                    onClick={answer.onClick}
                  >
                    {answer.label}
                  </AnswerOption>
                ))}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    )
  },
)
PermissionWidget.displayName = "PermissionWidget"

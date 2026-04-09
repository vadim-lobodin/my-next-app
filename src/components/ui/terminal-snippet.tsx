"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"

// ===== TYPES =====

export type TerminalSnippetStatus = "running" | "success" | "error"

export interface TerminalSnippetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Command displayed in the header */
  command?: string
  /** Terminal output content */
  output?: string
  /** Execution status */
  status?: TerminalSnippetStatus
  /** Whether the snippet is expanded */
  defaultExpanded?: boolean
}

// ===== STATUS CONFIG =====

const statusStyles: Record<TerminalSnippetStatus, { bg: string; border: string; contentBorder: string }> = {
  running: {
    bg: "var(--fleet-snippet-background-waiting)",
    border: "var(--fleet-snippet-border-waiting)",
    contentBorder: "var(--fleet-snippet-content-border-waiting)",
  },
  success: {
    bg: "var(--fleet-snippet-background-default)",
    border: "var(--fleet-snippet-border-default)",
    contentBorder: "var(--fleet-snippet-content-border-default)",
  },
  error: {
    bg: "var(--fleet-snippet-background-dangerous)",
    border: "var(--fleet-snippet-border-dangerous)",
    contentBorder: "var(--fleet-snippet-content-border-dangerous)",
  },
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// ===== COMPONENT =====

export const TerminalSnippet = React.forwardRef<HTMLDivElement, TerminalSnippetProps>(
  ({
    command = "ls -la",
    output,
    status = "success",
    defaultExpanded = true,
    className,
    ...props
  }, ref) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded)
    const styles = statusStyles[status]

    return (
      <div
        ref={ref}
        className={cn(
          "min-w-[264px] max-w-[620px]",
          "rounded-[var(--fleet-radius-md)]",
          "border",
          className,
        )}
        style={{
          background: styles.bg,
          borderColor: styles.border,
        }}
        {...props}
      >
        {/* Header — 26px tall */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-[3px] w-full h-[26px] px-[5px] py-[5px] cursor-pointer border-0 bg-transparent outline-none"
        >
          {/* File tag: icon + command */}
          <div className="flex items-center gap-[3px] rounded-[4px] p-[2px]">
            <Icon fleet="terminal" size="sm" />
            <span
              className="text-[13px] font-body-regular leading-[16px] tracking-default truncate"
              style={{ color: "var(--fleet-text-primary)" }}
            >
              {command}
            </span>
          </div>
        </button>

        {/* Output body — animated expand/collapse */}
        <AnimatePresence initial={false}>
          {expanded && output && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div
                className="mx-[3px] mb-[3px] p-1 rounded-[4px] overflow-hidden"
                style={{
                  background: "var(--fleet-snippet-content-background)",
                  borderColor: styles.contentBorder,
                  borderWidth: 1,
                  borderStyle: "solid",
                }}
              >
                <pre
                  className="m-0 font-mono text-[13px] leading-[22px] whitespace-pre"
                  style={{ color: "var(--fleet-editor-text)" }}
                  dangerouslySetInnerHTML={{ __html: escapeHtml(output) }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
TerminalSnippet.displayName = "TerminalSnippet"

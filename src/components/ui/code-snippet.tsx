"use client"

import * as React from "react"
import Prism from "prismjs"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-css"
import "prismjs/components/prism-json"
import "prismjs/components/prism-markdown"
import "prismjs/components/prism-python"
import "prismjs/components/prism-rust"
import "prismjs/components/prism-go"
import "prismjs/components/prism-bash"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"

// ===== TYPES =====

export interface CodeSnippetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** File name displayed in the header */
  filename?: string
  /** File extension for icon resolution */
  extension?: string
  /** Prism language key (auto-detected from extension if omitted) */
  language?: string
  /** Number of lines added */
  additions?: number
  /** Number of lines deleted */
  deletions?: number
  /** Code content to display */
  code?: string
  /** Whether the snippet is expanded */
  defaultExpanded?: boolean
}

// ===== HELPERS =====

const getFileIcon = (extension?: string): string => {
  switch (extension) {
    case "ts": case "tsx": return "file-types-typescript"
    case "js": case "jsx": return "file-types-javascript"
    case "css": return "file-types-css"
    case "json": return "file-types-json"
    case "md": return "file-types-markdown"
    case "html": return "file-types-html"
    case "py": return "file-types-python"
    case "rs": return "file-types-rust"
    case "go": return "file-types-go"
    default: return "file-types-text"
  }
}

const extToLanguage: Record<string, string> = {
  ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
  css: "css", json: "json", md: "markdown", html: "html",
  py: "python", rs: "rust", go: "go", sh: "bash", bash: "bash",
}

const inferExtension = (filename: string): string | undefined => {
  const parts = filename.split(".")
  return parts.length > 1 ? parts.pop() : undefined
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// ===== COMPONENT =====

export const CodeSnippet = React.forwardRef<HTMLDivElement, CodeSnippetProps>(
  ({
    filename = "variable.ts",
    extension,
    language,
    additions,
    deletions,
    code,
    defaultExpanded = true,
    className,
    ...props
  }, ref) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded)
    const ext = extension ?? inferExtension(filename)
    const lang = language ?? (ext ? extToLanguage[ext] : undefined)
    const hasStats = additions !== undefined || deletions !== undefined

    const highlightedHtml = React.useMemo(() => {
      if (!code) return ""
      const grammar = lang ? Prism.languages[lang] : undefined
      if (!grammar) return escapeHtml(code)
      return Prism.highlight(code, grammar, lang!)
    }, [code, lang])

    return (
      <div
        ref={ref}
        className={cn(
          "min-w-[264px] max-w-[620px]",
          "rounded-[var(--fleet-radius-md)]",
          "border border-[var(--fleet-snippet-border-default)]",
          "bg-[var(--fleet-snippet-background-default)]",
          className,
        )}
        {...props}
      >
        {/* Header — 26px tall, 3px inset */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-[3px] w-full h-[26px] px-[5px] py-[5px] cursor-pointer border-0 bg-transparent outline-none"
        >
          {/* File tag */}
          <div className="flex items-center gap-[3px] rounded-[4px] p-[2px]">
            <Icon fleet={getFileIcon(ext)} size="sm" />
            <span
              className="text-[13px] font-body-regular leading-[16px] tracking-default truncate"
              style={{ color: "var(--fleet-text-primary)" }}
            >
              {filename}
            </span>
          </div>

          {/* Diff stats */}
          {hasStats && (
            <div className="flex items-center gap-1 text-[13px] font-body-regular leading-[16px] tracking-default whitespace-nowrap">
              {additions !== undefined && additions > 0 && (
                <span style={{ color: "var(--fleet-editor-gitDiff-text-added)" }}>+{additions}</span>
              )}
              {deletions !== undefined && deletions > 0 && (
                <span style={{ color: "var(--fleet-editor-gitDiff-text-deleted)" }}>-{deletions}</span>
              )}
            </div>
          )}
        </button>

        {/* Code body — animated expand/collapse */}
        <AnimatePresence initial={false}>
          {expanded && code && (
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
                  borderColor: "var(--fleet-snippet-content-border-default)",
                  borderWidth: 1,
                  borderStyle: "solid",
                }}
              >
                <pre
                  className="m-0 font-mono text-[13px] leading-[22px]"
                  style={{ color: "var(--fleet-editor-text)" }}
                >
                  <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
CodeSnippet.displayName = "CodeSnippet"

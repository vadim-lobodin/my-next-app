"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"
import { List, ListItem, type ListItemOpts } from "./list"
import { SplitButton } from "./button-shadcn"

// ===== TYPES =====

export interface ChangedFile {
  id: string
  name: string
  path: string
  extension?: string
  additions: number
  deletions: number
  status?: "modified" | "added" | "removed" | "untracked"
}

export interface ChangesIslandProps {
  title?: string
  files?: ChangedFile[]
  actionLabel?: string
  onAction?: () => void
  onFileClick?: (file: ChangedFile) => void
  className?: string
}

// ===== DEFAULT DATA =====

const defaultFiles: ChangedFile[] = [
  { id: "1", name: "variable.ts", path: "src/pages/api", extension: "ts", additions: 37, deletions: 10, status: "modified" },
  { id: "2", name: "SearchBox.tsx", path: "src/pages/api", extension: "tsx", additions: 62, deletions: 7, status: "modified" },
  { id: "3", name: "styles.css", path: "src/pages/api", extension: "css", additions: 27, deletions: 0, status: "added" },
  { id: "4", name: "tokenize.ts", path: "src/pages/api", extension: "ts", additions: 11, deletions: 0, status: "added" },
]

// ===== HELPERS =====

const getFileIcon = (extension?: string): string => {
  switch (extension) {
    case "ts": case "tsx": return "file-types-typescript"
    case "js": case "jsx": return "file-types-javascript"
    case "css": return "file-types-css"
    case "json": return "file-types-json"
    case "md": return "file-types-markdown"
    case "html": return "file-types-html"
    default: return "file-types-text"
  }
}

// ===== COMPONENT =====

export const ChangesIsland = React.forwardRef<HTMLDivElement, ChangesIslandProps>(
  ({
    title = "Changes",
    files: externalFiles,
    actionLabel = "Apply Locally",
    onAction,
    onFileClick,
    className,
  }, ref) => {
    const files = externalFiles ?? defaultFiles

    const renderFile = React.useCallback((file: ChangedFile, opts: ListItemOpts) => (
      <ListItem
        variant="changes"
        text={file.name}
        hint={file.path}
        icon={<Icon fleet={getFileIcon(file.extension)} size="sm" />}
        additions={file.additions}
        deletions={file.deletions}
        onClick={onFileClick ? () => onFileClick(file) : undefined}
      />
    ), [onFileClick])

    return (
      <div
        ref={ref}
        className={cn("flex flex-col h-full w-full", className)}
      >
        {/* Header: title + action button */}
        <div className="flex items-center justify-between px-3 py-2">
          <Typography variant="header-3-semibold">
            {title}
          </Typography>
          <SplitButton
            variant="positive"
            size="default"
            onClick={onAction}
          >
            {actionLabel}
          </SplitButton>
        </div>

        {/* Summary row: file count + controls */}
        <ListItem
          type="heading"
          headingType="secondary"
          text={`${files.length} ${files.length === 1 ? "file" : "files"}`}
          ghostButtons={[
            { icon: <Icon fleet="vcs-commit" size="sm" />, onClick: () => {} },
            { icon: <Icon fleet="configure" size="sm" />, onClick: () => {} },
          ]}
        />

        {/* File list */}
        <div className="flex-1 overflow-hidden px-1.5">
          <List
            items={files}
            keyFn={(file) => file.id}
            renderItem={renderFile}
            height="100%"
            options={{ updateCursorOnHover: true }}
          />
        </div>
      </div>
    )
  }
)
ChangesIsland.displayName = "ChangesIsland"

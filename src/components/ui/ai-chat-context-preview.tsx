"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button-shadcn"
import { Icon } from "./icon"
import { List, ListItem } from "./list"
import { ScrollArea } from "./scroll-area"
import { ToolbarButton } from "./toolbar"

import { ContextMenu, type FleetMenuItem } from "./context-menu"

export interface AiContextEntry {
  id: string
  name: string
  description?: string
  iconKey?: string
  tooltipText?: string
  isPinned?: boolean
  type: 'file' | 'branch' | 'commit' | 'custom'
}

export interface AiTool {
  id: string
  name: string
  description?: string
  iconKey?: string
}

export interface AiChatContext {
  id: string
  contextEntries: AiContextEntry[]
  tools?: AiTool[]
}

export interface AiChatContextPreviewProps {
  context?: AiChatContext
  className?: string
  onRemoveEntry?: (entryId: string) => void
  onTogglePinEntry?: (entryId: string) => void
  onNavigateToEntry?: (entryId: string) => void
  onAddFiles?: () => void
  onAddBranches?: () => void
  onAddCommits?: () => void
  onUploadFile?: () => void
  disabled?: boolean
  maxWidth?: string
}

type PreviewState = 'hidden' | 'collapsed' | 'expanded'

// Helper function to get the right icon for each entry type
const getEntryIcon = (entry: AiContextEntry): string => {
  switch (entry.type) {
    case 'file':
      if (entry.name.endsWith('.kt')) return 'file-types-kotlin'
      if (entry.name.endsWith('.java')) return 'file-types-java'
      if (entry.name.endsWith('.ts')) return 'file-types-typescript'
      if (entry.name.endsWith('.js')) return 'file-types-javascript'
      if (entry.name.endsWith('.py')) return 'file-types-python'
      if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) return 'file-types-yml'
      return 'file-types-text'
    case 'branch':
      return 'vcs-branch'
    case 'commit':
      return 'vcs-commit'
    default:
      return entry.iconKey || 'file-types-text'
  }
}

const AiChatContextPreview = React.forwardRef<HTMLDivElement, AiChatContextPreviewProps>(
  ({
    context: externalContext,
    className,
    onRemoveEntry: externalOnRemoveEntry,
    onTogglePinEntry: externalOnTogglePinEntry,
    onNavigateToEntry,
    onAddFiles,
    onAddBranches,
    onAddCommits,
    onUploadFile,
    disabled,
    maxWidth,
    ...props
  }, ref) => {
    const [previewState, setPreviewState] = React.useState<PreviewState>('hidden')
    
    
    // Internal state for self-managing mode
    const [internalContext, setInternalContext] = React.useState<AiChatContext>({
      id: "default-context",
      contextEntries: [
        {
          id: "1",
          name: "component.tsx",
          description: "React component file",
          type: "file",
          isPinned: true
        },
        {
          id: "2",
          name: "main",
          description: "Current branch",
          type: "branch",
          isPinned: false
        }
      ]
    })
    
    // Use external context if provided, otherwise use internal
    const context = externalContext || internalContext
    
    // Internal handlers for self-managing mode
    const handleRemoveEntry = (entryId: string) => {
      if (externalOnRemoveEntry) {
        externalOnRemoveEntry(entryId)
      } else {
        setInternalContext(prev => ({
          ...prev,
          contextEntries: prev.contextEntries.filter(entry => entry.id !== entryId)
        }))
      }
    }
    
    const handleTogglePinEntry = (entryId: string) => {
      if (externalOnTogglePinEntry) {
        externalOnTogglePinEntry(entryId)
      } else {
        setInternalContext(prev => ({
          ...prev,
          contextEntries: prev.contextEntries.map(entry =>
            entry.id === entryId ? { ...entry, isPinned: !entry.isPinned } : entry
          )
        }))
      }
    }
    
    // Create unified list items combining context entries and tools
    const allItems = React.useMemo(() => {
      const items: Array<{type: 'context', data: AiContextEntry} | {type: 'tools-header'} | {type: 'tool', data: AiTool}> = []
      
      // Separate pinned and unpinned entries
      const pinnedEntries = context.contextEntries.filter(entry => entry.isPinned)
      const unpinnedEntries = context.contextEntries.filter(entry => !entry.isPinned).sort((a, b) => a.name.localeCompare(b.name))
      
      // Add pinned entries first, then unpinned
      pinnedEntries.forEach(entry => {
        items.push({type: 'context', data: entry})
      })
      unpinnedEntries.forEach(entry => {
        items.push({type: 'context', data: entry})
      })
      
      // Tools removed for now
      
      return items
    }, [context.contextEntries])
    
    const entryCount = context.contextEntries.length
    
    
    const togglePreviewState = () => {
      if (previewState === 'hidden') {
        setPreviewState('collapsed')
      } else {
        setPreviewState('hidden')
      }
    }

    const toggleExpandCollapse = () => {
      if (previewState === 'expanded') {
        setPreviewState('collapsed')
      } else {
        setPreviewState('expanded')
      }
    }
    
    const handleEntryClick = (entryId: string) => {
      if (onNavigateToEntry) {
        onNavigateToEntry(entryId)
      }
    }
    
    const handleRemoveEntryClick = (entryId: string, event: React.MouseEvent) => {
      event.stopPropagation()
      handleRemoveEntry(entryId)
    }
    
    const handleTogglePinClick = (entryId: string, event: React.MouseEvent) => {
      event.stopPropagation()
      handleTogglePinEntry(entryId)
    }
    
    const getBackgroundColor = () => {
      // Always use the same background as Figma design
      return 'var(--fleet-context-background)'
    }
    
    const getContentBackground = () => {
      if (previewState === 'hidden') {
        return 'transparent'
      }
      return 'var(--fleet-snippet-content-background)'
    }
    
    
    
    return (
      <div
        ref={ref}
        className={cn(
          "ai-chat-context-preview",
          "transition-all duration-200 ease-in-out",
          "border-transparent",
          "rounded-md",
          previewState === 'hidden' ? "p-0" : "p-1",
          previewState === 'hidden' && "cursor-pointer",
          className
        )}
        style={{
          backgroundColor: getBackgroundColor(),
          maxWidth: maxWidth
        }}
        onClick={previewState === 'hidden' ? togglePreviewState : undefined}
        {...props}
      >
        <div
          className={cn(
            "rounded-md transition-all duration-200 ease-in-out",
            "w-full",
            previewState === 'hidden' ? "p-1" : "p-0"
          )}
          style={{
            backgroundColor: getContentBackground(),
          }}
        >
          {previewState === 'hidden' ? (
            /* Hidden State - Simple Header */
            <div className="flex items-center justify-between px-2 py-0">
              <div className="flex items-center gap-1.5">
                <Icon 
                  fleet="chevron-right" 
                  className="text-[var(--fleet-icon-secondary)] transition-transform duration-200 flex-shrink-0"
                  size="sm"
                />
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-small leading-small font-body-semibold text-[var(--fleet-text-secondary)] tracking-header-5 uppercase">
                    CONTEXT
                  </span>
                  <span className="font-sans text-small leading-small font-body-semibold text-[var(--fleet-text-primary)] tracking-header-5 uppercase">
                    {entryCount}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddFiles?.()
                  }}
                  className="bg-[var(--fleet-ghostButton-off-background-default)] border-[var(--fleet-ghostButton-off-border-default)] hover:bg-[var(--fleet-ghostButton-off-background-hovered)] hover:border-[var(--fleet-ghostButton-off-border-hovered)] p-0.5 rounded-[var(--fleet-radius-xs)] h-5 w-5"
                >
                  <Icon fleet="add" size="sm" />
                </Button>
              </div>
            </div>
          ) : (
            /* Visible State - Custom Header + Content */
            <div className="w-full">
              {/* Custom Header Row */}
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  className="flex items-center gap-1.5 flex-1 text-left bg-transparent border-none"
                  onClick={togglePreviewState}
                >
                  <Icon 
                    fleet="chevron-down" 
                    className="text-[var(--fleet-icon-secondary)] transition-transform duration-200 flex-shrink-0"
                    size="sm"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-small leading-small font-body-semibold text-[var(--fleet-text-secondary)] tracking-header-5 uppercase">
                      CONTEXT
                    </span>
                    <span className="font-sans text-small leading-small font-body-semibold text-[var(--fleet-text-primary)] tracking-header-5 uppercase">
                      {entryCount}
                    </span>
                  </div>
                </button>
                
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddFiles?.()
                    }}
                    className="bg-[var(--fleet-ghostButton-off-background-default)] border-[var(--fleet-ghostButton-off-border-default)] hover:bg-[var(--fleet-ghostButton-off-background-hovered)] hover:border-[var(--fleet-ghostButton-off-border-hovered)] p-0.5 rounded-[var(--fleet-radius-xs)] h-5 w-5"
                  >
                    <Icon fleet="add" size="sm" />
                  </Button>
                  {(
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleExpandCollapse}
                      className="bg-[var(--fleet-ghostButton-off-background-default)] border-[var(--fleet-ghostButton-off-border-default)] hover:bg-[var(--fleet-ghostButton-off-background-hovered)] hover:border-[var(--fleet-ghostButton-off-border-hovered)] p-0.5 rounded-[var(--fleet-radius-xs)] h-5 w-5"
                    >
                      <Icon fleet={previewState === 'expanded' ? "collapse" : "expand"} size="sm" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content Area - Always rendered for smooth transitions */}
          <div>
            <ScrollArea 
              className={cn(
                "transition-all duration-200",
                previewState === 'hidden' && "h-0",
                previewState === 'collapsed' && "h-[120px]",
                previewState === 'expanded' && "h-[400px]"
              )}
            >
              <List
                items={allItems}
                keyFn={(item) => {
                  if (item.type === 'context') return item.data.id
                  if (item.type === 'tools-header') return 'tools-header'
                  if (item.type === 'tool') return `tool-${item.data.id}`
                  return 'unknown'
                }}
                renderItem={(item, opts) => {
                  if (item.type === 'context') {
                    const entry = item.data
                    return (
                      <ListItem
                        variant="buttons"
                        text={entry.name}
                        hint={entry.description}
                        icon={<Icon fleet={getEntryIcon(entry)} />}
                        rightIcon={
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handleRemoveEntryClick(entry.id, e)
                              }}
                              className={cn(!opts.isHovered && "invisible")}
                            >
                              <Icon fleet="close" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handleTogglePinClick(entry.id, e)
                              }}
                              className={cn(
                                entry.isPinned ? "text-[var(--fleet-icon-primary)]" : !opts.isHovered && "invisible"
                              )}
                            >
                              <Icon fleet="pin" />
                            </Button>
                          </div>
                        }
                      />
                    )
                  }
                  return null
                }}
                onConfirm={(items) => {
                  const item = items[0]
                  if (item && item.type === 'context') {
                    handleEntryClick(item.data.id)
                  }
                }}
                options={{
                  updateCursorOnHover: true,
                  resetCursorOnMouseLeave: true,
                  selectFirstItemOnFocus: false,
                  confirmOnClick: false,
                  spacing: 0
                }}
                height="auto"
              />
            </ScrollArea>
          </div>
        </div>
      </div>
    )
  }
)
AiChatContextPreview.displayName = "AiChatContextPreview"


// Attach File Button Component
interface AttachFileButtonProps {
  onAddFiles?: () => void
  onAddBranches?: () => void
  onAddCommits?: () => void
  onUploadFile?: () => void
  disabled?: boolean
}

const AttachFileButton = React.forwardRef<HTMLButtonElement, AttachFileButtonProps>(
  ({ onAddFiles, onAddBranches, onAddCommits, onUploadFile }, ref) => {
    const menuItems: FleetMenuItem[] = [
      {
        type: 'action',
        name: 'Files',
        icon: 'new-file',
        enabled: true,
        callback: () => onAddFiles?.()
      },
      {
        type: 'action',
        name: 'Branches',
        icon: 'vcs-branch',
        enabled: true,
        callback: () => onAddBranches?.()
      },
      {
        type: 'action',
        name: 'Commits',
        icon: 'vcs-commit',
        enabled: true,
        callback: () => onAddCommits?.()
      },
      {
        type: 'separator'
      },
      {
        type: 'action',
        name: 'Upload From Computer...',
        icon: 'add',
        enabled: true,
        callback: () => onUploadFile?.()
      }
    ]

    return (
      <ContextMenu
        items={menuItems}
        trigger={
          <ToolbarButton
            ref={ref}
            icon="add"
            tooltip="Add to Chat Context"
            disabled={false}
          />
        }
      />
    )
  }
)
AttachFileButton.displayName = "AttachFileButton"

export { AiChatContextPreview }
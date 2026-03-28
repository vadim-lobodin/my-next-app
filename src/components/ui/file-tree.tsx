"use client"

import * as React from "react"
import { Icon } from "./icon"
import { Typography } from "./typography"

// File Tree Types - reused from lists example
export interface FileTreeItem {
  id: string
  name: string
  type: 'folder' | 'file'
  extension?: string
  level: number
  isExpanded?: boolean
  parentId?: string
}

export interface FileTreeProps {
  items: FileTreeItem[]
  onItemClick?: (item: FileTreeItem) => void
  onFolderToggle?: (folderId: string) => void
  expandedFolders?: Set<string>
  className?: string
}

const getFileIcon = (extension?: string): string => {
  switch (extension) {
    case 'css':
      return 'file-types-css'
    case 'tsx':
    case 'ts':
      return 'file-types-typescript'
    case 'js':
      return 'file-types-javascript'
    case 'json':
      return 'file-types-json'
    case 'docker':
      return 'file-types-docker'
    case 'gitignore':
      return 'file-types-gitignore'
    case 'md':
      return 'file-types-markdown'
    case 'yml':
    case 'yaml':
      return 'file-types-yaml'
    default:
      return 'file-types-text'
  }
}

const getVisibleItems = (items: FileTreeItem[], expandedFolders: Set<string>): FileTreeItem[] => {
  return items.filter(item => {
    if (item.level === 0) return true
    
    // Check if all parent folders are expanded
    let currentItem = item
    while (currentItem.parentId) {
      const parent = items.find(f => f.id === currentItem.parentId)
      if (!parent || !expandedFolders.has(parent.id)) {
        return false
      }
      currentItem = parent
    }
    return true
  })
}

export const FileTree = React.forwardRef<HTMLDivElement, FileTreeProps>(
  ({ items, onItemClick, onFolderToggle, expandedFolders = new Set(), className }, ref) => {
    const visibleItems = React.useMemo(() => 
      getVisibleItems(items, expandedFolders), 
      [items, expandedFolders]
    )

    const handleFolderClick = React.useCallback((folderId: string, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onFolderToggle?.(folderId)
    }, [onFolderToggle])

    const handleItemClick = React.useCallback((item: FileTreeItem, e: React.MouseEvent) => {
      if (item.type === 'file') {
        e.preventDefault()
        e.stopPropagation()
        onItemClick?.(item)
      }
    }, [onItemClick])

    const renderTreeItem = React.useCallback((item: FileTreeItem) => {
      const isExpanded = expandedFolders.has(item.id)
      // Air spacing formula: 8px base + (level * 16px)
      const indentPx = 8 + (item.level * 16)
      
      if (item.type === 'folder') {
        return (
          <div 
            key={item.id}
            className="flex items-center gap-1 w-full min-w-0 cursor-pointer hover:bg-[var(--fleet-ghostButton-off-background-hovered)] px-3 py-1 mx-1.5 rounded transition-colors duration-75" 
            style={{ paddingLeft: `${indentPx}px` }}
            onClick={(e) => handleFolderClick(item.id, e)}
          >
            <Icon 
              fleet={isExpanded ? "chevron-down" : "chevron-right"} 
              size="sm" 
              className="flex-shrink-0 text-[var(--fleet-icon-default)]" 
            />
            <Icon 
              fleet="folder" 
              size="sm" 
              className="flex-shrink-0 text-[var(--fleet-icon-default)]" 
            />
            <Typography 
              variant="default" 
              className="truncate text-[var(--fleet-text-default)]"
            >
              {item.name}
            </Typography>
          </div>
        )
      } else {
        return (
          <div 
            key={item.id}
            className="flex items-center gap-1 w-full min-w-0 cursor-pointer hover:bg-[var(--fleet-ghostButton-off-background-hovered)] px-3 py-1 mx-1.5 rounded transition-colors duration-75" 
            style={{ paddingLeft: `${indentPx}px` }}
            onClick={(e) => handleItemClick(item, e)}
          >
            <Icon 
              fleet={getFileIcon(item.extension)} 
              size="sm" 
              className="flex-shrink-0" 
            />
            <Typography 
              variant="default" 
              className="truncate text-[var(--fleet-text-default)]"
            >
              {item.name}
            </Typography>
          </div>
        )
      }
    }, [expandedFolders, handleFolderClick, handleItemClick])

    return (
      <div 
        ref={ref}
        className={`flex flex-col w-full ${className || ''}`}
      >
        {visibleItems.map(renderTreeItem)}
      </div>
    )
  }
)

FileTree.displayName = "FileTree"

// Default project tree data
export const defaultProjectTree: FileTreeItem[] = [
  { id: 'src', name: 'src', type: 'folder', level: 0, isExpanded: true },
  { id: 'src/app', name: 'app', type: 'folder', level: 1, parentId: 'src', isExpanded: true },
  { id: 'src/app/layout.tsx', name: 'layout.tsx', type: 'file', extension: 'tsx', level: 2, parentId: 'src/app' },
  { id: 'src/app/page.tsx', name: 'page.tsx', type: 'file', extension: 'tsx', level: 2, parentId: 'src/app' },
  { id: 'src/app/globals.css', name: 'globals.css', type: 'file', extension: 'css', level: 2, parentId: 'src/app' },
  { id: 'src/components', name: 'components', type: 'folder', level: 1, parentId: 'src', isExpanded: true },
  { id: 'src/components/ui', name: 'ui', type: 'folder', level: 2, parentId: 'src/components', isExpanded: false },
  { id: 'src/components/ui/button.tsx', name: 'button.tsx', type: 'file', extension: 'tsx', level: 3, parentId: 'src/components/ui' },
  { id: 'src/components/ui/window-layout.tsx', name: 'window-layout.tsx', type: 'file', extension: 'tsx', level: 3, parentId: 'src/components/ui' },
  { id: 'src/lib', name: 'lib', type: 'folder', level: 1, parentId: 'src', isExpanded: false },
  { id: 'src/lib/utils.ts', name: 'utils.ts', type: 'file', extension: 'ts', level: 2, parentId: 'src/lib' },
  { id: 'package.json', name: 'package.json', type: 'file', extension: 'json', level: 0 },
  { id: 'tsconfig.json', name: 'tsconfig.json', type: 'file', extension: 'json', level: 0 },
  { id: 'tailwind.config.js', name: 'tailwind.config.js', type: 'file', extension: 'js', level: 0 },
  { id: 'README.md', name: 'README.md', type: 'file', extension: 'md', level: 0 },
]
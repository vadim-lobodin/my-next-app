"use client"

import React, { useState, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Island, IslandWithTabs, TabBar, TabContentArea } from "./island"
import { Typography } from "./typography"
import { Icon } from "./icon"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"

// File Tree Data Types
export interface FileTreeItem {
  id: string
  name: string
  type: 'folder' | 'file'
  extension?: string
  level: number
  isExpanded?: boolean
  parentId?: string
}

// Default Air project structure
export const defaultProjectTree: FileTreeItem[] = [
  { id: '1', name: '.next', type: 'folder', level: 0, isExpanded: false },
  { id: '1-1', name: 'cache', type: 'folder', level: 1, parentId: '1' },
  { id: '1-2', name: 'static', type: 'folder', level: 1, parentId: '1' },
  { id: '1-3', name: 'build-manifest.json', type: 'file', extension: 'json', level: 1, parentId: '1' },
  { id: '2', name: 'src', type: 'folder', level: 0, isExpanded: true },
  { id: '2-1', name: 'app', type: 'folder', level: 1, parentId: '2', isExpanded: true },
  { id: '2-1-1', name: 'globals.css', type: 'file', extension: 'css', level: 2, parentId: '2-1' },
  { id: '2-1-2', name: 'layout.tsx', type: 'file', extension: 'tsx', level: 2, parentId: '2-1' },
  { id: '2-1-3', name: 'page.tsx', type: 'file', extension: 'tsx', level: 2, parentId: '2-1' },
  { id: '2-2', name: 'components', type: 'folder', level: 1, parentId: '2', isExpanded: true },
  { id: '2-2-1', name: 'ui', type: 'folder', level: 2, parentId: '2-2', isExpanded: false },
  { id: '2-2-1-1', name: 'button.tsx', type: 'file', extension: 'tsx', level: 3, parentId: '2-2-1' },
  { id: '2-2-1-2', name: 'input.tsx', type: 'file', extension: 'tsx', level: 3, parentId: '2-2-1' },
  { id: '2-2-1-3', name: 'island.tsx', type: 'file', extension: 'tsx', level: 3, parentId: '2-2-1' },
  { id: '2-3', name: 'lib', type: 'folder', level: 1, parentId: '2' },
  { id: '2-3-1', name: 'utils.ts', type: 'file', extension: 'ts', level: 2, parentId: '2-3' },
  { id: '3', name: 'node_modules', type: 'folder', level: 0, isExpanded: false },
  { id: '3-1', name: 'react', type: 'folder', level: 1, parentId: '3' },
  { id: '3-2', name: 'next', type: 'folder', level: 1, parentId: '3' },
  { id: '4', name: '.gitignore', type: 'file', extension: 'gitignore', level: 0 },
  { id: '5', name: 'package.json', type: 'file', extension: 'json', level: 0 },
  { id: '6', name: 'tsconfig.json', type: 'file', extension: 'json', level: 0 },
  { id: '7', name: 'README.md', type: 'file', extension: 'md', level: 0 }
]

// File Tree Component Props
export interface FileTreeProps {
  items?: FileTreeItem[]
  className?: string
  onFileClick?: (item: FileTreeItem) => void
  onFolderToggle?: (item: FileTreeItem, isExpanded: boolean) => void
}

// File Tree Island Component Props  
export interface FileTreeIslandProps extends FileTreeProps {
  className?: string
  showTabs?: boolean
  tabTitle?: string
}

// Get file icon based on extension
const getFileIcon = (extension?: string): string => {
  switch (extension) {
    case 'css':
      return 'file-types-css'
    case 'tsx':
    case 'ts':
      return 'file-types-typescript'
    case 'js':
    case 'jsx':
      return 'file-types-javascript'
    case 'json':
      return 'file-types-json'
    case 'docker':
      return 'file-types-docker'
    case 'gitignore':
      return 'file-types-gitignore'
    case 'md':
      return 'file-types-markdown'
    case 'html':
      return 'file-types-html'
    case 'xml':
      return 'file-types-xml'
    case 'yaml':
    case 'yml':
      return 'file-types-yaml'
    default:
      return 'file-types-text'
  }
}

// Core File Tree Component
export const FileTree = React.forwardRef<HTMLDivElement, FileTreeProps>(
  ({ items = defaultProjectTree, className, onFileClick, onFolderToggle }, ref) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
      new Set(items.filter(item => item.isExpanded).map(item => item.id))
    )

    const toggleFolder = useCallback((folderId: string) => {
      setExpandedFolders(prev => {
        const newSet = new Set(prev)
        const wasExpanded = newSet.has(folderId)
        if (wasExpanded) {
          newSet.delete(folderId)
        } else {
          newSet.add(folderId)
        }
        
        // Call callback if provided
        const item = items.find(i => i.id === folderId)
        if (item && onFolderToggle) {
          onFolderToggle(item, !wasExpanded)
        }
        
        return newSet
      })
    }, [items, onFolderToggle])

    const getVisibleTreeItems = useMemo(() => {
      const isItemVisible = (item: FileTreeItem): boolean => {
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
      }
      
      return items.filter(isItemVisible)
    }, [items, expandedFolders])

    const renderFileTreeItem = useCallback((item: FileTreeItem) => {
      const isExpanded = expandedFolders.has(item.id)
      // Air spacing: 6px base padding + 16px per level (Air List Cell standard)
      const iconPaddingLeft = 6 + (item.level * 16)
      
      if (item.type === 'folder') {
        return (
          <div 
            className="flex items-center gap-1 w-full min-w-0 cursor-pointer hover:bg-[var(--fleet-ghostButton-off-background-hovered)] h-6 pr-1 rounded-[var(--fleet-radius-sm)] transition-colors duration-75" 
            style={{ paddingLeft: `${iconPaddingLeft}px` }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFolder(item.id)
            }}
          >
            <Icon 
              fleet={isExpanded ? "chevron-down" : "chevron-right"} 
              size="sm" 
              className="flex-shrink-0 text-muted-foreground" 
            />
            <Typography variant="default" className="truncate">
              {item.name}
            </Typography>
          </div>
        )
      } else {
        return (
          <div
            className="flex items-center gap-1 w-full min-w-0 h-6 pr-1 rounded-[var(--fleet-radius-sm)] transition-colors duration-75 cursor-pointer hover:bg-[var(--fleet-ghostButton-off-background-hovered)]"
            style={{ paddingLeft: `${iconPaddingLeft}px` }}
            onClick={onFileClick ? () => onFileClick(item) : undefined}
          >
            <Icon 
              fleet={getFileIcon(item.extension)} 
              size="sm" 
              className="flex-shrink-0" 
            />
            <Typography variant="default" className="truncate">
              {item.name}
            </Typography>
          </div>
        )
      }
    }, [expandedFolders, toggleFolder, onFileClick])

    return (
      <div 
        ref={ref}
        className={cn("flex flex-col gap-0.5 overflow-auto", className)}
      >
        {getVisibleTreeItems.map((item) => (
          <div key={item.id}>
            {renderFileTreeItem(item)}
          </div>
        ))}
      </div>
    )
  }
)
FileTree.displayName = "FileTree"

// File Tree Island - Island container with File tab
export const FileTreeIsland = React.forwardRef<HTMLDivElement, FileTreeIslandProps>(
  ({ 
    items = defaultProjectTree, 
    className, 
    onFileClick, 
    onFolderToggle,
    showTabs = true,
    tabTitle = "Files"
  }, ref) => {
    if (!showTabs) {
      return (
        <Island className={cn("h-full", className)} ref={ref} padding="default">
          <FileTree 
            items={items}
            onFileClick={onFileClick}
            onFolderToggle={onFolderToggle}
            className="h-full"
          />
        </Island>
      )
    }

    return (
      <IslandWithTabs className={cn("h-full", className)} ref={ref}>
        <Tabs defaultValue="files" className="w-full h-full flex flex-col">
          {/* Tab Bar - Now uses TabBar component with 6px padding */}
          <TabBar>
            <TabsList className="h-auto bg-transparent gap-1 p-0">
              <TabsTrigger value="files">
                {tabTitle}
              </TabsTrigger>
            </TabsList>
          </TabBar>
          
          {/* Content - Now uses TabContentArea component */}
          <TabContentArea>
            <TabsContent value="files" className="mt-0 h-full">
              <Island className="h-full" padding="default">
                <FileTree 
                  items={items}
                  onFileClick={onFileClick}
                  onFolderToggle={onFolderToggle}
                  className="h-full"
                />
              </Island>
            </TabsContent>
          </TabContentArea>
        </Tabs>
      </IslandWithTabs>
    )
  }
)
FileTreeIsland.displayName = "FileTreeIsland"

// FileTreeItem is exported via interface declaration above
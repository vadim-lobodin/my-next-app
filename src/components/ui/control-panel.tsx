"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button-shadcn"
import { Icon } from "./icon"
import { List, ListItem } from "./list"
import { ScrollArea, ScrollBar } from "./scroll-area"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "./tabs"

export interface ControlPanelItem {
  id: string
  name: string
  description?: string
  iconKey?: string
  isPinned?: boolean
  type: 'file' | 'folder' | 'branch' | 'commit' | 'process' | 'terminal' | 'tool' | 'specification' | 'header'
  status?: {
    additions?: number
    deletions?: number
    isRunning?: boolean
    isModified?: boolean
  }
}

export interface ControlPanelSection {
  id: string
  name: string
  items: ControlPanelItem[]
  iconKey?: string
}

export interface ControlPanelData {
  sections: ControlPanelSection[]
}

export interface ControlPanelProps {
  data?: ControlPanelData
  className?: string
  onAddToSection?: (sectionId: string) => void
  onRemoveItem?: (sectionId: string, itemId: string) => void
  onTogglePinItem?: (sectionId: string, itemId: string) => void
  onNavigateToItem?: (sectionId: string, itemId: string) => void
  disabled?: boolean
  maxWidth?: string
  defaultActiveSection?: string
}

type PanelState = 'hidden' | 'collapsed' | 'expanded'

// Helper function to get the right icon for each item type
const getItemIcon = (item: ControlPanelItem): string => {
  switch (item.type) {
    case 'file':
      if (item.name.endsWith('.kt')) return 'file-types-kotlin'
      if (item.name.endsWith('.java')) return 'file-types-java'
      if (item.name.endsWith('.ts')) return 'file-types-typescript'
      if (item.name.endsWith('.js')) return 'file-types-javascript'
      if (item.name.endsWith('.py')) return 'file-types-python'
      if (item.name.endsWith('.yaml') || item.name.endsWith('.yml')) return 'file-types-yml'
      if (item.name.endsWith('.tsx')) return 'file-types-typescript'
      if (item.name.endsWith('.jsx')) return 'file-types-javascript'
      if (item.name.endsWith('.css')) return 'file-types-css'
      return 'file-types-text'
    case 'folder':
      return 'folder'
    case 'branch':
      return 'vcs-branch'
    case 'commit':
      return 'vcs-commit'
    case 'process':
      return 'terminal'
    case 'terminal':
      return 'terminal'
    case 'tool':
      return 'tools'
    case 'specification':
      return 'file-types-text'
    default:
      return item.iconKey || 'file-types-text'
  }
}

const ControlPanel = React.forwardRef<HTMLDivElement, ControlPanelProps>(
  ({
    data: externalData,
    className,
    onAddToSection: externalOnAddToSection,
    onRemoveItem: externalOnRemoveItem,
    onTogglePinItem: externalOnTogglePinItem,
    onNavigateToItem,
    maxWidth,
    defaultActiveSection = "context",
    ...props
  }, ref) => {
    const [panelState, setPanelState] = React.useState<PanelState>('hidden')
    const [activeSection, setActiveSection] = React.useState(defaultActiveSection)
    
    // Internal state for self-managing mode - mock data matching the Figma design
    const [internalData, setInternalData] = React.useState<ControlPanelData>({
      sections: [
        {
          id: "context",
          name: "Context",
          items: [
            {
              id: "1",
              name: "create-textures.tsx",
              description: "Hint",
              type: "file",
              isPinned: true
            },
            {
              id: "2", 
              name: "frontend/src/",
              type: "folder",
              isPinned: false
            },
            {
              id: "3",
              name: "package.json",
              description: "/",
              type: "file",
              isPinned: false
            },
            {
              id: "4",
              name: "Codebase",
              description: "workspace/codebase",
              type: "specification",
              isPinned: false
            }
          ]
        },
        {
          id: "changes", 
          name: "Changes",
          items: [
            {
              id: "1",
              name: "App.js",
              description: "frontend/src/components",
              type: "file",
              status: { additions: 3, deletions: 23 }
            },
            {
              id: "2",
              name: "Filter.js", 
              description: "frontend/src/components",
              type: "file",
              status: { additions: 57, deletions: 0 }
            },
            {
              id: "3",
              name: "Filter.css",
              description: "frontend/src/components", 
              type: "file",
              status: { additions: 12, deletions: 0 }
            },
            {
              id: "4",
              name: "Sortings.js",
              description: "frontend/src/components",
              type: "file", 
              status: { additions: 95, deletions: 0 }
            }
          ]
        },
        {
          id: "processes",
          name: "Processes", 
          items: [
            {
              id: "1",
              name: "Terminal",
              description: "npm run dev",
              type: "terminal",
              status: { isRunning: true }
            },
            {
              id: "2",
              name: "Terminal",
              description: "npm watch",
              type: "terminal",
              status: { isRunning: true }
            },
            {
              id: "3",
              name: "Terminal",
              description: "npm test",
              type: "terminal",
              status: { isRunning: false }
            }
          ]
        },
        {
          id: "other",
          name: "Other",
          items: [
            {
              id: "1",
              name: "Context 7",
              type: "tool"
            },
            {
              id: "2",
              name: "plan.md",
              type: "specification"
            }
          ]
        }
      ]
    })
    
    // Use external data if provided, otherwise use internal
    const data = externalData || internalData
    
    // Internal handlers for self-managing mode
    const handleAddToSection = (sectionId: string) => {
      if (externalOnAddToSection) {
        externalOnAddToSection(sectionId)
      } else {
        // Add mock item for demonstration
        setInternalData(prev => ({
          ...prev,
          sections: prev.sections.map(section => 
            section.id === sectionId 
              ? {
                  ...section,
                  items: [...section.items, {
                    id: Date.now().toString(),
                    name: `New Item ${section.items.length + 1}`,
                    type: 'file' as const
                  }]
                }
              : section
          )
        }))
      }
    }
    
    const handleTogglePinItem = (sectionId: string, itemId: string) => {
      if (externalOnTogglePinItem) {
        externalOnTogglePinItem(sectionId, itemId)
      } else {
        setInternalData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  items: section.items.map(item =>
                    item.id === itemId ? { ...item, isPinned: !item.isPinned } : item
                  )
                }
              : section
          )
        }))
      }
    }
    
    const handleRemoveItem = (sectionId: string, itemId: string) => {
      if (externalOnRemoveItem) {
        externalOnRemoveItem(sectionId, itemId)
      } else {
        setInternalData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  items: section.items.filter(item => item.id !== itemId)
                }
              : section
          )
        }))
      }
    }
    
    const togglePanelState = () => {
      if (panelState === 'hidden') {
        setPanelState('collapsed')
      } else {
        setPanelState('hidden')
      }
    }

    const toggleExpandCollapse = () => {
      if (panelState === 'expanded') {
        setPanelState('collapsed')
      } else if (panelState === 'collapsed') {
        setPanelState('expanded')
      } else {
        // If hidden, go to collapsed first
        setPanelState('collapsed')
      }
    }
    
    const handleItemClick = (sectionId: string, itemId: string) => {
      if (onNavigateToItem) {
        onNavigateToItem(sectionId, itemId)
      }
    }
    
    const handleRemoveItemClick = (sectionId: string, itemId: string, event: React.MouseEvent) => {
      event.stopPropagation()
      handleRemoveItem(sectionId, itemId)
    }
    
    const handleTogglePinClick = (sectionId: string, itemId: string, event: React.MouseEvent) => {
      event.stopPropagation()
      handleTogglePinItem(sectionId, itemId)
    }
    
    const getBackgroundColor = () => {
      return 'var(--fleet-context-background)'
    }
    
    const getContentBackground = () => {
      if (panelState === 'hidden') {
        return 'transparent'
      }
      return 'var(--fleet-snippet-content-background)'
    }
    
    // Generate overview text for minimized state  
    const getOverviewText = () => {
      const sectionSummaries = data.sections
        .filter(section => section.items.length > 0)
        .map(section => {
          const count = section.items.length
          const sectionName = section.name.toLowerCase()
          // Only add "items" for context section
          return section.id === 'context' 
            ? `${count} ${sectionName} items`
            : `${count} ${sectionName}`
        })
      
      if (sectionSummaries.length === 0) return 'No items'
      if (sectionSummaries.length === 1) return sectionSummaries[0]
      if (sectionSummaries.length === 2) return `${sectionSummaries[0]}, ${sectionSummaries[1]}`
      
      const last = sectionSummaries.pop()
      return `${sectionSummaries.join(', ')}, ${last}`
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "control-panel",
          "border-transparent",
          "rounded-md mx-1",
          panelState === 'hidden' ? "p-0" : "p-1",
          panelState === 'hidden' && "cursor-pointer",
          className
        )}
        style={{
          backgroundColor: getBackgroundColor(),
          maxWidth: maxWidth
        }}
        onClick={panelState === 'hidden' ? togglePanelState : undefined}
        {...props}
      >
        <div
          className={cn(
            "rounded-md",
            "w-full",
            panelState === 'hidden' ? "p-1" : "p-0"
          )}
          style={{
            backgroundColor: getContentBackground(),
          }}
        >
          {panelState === 'hidden' ? (
            /* Hidden State - Simple Header */
            <div className="flex items-center justify-between px-1 py-0.5">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Icon
                  fleet="chevron-right"
                  className="text-[var(--fleet-icon-secondary)] flex-shrink-0"
                  size="sm"
                />
                <span className="font-sans font-body-regular text-default leading-default-multiline text-[var(--fleet-text-secondary)] truncate">
                  {getOverviewText()}
                </span>
              </div>

              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToSection(activeSection)
                  }}
                  className="bg-[var(--fleet-ghostButton-off-background-default)] border-[var(--fleet-ghostButton-off-border-default)] hover:bg-[var(--fleet-ghostButton-off-background-hovered)] hover:border-[var(--fleet-ghostButton-off-border-hovered)] p-0.5 rounded-[var(--fleet-radius-xs)] h-5 w-5"
                >
                  <Icon fleet="add" size="sm" />
                </Button>
              </div>
            </div>
          ) : (
            /* Visible State - Tabs + Content */
            <div className="w-full">
              <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                {/* Header with Tabs */}
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <button
                      className="flex items-center gap-1.5 bg-transparent border-none flex-shrink-0"
                      onClick={togglePanelState}
                    >
                      <Icon 
                        fleet="chevron-down" 
                        className="text-[var(--fleet-icon-secondary)] transition-transform duration-200"
                        size="sm"
                      />
                    </button>
                    
                    <div className="flex-1 min-w-0 overflow-hidden relative">
                      <ScrollArea className="w-full">
                        <TabsList className="w-max justify-start h-auto p-0 bg-transparent flex gap-0.5">
                          {data.sections.map((section) => (
                            <TabsTrigger
                              key={section.id}
                              value={section.id}
                              size="sm"
                              className="flex-shrink-0 whitespace-nowrap"
                            >
                              <span>{section.name}</span>
                              <span className="text-[var(--fleet-text-secondary)] ml-1">
                                {section.items.length}
                              </span>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" className="invisible" />
                      </ScrollArea>
                      {/* Fade overlay on the right */}
                      <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-l from-[var(--fleet-snippet-content-background)] to-transparent pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToSection(activeSection)
                      }}
                      className="bg-[var(--fleet-ghostButton-off-background-default)] border-[var(--fleet-ghostButton-off-border-default)] hover:bg-[var(--fleet-ghostButton-off-background-hovered)] hover:border-[var(--fleet-ghostButton-off-border-hovered)] p-0.5 rounded-[var(--fleet-radius-xs)] h-5 w-5"
                    >
                      <Icon fleet="add" size="sm" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleExpandCollapse}
                      className="bg-[var(--fleet-ghostButton-off-background-default)] border-[var(--fleet-ghostButton-off-border-default)] hover:bg-[var(--fleet-ghostButton-off-background-hovered)] hover:border-[var(--fleet-ghostButton-off-border-hovered)] p-0.5 rounded-[var(--fleet-radius-xs)] h-5 w-5"
                    >
                      <Icon fleet={panelState === 'expanded' ? "collapse" : "expand"} size="sm" />
                    </Button>
                  </div>
                </div>
                
                <div
                  className="overflow-hidden"
                  style={{ height: panelState === 'expanded' ? 400 : 120 }}
                >
                {data.sections.map((section) => (
                  <TabsContent key={section.id} value={section.id} className="mt-0 p-0">
                    <ScrollArea className="h-full">
                      <List
                        items={section.id === 'context' 
                          ? [...section.items].sort((a, b) => {
                              // Sort pinned items first
                              if (a.isPinned && !b.isPinned) return -1
                              if (!a.isPinned && b.isPinned) return 1
                              return a.name.localeCompare(b.name)
                            })
                          : section.id === 'other'
                          ? (() => {
                              // Group items by type for Others section
                              const groups: { [key: string]: ControlPanelItem[] } = {}
                              section.items.forEach(item => {
                                const groupKey = item.type === 'tool' ? 'tools' : 'specifications'
                                if (!groups[groupKey]) groups[groupKey] = []
                                groups[groupKey].push(item)
                              })
                              
                              const result: ControlPanelItem[] = []
                              Object.entries(groups).forEach(([groupKey, items]) => {
                                // Add header
                                result.push({
                                  id: `header-${groupKey}`,
                                  name: groupKey.toUpperCase(),
                                  type: 'header'
                                })
                                // Add items
                                items.forEach(item => result.push(item))
                              })
                              return result
                            })()
                          : section.items
                        }
                        keyFn={(item) => item.id}
                        renderItem={(item, opts) => {
                          // Handle header items
                          if (item.type === 'header') {
                            return (
                              <ListItem
                                type="heading"
                                headingType="tertiary"
                                text={item.name}
                              />
                            )
                          }
                          
                          if (section.id === 'changes') {
                            return (
                              <ListItem
                                variant="changes"
                                text={item.name}
                                hint={item.description}
                                icon={<Icon fleet={getItemIcon(item)} />}
                                additions={item.status?.additions}
                                deletions={item.status?.deletions}
                              />
                            )
                          }
                          
                          return (
                            <ListItem
                              variant="buttons"
                              text={item.name}
                              hint={item.description}
                              icon={<Icon fleet={getItemIcon(item)} />}
                              rightIcon={
                                <div className="flex items-center gap-1">
                                  {item.status?.isRunning && (
                                    <div className="w-2 h-2 bg-[var(--fleet-vcs-added)] rounded-full animate-pulse" />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onMouseDown={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      handleRemoveItemClick(section.id, item.id, e)
                                    }}
                                    className={cn(!opts.isHovered && "invisible")}
                                  >
                                    <Icon fleet="close" />
                                  </Button>
                                  {section.id === 'context' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onMouseDown={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        handleTogglePinClick(section.id, item.id, e)
                                      }}
                                      className={cn(
                                        item.isPinned ? "text-[var(--fleet-icon-primary)]" : !opts.isHovered && "invisible"
                                      )}
                                    >
                                      <Icon fleet="pin" />
                                    </Button>
                                  )}
                                </div>
                              }
                            />
                          )
                        }}
                        onConfirm={(items) => {
                          const item = items[0]
                          if (item) {
                            handleItemClick(section.id, item.id)
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
                  </TabsContent>
                ))}
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    )
  }
)
ControlPanel.displayName = "ControlPanel"

export { ControlPanel }
"use client"

import React, { useState, useCallback, useRef, createContext, useContext, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  closestCenter,
} from "@dnd-kit/core"
import {
  arrayMove,
} from "@dnd-kit/sortable"
import { DraggableTab, TabIsland } from "./island"

// Types
// Note: DraggableTab and TabIsland types have been moved to island.tsx

interface DraggableTabsContextValue {
  islands: TabIsland[]
  activeId: UniqueIdentifier | null
  isDragCompleting: boolean
  updateIslands: (islands: TabIsland[]) => void
  setActiveTab: (islandId: UniqueIdentifier, tabId: UniqueIdentifier) => void
}

// Context
const DraggableTabsContext = createContext<DraggableTabsContextValue | null>(null)

export const useDraggableTabs = () => {
  const context = useContext(DraggableTabsContext)
  if (!context) {
    throw new Error("useDraggableTabs must be used within a DraggableTabsProvider")
  }
  return context
}

// Provider
interface DraggableTabsProviderProps {
  children: React.ReactNode
  initialIslands: TabIsland[]
  onIslandsChange?: (islands: TabIsland[]) => void
}

export const DraggableTabsProvider: React.FC<DraggableTabsProviderProps> = ({
  children,
  initialIslands,
}) => {
  const [islands, setIslands] = useState<TabIsland[]>(initialIslands)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isDragCompleting, setIsDragCompleting] = useState(false)
  const preventScrollRef = useRef<((e: Event) => void) | null>(null)

  const lockScroll = useCallback(() => {
    const handler = (e: Event) => e.preventDefault()
    preventScrollRef.current = handler
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    window.addEventListener("wheel", handler, { passive: false })
    window.addEventListener("touchmove", handler, { passive: false })
    window.addEventListener("scroll", handler, true)
  }, [])

  const unlockScroll = useCallback(() => {
    document.documentElement.style.overflow = ""
    document.body.style.overflow = ""
    if (preventScrollRef.current) {
      window.removeEventListener("wheel", preventScrollRef.current)
      window.removeEventListener("touchmove", preventScrollRef.current)
      window.removeEventListener("scroll", preventScrollRef.current, true)
      preventScrollRef.current = null
    }
  }, [])

  // Ensure DndContext only runs on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const updateIslands = useCallback((newIslands: TabIsland[]) => {
    setIslands(newIslands)
  }, [])


  const setActiveTab = useCallback((islandId: UniqueIdentifier, tabId: UniqueIdentifier) => {
    setIslands(prev => {
      const newIslands = [...prev]
      const islandIdx = newIslands.findIndex(island => island.id === islandId)
      if (islandIdx !== -1) {
        newIslands[islandIdx].activeTab = tabId
      }
      return newIslands
    })
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
    setIsDragCompleting(false)
    lockScroll()
  }, [lockScroll])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find which islands contain the active and over items
    const activeIsland = islands.find(island => 
      island.tabs.some(tab => tab.id === activeId)
    )
    const overIsland = islands.find(island => 
      island.tabs.some(tab => tab.id === overId)
    )

    if (!activeIsland || !overIsland || activeIsland.id === overIsland.id) {
      return // Same container or not found
    }

    // Move item between containers
    setIslands(prev => {
      const newIslands = [...prev]
      const fromIdx = newIslands.findIndex(island => island.id === activeIsland.id)
      const toIdx = newIslands.findIndex(island => island.id === overIsland.id)
      
      if (fromIdx !== -1 && toIdx !== -1) {
        const fromIslandData = { ...newIslands[fromIdx] }
        const toIslandData = { ...newIslands[toIdx] }
        
        const tabIndex = fromIslandData.tabs.findIndex(tab => tab.id === activeId)
        if (tabIndex !== -1) {
          const [tab] = fromIslandData.tabs.splice(tabIndex, 1)
          
          // Find insertion point
          const overTabIndex = toIslandData.tabs.findIndex(tab => tab.id === overId)
          if (overTabIndex !== -1) {
            toIslandData.tabs.splice(overTabIndex, 0, tab)
          } else {
            toIslandData.tabs.push(tab)
          }
          
          // Update active tabs
          if (fromIslandData.activeTab === activeId) {
            fromIslandData.activeTab = fromIslandData.tabs[0]?.id
          }
          toIslandData.activeTab = activeId
          
          newIslands[fromIdx] = fromIslandData
          newIslands[toIdx] = toIslandData
        }
      }
      
      return newIslands
    })
  }, [islands])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    // Mark drag as completing to keep tab invisible
    setIsDragCompleting(true)

    if (!over) {
      setActiveId(null)
      setIsDragCompleting(false)
      unlockScroll()
      return
    }

    const activeId = active.id
    const overId = over.id

    // Only handle reordering within the same container
    setIslands(prev => {
      const activeIsland = prev.find(island => 
        island.tabs.some(tab => tab.id === activeId)
      )
      const overIsland = prev.find(island => 
        island.tabs.some(tab => tab.id === overId)
      )

      if (!activeIsland || !overIsland || activeIsland.id !== overIsland.id) {
        return prev // Different containers are handled by onDragOver
      }

      // Reordering within the same island
      const oldIndex = activeIsland.tabs.findIndex(tab => tab.id === activeId)
      const newIndex = activeIsland.tabs.findIndex(tab => tab.id === overId)

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        const newIslands = [...prev]
        const islandIndex = newIslands.findIndex(i => i.id === activeIsland.id)
        if (islandIndex !== -1) {
          const newTabs = arrayMove(activeIsland.tabs, oldIndex, newIndex)
          newIslands[islandIndex] = {
            ...newIslands[islandIndex],
            tabs: newTabs
          }
          return newIslands
        }
      }
      
      return prev
    })

    // Use requestAnimationFrame to ensure state update happens before making tab visible
    requestAnimationFrame(() => {
      setActiveId(null)
      setIsDragCompleting(false)
      unlockScroll()
    })
  }, [unlockScroll])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setIsDragCompleting(false)
    unlockScroll()
  }, [unlockScroll])

  // Get the active tab data for drag overlay
  const activeTab = activeId ? islands.flatMap(i => i.tabs).find(tab => tab.id === activeId) : null

  const contextValue: DraggableTabsContextValue = {
    islands,
    activeId,
    isDragCompleting,
    updateIslands,
    setActiveTab,
  }

  // Only render DndContext on client side to prevent hydration mismatch
  if (!isClient) {
    return (
      <DraggableTabsContext.Provider value={contextValue}>
        {children}
      </DraggableTabsContext.Provider>
    )
  }

  return (
    <DraggableTabsContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        autoScroll={false}
      >
        {children}
        <DragOverlay>
          {activeTab ? <DragOverlayTab tab={activeTab} /> : null}
        </DragOverlay>
      </DndContext>
    </DraggableTabsContext.Provider>
  )
}

// Drag Overlay Tab Component (renders near cursor) - separate from sortable component to avoid ID conflicts
const DragOverlayTab: React.FC<{ tab: DraggableTab }> = ({ tab }) => {
  return (
    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 py-1 h-7 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-move select-none bg-[var(--fleet-tab-background)]/90 backdrop-blur-sm border-2 border-blue-500 shadow-lg gap-1">
      {tab.icon && <span className="shrink-0 flex items-center">{tab.icon}</span>}
      <span className="truncate text-[var(--fleet-text-primary)] text-sm font-semibold">
        {tab.title}
      </span>
      {tab.isModified && <span className="w-1.5 h-1.5 bg-[var(--fleet-accent-primary)] rounded-full shrink-0" />}
    </div>
  )
}

// Note: SortableTab has been moved to island.tsx as part of DroppableTabIsland

// Legacy component exports for backward compatibility
// Note: DroppableTabIsland has been moved to island.tsx
// Note: DraggableTab and TabIsland types are now exported from island.tsx
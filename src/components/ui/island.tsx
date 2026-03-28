"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import { ScrollArea } from "./scroll-area"
import { Icon } from "./icon"
import { useState, useEffect } from "react"
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { UniqueIdentifier } from "@dnd-kit/core"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"

// Air Islands Theme Implementation
// Based on Air Kotlin source: SplitPanelView.kt and AirWindowView.kt
// Islands have 8dp rounded corners and gray background with 8dp splitter width

const islandVariants = cva(
  "bg-[var(--fleet-island-background)] text-[var(--fleet-text-primary)] rounded-[var(--fleet-radius-lg)]",
  {
    variants: {
      variant: {
        default: "",
        panel: "",
        conversation: "",
        main: ""
      },
      padding: {
        none: "p-0",
        default: "px-1.5", // 6px Air padding - left and right only
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        default: "shadow-md",
        lg: "shadow-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      shadow: "none"
    }
  }
)

const islandSplitterVariants = cva(
  "bg-border hover:bg-border/80 transition-colors",
  {
    variants: {
      direction: {
        horizontal: "w-2 h-full cursor-col-resize",
        vertical: "h-2 w-full cursor-row-resize"
      }
    },
    defaultVariants: {
      direction: "horizontal"
    }
  }
)

export interface IslandProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof islandVariants> {
  scrollable?: boolean
}

export interface IslandSplitterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof islandSplitterVariants> {}

// Draggable Tab Island Types
export interface DraggableTab {
  id: UniqueIdentifier
  content: React.ReactNode
  title: string
  icon?: React.ReactNode
  isModified?: boolean
  onClose?: () => void
  tabContent?: React.ReactNode
}

export interface TabIsland {
  id: UniqueIdentifier
  tabs: DraggableTab[]
  activeTab?: UniqueIdentifier
}

// Import the draggable tabs hook
import { useDraggableTabs } from "./draggable-tabs"

const Island = React.forwardRef<HTMLDivElement, IslandProps>(
  ({ className, variant, padding, shadow, scrollable, children, ...props }, ref) => {
    const islandClasses = cn(islandVariants({ variant, padding, shadow }), className)
    
    // Auto-detect if the island has a fixed height and make it scrollable
    const hasFixedHeight = className?.includes('h-') || props.style?.height
    const shouldScroll = scrollable || hasFixedHeight
    
    if (shouldScroll) {
      return (
        <div
          className={cn(islandClasses, "overflow-hidden")}
          ref={ref}
          {...props}
        >
          <ScrollArea className="h-full w-full">
            {children}
          </ScrollArea>
        </div>
      )
    }

    return (
      <div
        className={islandClasses}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Island.displayName = "Island"

const IslandSplitter = React.forwardRef<HTMLDivElement, IslandSplitterProps>(
  ({ className, direction, ...props }, ref) => {
    return (
      <div
        className={cn(islandSplitterVariants({ direction }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
IslandSplitter.displayName = "IslandSplitter"

// Island Container - wraps multiple islands with proper spacing
const IslandContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: "horizontal" | "vertical"
  }
>(({ className, direction = "horizontal", children, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex gap-2",
        direction === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
IslandContainer.displayName = "IslandContainer"

// Tab Bar Component - for pinned tabs
const TabBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div 
      className={cn("bg-[var(--fleet-island-background)] p-1.5 flex-shrink-0", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
TabBar.displayName = "TabBar"

// Tab Content Area Component - for scrollable content
const TabContentArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div 
      className={cn("flex-1 min-h-0", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
TabContentArea.displayName = "TabContentArea"

// Island with Tab Group - Air Tab Island pattern
// This is a specialized Island variant that handles tabs properly
// Tabs are automatically pinned at the top, only content is scrollable
const IslandWithTabs = React.forwardRef<
  HTMLDivElement,
  IslandProps & {
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      className={cn(
        "bg-[var(--fleet-island-background)] text-[var(--fleet-text-primary)] rounded-[var(--fleet-radius-lg)] overflow-hidden flex flex-col",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
IslandWithTabs.displayName = "IslandWithTabs"

// Motion-enabled Island with slide in/out transitions
type SlideDirection = "left" | "right" | "up" | "down"

const slideOffsets: Record<SlideDirection, { x?: string; y?: string }> = {
  left: { x: "-32px" },
  right: { x: "32px" },
  up: { y: "-32px" },
  down: { y: "32px" },
}

const MotionIslandWithTabs = React.forwardRef<
  HTMLDivElement,
  IslandProps & {
    children?: React.ReactNode
    layoutId?: string
    slideFrom?: SlideDirection
    visible?: boolean
  }
>(({ className, children, layoutId, slideFrom = "left", visible = true, scrollable: _scrollable, ...props }, ref) => {
  const offset = slideOffsets[slideFrom]

  return (
    <motion.div
      ref={ref}
      className={cn(
        "bg-[var(--fleet-island-background)] text-[var(--fleet-text-primary)] rounded-[var(--fleet-radius-lg)] overflow-hidden flex flex-col",
        className
      )}
      initial={{ opacity: 0, ...offset }}
      animate={visible
        ? { opacity: 1, x: 0, y: 0 }
        : { opacity: 0 }
      }
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      layoutId={layoutId}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  )
})
MotionIslandWithTabs.displayName = "MotionIslandWithTabs"

// Chat Message types
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: React.ReactNode
}

// Chat Island - AI chat interface
// Layout: scrollable messages area on top, input pinned at bottom
// Content width matches input width
import { AiChatInput, type AiChatInputProps } from "./ai-chat-input"
import { AiMessage, UserMessage } from "./message"

export interface ChatIslandProps extends React.HTMLAttributes<HTMLDivElement> {
  messages?: ChatMessage[]
  taskLabel?: string
  taskProgress?: string
  contextPreview?: React.ReactNode
  chatInputProps?: AiChatInputProps
  children?: React.ReactNode
}

const defaultMessages: ChatMessage[] = [
  { id: "1", role: "user", content: "Can you help me add item search to the catalogue page?" },
  { id: "2", role: "assistant", content: "Sure! I'll help you implement item search for the catalogue page. Let me start by looking at the current catalogue component structure." },
]

const ChatIsland = React.forwardRef<HTMLDivElement, ChatIslandProps>(
  ({ className, messages: externalMessages, taskLabel, taskProgress, contextPreview, chatInputProps, children, ...props }, ref) => {
    const [internalMessages, setInternalMessages] = React.useState<ChatMessage[]>(defaultMessages)
    const messages = externalMessages ?? internalMessages
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages.length])

    const handleSend = (message: string) => {
      if (chatInputProps?.onSend) {
        chatInputProps.onSend(message)
      } else {
        setInternalMessages(prev => [
          ...prev,
          { id: `user-${Date.now()}`, role: "user", content: message },
        ])
      }
    }

    return (
      <div
        className={cn(
          "bg-[var(--fleet-island-background)] text-[var(--fleet-text-primary)] rounded-[var(--fleet-radius-lg)] overflow-hidden flex flex-col h-full",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Messages area - scrollable, grows to fill space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col gap-3 p-3 max-w-[600px] mx-auto">
              {messages.map((msg) => (
                msg.role === "user" ? (
                  <UserMessage key={msg.id} content={typeof msg.content === "string" ? msg.content : undefined}>
                    {typeof msg.content !== "string" ? msg.content : undefined}
                  </UserMessage>
                ) : (
                  <AiMessage key={msg.id} content={typeof msg.content === "string" ? msg.content : undefined}>
                    {typeof msg.content !== "string" ? msg.content : undefined}
                  </AiMessage>
                )
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Bottom section - pinned */}
        <div className="flex-shrink-0 flex flex-col max-w-[600px] mx-auto w-full pb-3">
          {/* Task progress bar */}
          {taskLabel && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 text-medium"
              style={{ color: "var(--fleet-text-secondary)" }}
            >
              <Icon fleet="loading" size="sm" className="animate-spin" />
              <span>{taskLabel}</span>
              {taskProgress && (
                <span style={{ color: "var(--fleet-text-tertiary)" }}>{taskProgress}</span>
              )}
            </div>
          )}

          {/* Context preview */}
          {contextPreview && (
            <div className="px-2 pb-1">
              {contextPreview}
            </div>
          )}

          {/* Chat input */}
          <div>
            {children || <AiChatInput {...chatInputProps} onSend={handleSend} />}
          </div>
        </div>
      </div>
    )
  }
)
ChatIsland.displayName = "ChatIsland"

// Sortable Tab Component for Droppable Islands
interface SortableTabProps {
  tab: DraggableTab
  islandId: UniqueIdentifier
  isActive?: boolean
  onTabClick?: (tabId: UniqueIdentifier) => void
}

// Inner component that safely uses the useSortable hook
const SortableTabInner: React.FC<SortableTabProps> = ({
  tab,
  isActive,
  onTabClick,
}) => {
  const { isDragCompleting, activeId } = useDraggableTabs()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  }

  // Keep tab invisible during drag or while drag is completing for this specific tab
  const shouldBeInvisible = isDragging || (isDragCompleting && activeId === tab.id)

  return (
    <TabsTrigger
      ref={setNodeRef}
      style={style}
      value={tab.id as string}
      className={cn(
        "cursor-move select-none",
        shouldBeInvisible && "opacity-0", // Make invisible during drag and completion
        isActive && "data-[state=active]:bg-[var(--fleet-tab-background-selected)]"
      )}
      onClick={() => onTabClick?.(tab.id)}
      icon={tab.icon}
      isModified={tab.isModified}
      closable={!!tab.onClose}
      onClose={tab.onClose}
      {...attributes}
      {...listeners}
    >
      {tab.title}
    </TabsTrigger>
  )
}

// Fallback component for SSR
const StaticTab: React.FC<SortableTabProps> = ({
  tab,
  isActive,
  onTabClick,
}) => {
  return (
    <TabsTrigger
      value={tab.id as string}
      className={cn(
        "cursor-move select-none transition-opacity",
        isActive && "data-[state=active]:bg-[var(--fleet-tab-background-selected)]"
      )}
      onClick={() => onTabClick?.(tab.id)}
      icon={tab.icon}
      isModified={tab.isModified}
      closable={!!tab.onClose}
      onClose={tab.onClose}
    >
      {tab.title}
    </TabsTrigger>
  )
}

const SortableTab: React.FC<SortableTabProps> = (props) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use SortableTabInner only on client side when DndContext is available
  if (isClient) {
    return <SortableTabInner {...props} />
  }

  // Use StaticTab for SSR
  return <StaticTab {...props} />
}

// Tab List Wrapper for Sortable Context
const TabListWrapper: React.FC<{ 
  children: React.ReactNode
  tabIds: UniqueIdentifier[]
  isClient: boolean 
}> = ({ children, tabIds, isClient }) => {
  if (isClient) {
    return (
      <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
        {children}
      </SortableContext>
    )
  }
  return <>{children}</>
}

// Droppable Tab Island Component
export interface DroppableTabIslandProps {
  islandId: UniqueIdentifier
  children?: React.ReactNode
  className?: string
}

const DroppableTabIsland = React.forwardRef<
  HTMLDivElement,
  DroppableTabIslandProps
>(({ islandId, children, className }, ref) => {
  const { islands, setActiveTab } = useDraggableTabs()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Get the current island data from the provider's context
  const island = islands.find(i => i.id === islandId)
  
  if (!island) {
    console.warn(`Island with id "${islandId}" not found`)
    return null
  }

  // Get all tab IDs for the sortable context
  const tabIds = island.tabs.map(tab => tab.id)

  return (
    <div
      ref={ref}
      className={cn(
        "bg-[var(--fleet-island-background)] text-[var(--fleet-text-primary)] rounded-[var(--fleet-radius-lg)] overflow-hidden flex flex-col",
        className
      )}
    >
      <Tabs 
        value={island.activeTab as string} 
        onValueChange={(value) => setActiveTab(island.id, value)}
        className="w-full h-full flex flex-col"
      >
        {/* Tab Bar */}
        <div className="bg-[var(--fleet-island-background)] px-1.5 py-1 flex-shrink-0">
          <TabListWrapper tabIds={tabIds} isClient={isClient}>
            <TabsList className="h-auto bg-transparent gap-1 p-0">
              {island.tabs.map((tab) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  islandId={island.id}
                  isActive={island.activeTab === tab.id}
                  onTabClick={(tabId) => setActiveTab(island.id, tabId)}
                />
              ))}
            </TabsList>
          </TabListWrapper>
        </div>
        
        {/* Content */}
        <div className="p-1.5 flex-1 bg-[var(--fleet-island-background)]">
          {island.tabs.map((tab) => (
            <TabsContent 
              key={tab.id as string} 
              value={tab.id as string} 
              className="mt-0 h-full"
            >
              {tab.tabContent || tab.content}
            </TabsContent>
          ))}
          {children}
        </div>
      </Tabs>
    </div>
  )
})
DroppableTabIsland.displayName = "DroppableTabIsland"

export {
  Island,
  IslandSplitter,
  IslandContainer,
  IslandWithTabs,
  MotionIslandWithTabs,
  AnimatePresence,
  TabBar,
  TabContentArea,
  ChatIsland,
  DroppableTabIsland,
  islandVariants,
  islandSplitterVariants,
}

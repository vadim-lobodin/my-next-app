"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { MainToolbar } from "./main-toolbar"
import { IslandWithTabs, MotionIslandWithTabs, ChatIsland } from "./island"
import { AiChatContextPreview } from "./ai-chat-context-preview"
import { ToolSidebar } from "./tool-sidebar"
import { TaskList } from "./task-list"
import { ChangesIsland } from "./changes-island"
import { FileTreeIsland } from "./file-tree-island"
import { Panel as ResizablePanel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels"

// Window Layout Variants
const windowLayoutVariants = cva(
  "flex flex-col h-full w-full bg-[var(--fleet-background-primary)] text-foreground",
  {
    variants: {
      variant: {
        default: "",
        air: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const windowHeaderVariants = cva(
  "flex-none h-10 flex items-center justify-between bg-background border-b border-border",
  {
    variants: {
      platform: {
        default: "px-2",
        mac: "pl-20 pr-2", // Space for traffic lights
        windows: "pl-2 pr-32", // Space for window controls
        linux: "px-2", // Same as default
      },
    },
    defaultVariants: {
      platform: "default",
    },
  }
)

const toolbarVariants = cva(
  "flex items-center justify-between h-full w-full",
  {
    variants: {
      variant: {
        main: "gap-2",
        compact: "gap-1",
      },
    },
    defaultVariants: {
      variant: "main",
    },
  }
)

const panelContainerVariants = cva(
  "flex-1 flex overflow-hidden",
  {
    variants: {
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

const panelVariants = cva(
  "flex flex-col bg-card overflow-hidden transition-all duration-200",
  {
    variants: {
      position: {
        left: "min-w-0 rounded-lg",
        right: "min-w-0 rounded-lg", 
        bottom: "min-h-0 rounded-lg",
        main: "min-w-0 min-h-0 rounded-lg",
      },
      size: {
        xs: "w-48",
        sm: "w-56",
        md: "w-64",
        lg: "w-80",
        xl: "w-96",
        auto: "flex-1",
        collapsed: "w-0 opacity-0 pointer-events-none overflow-hidden",
      },
      height: {
        xs: "h-32",
        sm: "h-40",
        md: "h-48", 
        lg: "h-64",
        xl: "h-80",
        auto: "flex-1",
        collapsed: "h-0 opacity-0 pointer-events-none overflow-hidden",
      },
    },
    defaultVariants: {
      position: "main",
      size: "auto",
      height: "auto",
    },
  }
)

const splitterVariants = cva(
  "flex-none bg-transparent transition-colors cursor-resize",
  {
    variants: {
      orientation: {
        horizontal: "w-2 cursor-col-resize hover:bg-border/80",
        vertical: "h-2 cursor-row-resize hover:bg-border/80",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

// Types
export interface WindowLayoutProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof windowLayoutVariants> {
  children?: React.ReactNode
}

export interface WindowHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof windowHeaderVariants> {
  leftContent?: React.ReactNode
  centerContent?: React.ReactNode
  rightContent?: React.ReactNode
  useMainToolbar?: boolean
  toolbarProps?: React.ComponentProps<typeof MainToolbar>
}

export interface ToolbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toolbarVariants> {
  leftActions?: React.ReactNode
  workspace?: React.ReactNode
  progress?: React.ReactNode
  rightActions?: React.ReactNode
}

export interface PanelContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelContainerVariants> {
  children?: React.ReactNode
}

export interface PanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelVariants> {
  isVisible?: boolean
  children?: React.ReactNode
}

export interface SplitterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof splitterVariants> {
  onResize?: (size: number) => void
}

// Inner shell wrapper
const WindowLayoutShell = React.forwardRef<HTMLDivElement, WindowLayoutProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        className={cn(windowLayoutVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
WindowLayoutShell.displayName = "WindowLayoutShell"

// Window Header Component
const WindowHeader = React.forwardRef<HTMLDivElement, WindowHeaderProps>(
  ({ className, platform, leftContent, centerContent, rightContent, useMainToolbar, toolbarProps, children, ...props }, ref) => {
    if (useMainToolbar) {
      return (
        <div className="flex-none" ref={ref}>
          <MainToolbar {...toolbarProps} />
        </div>
      )
    }

    return (
      <div
        className={cn(windowHeaderVariants({ platform }), className)}
        ref={ref}
        {...props}
      >
        {children || (
          <>
            <div className="flex items-center gap-2">
              {leftContent}
            </div>
            <div className="flex-1 flex items-center justify-center">
              {centerContent}
            </div>
            <div className="flex items-center gap-2">
              {rightContent}
            </div>
          </>
        )}
      </div>
    )
  }
)
WindowHeader.displayName = "WindowHeader"

// Toolbar Component
const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, variant, leftActions, workspace, progress, rightActions, children, ...props }, ref) => {
    return (
      <div
        className={cn(toolbarVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        {children || (
          <>
            <div className="flex items-center gap-1">
              {leftActions}
            </div>
            <div className="flex-1 flex items-center justify-center gap-2">
              {workspace}
              {progress}
            </div>
            <div className="flex items-center gap-1">
              {rightActions}
            </div>
          </>
        )}
      </div>
    )
  }
)
Toolbar.displayName = "Toolbar"

// Panel Container Component
const PanelContainer = React.forwardRef<HTMLDivElement, PanelContainerProps>(
  ({ className, orientation, children, ...props }, ref) => {
    return (
      <div
        className={cn(panelContainerVariants({ orientation }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PanelContainer.displayName = "PanelContainer"

// Panel Component
const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, position, size, height, isVisible = true, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          panelVariants({ 
            position, 
            size: isVisible ? size : "collapsed",
            height: isVisible ? height : "collapsed"
          }), 
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Panel.displayName = "Panel"

// Splitter Component
const Splitter = React.forwardRef<HTMLDivElement, SplitterProps>(
  ({ className, orientation, onResize, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (onResize) {
          const size = orientation === "horizontal" 
            ? moveEvent.clientX 
            : moveEvent.clientY
          onResize(size)
        }
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }, [onResize, orientation])

    return (
      <div
        className={cn(
          splitterVariants({ orientation }),
          isDragging && "bg-border",
          className
        )}
        onMouseDown={handleMouseDown}
        ref={ref}
        {...props}
      />
    )
  }
)
Splitter.displayName = "Splitter"

// Air Window Layout - uses MainToolbar and Islands
// Layout: [Main Content + Bottom] [Side Panel] [Files Panel] [ToolSidebar]
// Main content is always visible, panels are toggleable
const WindowLayout = React.forwardRef<
  HTMLDivElement,
  {
    toolbarProps?: React.ComponentProps<typeof MainToolbar>
    leftPanel?: React.ReactNode
    filesPanel?: React.ReactNode
    sidePanel?: React.ReactNode
    bottomPanel?: React.ReactNode
    mainContent?: React.ReactNode
    leftPanelVisible?: boolean
    filesPanelVisible?: boolean
    sidePanelVisible?: boolean
    bottomPanelVisible?: boolean
    onLeftPanelToggle?: () => void
    platform?: "default" | "mac" | "windows" | "linux"
    className?: string
    children?: React.ReactNode
  }
>(({
  toolbarProps: externalToolbarProps,
  leftPanel: externalLeftPanel,
  filesPanel: externalFilesPanel,
  sidePanel: externalSidePanel,
  bottomPanel: externalBottomPanel,
  mainContent: externalMainContent,
  leftPanelVisible: externalLeftPanelVisible,
  filesPanelVisible: externalFilesPanelVisible,
  sidePanelVisible = false,
  bottomPanelVisible = false,
  onLeftPanelToggle: externalOnLeftPanelToggle,
  platform = "default",
  className,
  children,
}, ref) => {
  // Self-managing left panel visibility
  const [internalLeftPanelVisible, setInternalLeftPanelVisible] = React.useState(true)
  const leftPanelVisible = externalLeftPanelVisible !== undefined ? externalLeftPanelVisible : internalLeftPanelVisible
  const handleLeftPanelToggle = () => {
    if (externalOnLeftPanelToggle) {
      externalOnLeftPanelToggle()
    } else {
      setInternalLeftPanelVisible(prev => !prev)
    }
  }

  // Self-managing tool sidebar — controls which right panel is shown
  const [activeTool, setActiveTool] = React.useState<string | null>("files")
  const rightPanelVisible = externalFilesPanelVisible !== undefined ? externalFilesPanelVisible : activeTool !== null
  const filesPanelVisible = externalFilesPanelVisible !== undefined ? externalFilesPanelVisible : activeTool === "files"

  // Map tool IDs to right panel content
  const toolPanelContent: Record<string, React.ReactNode> = React.useMemo(() => ({
    files: <FileTreeIsland className="h-full" />,
    review: <ChangesIsland />,
  }), [])

  const rightPanelContent = activeTool ? toolPanelContent[activeTool] ?? null : null

  const handleToolSidebarClick = (id: string) => {
    setActiveTool(prev => prev === id ? null : id)
  }

  const defaultToolbarProps = React.useMemo(() => ({
    type: "task" as const
  }), [])

  const defaultFilesPanel = React.useMemo(() => (
    <div className="flex flex-col h-full p-4">
      <div style={{ color: "var(--fleet-text-primary)" }} className="font-medium mb-4">Project</div>
      <div className="space-y-2 text-sm" style={{ color: "var(--fleet-text-primary)" }}>
        <div>src/</div>
        <div className="ml-4">App.tsx</div>
        <div className="ml-4">index.ts</div>
        <div>public/</div>
        <div>package.json</div>
      </div>
    </div>
  ), [])

  const defaultMainContent = React.useMemo(() => (
    <ChatIsland className="h-full" />
  ), [])

  const defaultBottomPanel = React.useMemo(() => (
    <div className="flex flex-col h-full p-4">
      <div style={{ color: "var(--fleet-text-primary)" }} className="font-medium mb-4">Terminal</div>
      <div className="font-mono text-sm" style={{ color: "var(--fleet-text-secondary)" }}>
        <div>$ npm run dev</div>
        <div style={{ color: "var(--fleet-text-positive)" }}>Ready on http://localhost:3000</div>
      </div>
    </div>
  ), [])

  const defaultSidePanel = React.useMemo(() => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--fleet-border-default)]">
        <div style={{ color: "var(--fleet-text-primary)" }} className="font-medium">Fleet AI</div>
      </div>
      <div className="flex-1 p-4">
        <AiChatContextPreview className="w-full" />
      </div>
    </div>
  ), [])

  const defaultLeftPanel = React.useMemo(() => (
    <TaskList className="h-full" />
  ), [])

  const toolbarProps = externalToolbarProps ?? defaultToolbarProps
  const leftPanel = externalLeftPanel ?? defaultLeftPanel
  const filesPanel = externalFilesPanel ?? defaultFilesPanel
  const sidePanel = externalSidePanel ?? defaultSidePanel
  const bottomPanel = externalBottomPanel ?? defaultBottomPanel
  const mainContent = externalMainContent ?? defaultMainContent

  const leftPanelRef = React.useRef<ImperativePanelHandle>(null)
  const filesPanelRef = React.useRef<ImperativePanelHandle>(null)
  const sidePanelRef = React.useRef<ImperativePanelHandle>(null)
  const bottomPanelRef = React.useRef<ImperativePanelHandle>(null)

  // Imperatively collapse/expand panels when visibility changes
  // Delay collapse to let the exit animation (200ms) finish first
  const ANIMATION_MS = 270

  const usePanelSync = (panelRef: React.RefObject<ImperativePanelHandle | null>, visible: boolean) => {
    React.useEffect(() => {
      const panel = panelRef.current
      if (!panel) return
      if (visible) {
        panel.expand()
      } else {
        const timer = setTimeout(() => panel.collapse(), ANIMATION_MS)
        return () => clearTimeout(timer)
      }
    }, [panelRef, visible])
  }

  usePanelSync(leftPanelRef, leftPanelVisible)
  usePanelSync(bottomPanelRef, bottomPanelVisible)
  usePanelSync(sidePanelRef, sidePanelVisible)
  usePanelSync(filesPanelRef, rightPanelVisible)

  const handleRightPanelToggle = () => {
    setActiveTool(prev => prev ? null : "files")
  }

  const mergedToolbarProps = {
    ...toolbarProps,
    onLeftPanelToggle: handleLeftPanelToggle,
    leftPanelActive: leftPanelVisible,
    onRightPanelToggle: handleRightPanelToggle,
    rightPanelActive: rightPanelVisible,
  }

  if (children) {
    return (
      <WindowLayoutShell className={className} ref={ref}>
        <WindowHeader
          useMainToolbar
          platform={platform}
          toolbarProps={mergedToolbarProps}
        />
        <div className="flex-1 flex px-2 pb-2 gap-2">
          <div className="flex-1 min-w-0">{children}</div>
          <ToolSidebar className="flex-none h-full" activeItem={activeTool} onItemClick={handleToolSidebarClick} />
        </div>
      </WindowLayoutShell>
    )
  }

  return (
    <WindowLayoutShell className={className} ref={ref}>
      <WindowHeader
        useMainToolbar
        platform={platform}
        toolbarProps={mergedToolbarProps}
      />

      {/* Main Layout: [Panels] [ToolSidebar] */}
      <div className="flex-1 flex px-2 pb-2 gap-2">
        <div className="flex-1 min-w-0">
          <PanelGroup
            autoSaveId="window-layout-main"
            direction="horizontal"
            className="h-full"
          >
            {/* Left Panel (Task List) */}
            <ResizablePanel
              ref={leftPanelRef}
              defaultSize={leftPanelVisible ? 25 : 0}
              minSize={leftPanelVisible ? 15 : 0}
              maxSize={leftPanelVisible ? 35 : 0}
              collapsible
              collapsedSize={0}
              className="h-full overflow-visible"
              onCollapse={() => { if (leftPanelVisible) handleLeftPanelToggle() }}
            >
              <MotionIslandWithTabs visible={leftPanelVisible} slideFrom="left" className="h-full w-full">
                {leftPanel}
              </MotionIslandWithTabs>
            </ResizablePanel>
            <PanelResizeHandle className={leftPanelVisible ? "w-2" : "w-0"} />

            {/* Central Container: Main Content + Bottom Panel */}
            <ResizablePanel className="h-full flex-1" minSize={30}>
              <PanelGroup autoSaveId="window-layout-vertical" direction="vertical" className="h-full">
                <ResizablePanel
                  defaultSize={bottomPanelVisible ? 70 : 100}
                  className="h-full"
                >
                  <IslandWithTabs className="h-full w-full">
                    {mainContent}
                  </IslandWithTabs>
                </ResizablePanel>

                <PanelResizeHandle className={bottomPanelVisible ? "h-2" : "h-0"} />
                <ResizablePanel
                  ref={bottomPanelRef}
                  defaultSize={bottomPanelVisible ? 30 : 0}
                  minSize={bottomPanelVisible ? 10 : 0}
                  maxSize={bottomPanelVisible ? 50 : 0}
                  collapsible
                  collapsedSize={0}
                  className="h-full overflow-visible"
                >
                  <MotionIslandWithTabs visible={bottomPanelVisible} slideFrom="down" className="h-full w-full">
                    {bottomPanel}
                  </MotionIslandWithTabs>
                </ResizablePanel>
              </PanelGroup>
            </ResizablePanel>

            {/* Side Panel (e.g. AI chat, tools) */}
            <PanelResizeHandle className={sidePanelVisible ? "w-2" : "w-0"} />
            <ResizablePanel
              ref={sidePanelRef}
              defaultSize={sidePanelVisible ? 25 : 0}
              minSize={sidePanelVisible ? 15 : 0}
              maxSize={sidePanelVisible ? 40 : 0}
              collapsible
              collapsedSize={0}
              className="h-full overflow-visible"
            >
              <MotionIslandWithTabs visible={sidePanelVisible} slideFrom="right" className="h-full w-full">
                {sidePanel}
              </MotionIslandWithTabs>
            </ResizablePanel>

            {/* Right Panel — content driven by active tool sidebar item */}
            <PanelResizeHandle className={rightPanelVisible && rightPanelContent ? "w-2" : "w-0"} />
            <ResizablePanel
              ref={filesPanelRef}
              defaultSize={rightPanelVisible ? 25 : 0}
              minSize={rightPanelVisible ? 15 : 0}
              maxSize={rightPanelVisible ? 40 : 0}
              collapsible
              collapsedSize={0}
              className="h-full overflow-visible"
            >
              <MotionIslandWithTabs visible={rightPanelVisible && !!rightPanelContent} key={activeTool} slideFrom="right" className="h-full w-full">
                {rightPanelContent}
              </MotionIslandWithTabs>
            </ResizablePanel>
          </PanelGroup>
        </div>

        <ToolSidebar className="flex-none h-full" activeItem={activeTool} onItemClick={handleToolSidebarClick} />
      </div>
    </WindowLayoutShell>
  )
})
WindowLayout.displayName = "WindowLayout"

// Pre-built Layout Compositions (Legacy - kept for compatibility)
const StandardWindowLayout = React.forwardRef<
  HTMLDivElement,
  {
    header?: React.ReactNode
    leftPanel?: React.ReactNode
    rightPanel?: React.ReactNode
    bottomPanel?: React.ReactNode
    mainContent?: React.ReactNode
    leftPanelVisible?: boolean
    rightPanelVisible?: boolean
    bottomPanelVisible?: boolean
    leftPanelSize?: VariantProps<typeof panelVariants>["size"]
    rightPanelSize?: VariantProps<typeof panelVariants>["size"]
    bottomPanelHeight?: VariantProps<typeof panelVariants>["height"]
    className?: string
  }
>(({
  header,
  leftPanel,
  rightPanel,
  bottomPanel,
  mainContent,
  leftPanelVisible = true,
  rightPanelVisible = true,
  bottomPanelVisible = true,
  leftPanelSize = "md",
  rightPanelSize = "md",
  bottomPanelHeight = "md",
  className,
}, ref) => {
  return (
    <WindowLayoutShell className={className} ref={ref}>
      {header}
      <PanelContainer orientation="horizontal" className="gap-2 p-2">
        <Panel
          position="left"
          size={leftPanelSize}
          isVisible={leftPanelVisible}
        >
          {leftPanel}
        </Panel>

        {leftPanelVisible && <Splitter orientation="horizontal" />}

        <PanelContainer orientation="vertical" className="gap-2">
          <Panel position="main">
            {mainContent}
          </Panel>

          {bottomPanelVisible && <Splitter orientation="vertical" />}

          <Panel
            position="bottom"
            height={bottomPanelHeight}
            isVisible={bottomPanelVisible}
          >
            {bottomPanel}
          </Panel>
        </PanelContainer>

        {rightPanelVisible && <Splitter orientation="horizontal" />}

        <Panel
          position="right"
          size={rightPanelSize}
          isVisible={rightPanelVisible}
        >
          {rightPanel}
        </Panel>
      </PanelContainer>
    </WindowLayoutShell>
  )
})
StandardWindowLayout.displayName = "StandardWindowLayout"

// Air Air Window Layout - optimized for conversation interfaces
const FleetAirWindowLayout = React.forwardRef<
  HTMLDivElement,
  {
    toolbarProps?: React.ComponentProps<typeof MainToolbar>
    conversationHistory?: React.ReactNode
    activeConversation?: React.ReactNode
    mainPanel?: React.ReactNode
    mainPanelVisible?: boolean
    platform?: "default" | "mac" | "windows" | "linux"
    className?: string
  }
>(({
  toolbarProps,
  conversationHistory,
  activeConversation,
  mainPanel,
  mainPanelVisible = true,
  platform = "default",
  className,
}, ref) => {
  return (
    <WindowLayoutShell variant="air" className={className} ref={ref}>
      {/* Air MainToolbar */}
      <WindowHeader 
        useMainToolbar 
        platform={platform}
        toolbarProps={toolbarProps}
      />
      
      {/* Air Layout with Conversation Islands */}
      <div className="flex-1 flex px-2 pb-2 gap-2">
        {/* Conversation History */}
        <IslandWithTabs className="w-56 flex-none h-full">
          {conversationHistory}
        </IslandWithTabs>

        {/* Active Conversation */}
        <IslandWithTabs className="flex-1 min-w-0 h-full">
          {activeConversation}
        </IslandWithTabs>

        {/* Main Panel (optional) */}
        {mainPanelVisible && (
          <IslandWithTabs className="w-96 flex-none h-full">
            {mainPanel}
          </IslandWithTabs>
        )}
      </div>
    </WindowLayoutShell>
  )
})
FleetAirWindowLayout.displayName = "FleetAirWindowLayout"

// Legacy Air Layout (kept for compatibility)
const AirWindowLayout = React.forwardRef<
  HTMLDivElement,
  {
    header?: React.ReactNode
    conversationHistory?: React.ReactNode
    activeConversation?: React.ReactNode
    mainPanel?: React.ReactNode
    mainPanelVisible?: boolean
    className?: string
  }
>(({
  header,
  conversationHistory,
  activeConversation,
  mainPanel,
  mainPanelVisible = true,
  className,
}, ref) => {
  return (
    <WindowLayoutShell variant="air" className={className} ref={ref}>
      {header}
      <PanelContainer orientation="horizontal" className="gap-2 p-2">
        <Panel position="left" size="sm">
          {conversationHistory}
        </Panel>

        <Splitter orientation="horizontal" />

        <Panel position="main" size="lg">
          {activeConversation}
        </Panel>

        {mainPanelVisible && <Splitter orientation="horizontal" />}

        <Panel
          position="right"
          size="xl"
          isVisible={mainPanelVisible}
        >
          {mainPanel}
        </Panel>
      </PanelContainer>
    </WindowLayoutShell>
  )
})
AirWindowLayout.displayName = "AirWindowLayout"

// Export all components
export {
  WindowLayout,
  WindowHeader,
  Toolbar,
  PanelContainer,
  Panel,
  Splitter,
  FleetAirWindowLayout,
  StandardWindowLayout,
  AirWindowLayout,
  // Export variants for customization
  windowLayoutVariants,
  windowHeaderVariants,
  toolbarVariants,
  panelContainerVariants,
  panelVariants,
  splitterVariants,
}
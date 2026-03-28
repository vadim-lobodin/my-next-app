"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { MainToolbar } from "./main-toolbar"
import { IslandWithTabs, MotionIslandWithTabs, ChatIsland, type ChatIslandProps } from "./island"
import { AiChatInput } from "./ai-chat-input"
import { ControlPanel, type ControlPanelProps } from "./control-panel"
import { ToolSidebar } from "./tool-sidebar"
import { TaskList } from "./task-list"
import { ChangesIsland } from "./changes-island"
import { FileTreeIsland } from "./file-tree-island"
import { WindowHeader } from "./window-layout"
import { Panel as ResizablePanel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels"

// WindowLayoutShell (local copy to avoid circular deps)
const WindowLayoutShell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      className={cn("flex flex-col h-full w-full bg-[var(--fleet-background-primary)] text-foreground", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
)
WindowLayoutShell.displayName = "WindowLayoutShell"

export interface WindowLayoutCPProps {
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
  controlPanelProps?: ControlPanelProps
  chatIslandProps?: ChatIslandProps
}

const WindowLayoutCP = React.forwardRef<HTMLDivElement, WindowLayoutCPProps>(({
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
  controlPanelProps,
  chatIslandProps,
}, ref) => {
  const [internalLeftPanelVisible, setInternalLeftPanelVisible] = React.useState(true)
  const leftPanelVisible = externalLeftPanelVisible !== undefined ? externalLeftPanelVisible : internalLeftPanelVisible
  const handleLeftPanelToggle = () => {
    if (externalOnLeftPanelToggle) {
      externalOnLeftPanelToggle()
    } else {
      setInternalLeftPanelVisible(prev => !prev)
    }
  }

  const [activeTool, setActiveTool] = React.useState<string | null>("files")
  const rightPanelVisible = externalFilesPanelVisible !== undefined ? externalFilesPanelVisible : activeTool !== null

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

  // ChatIsland with ControlPanel above the input
  const defaultMainContent = React.useMemo(() => (
    <ChatIsland className="h-full" {...chatIslandProps}>
      <div className="flex flex-col gap-1">
        <ControlPanel {...controlPanelProps} />
        <AiChatInput {...chatIslandProps?.chatInputProps} />
      </div>
    </ChatIsland>
  ), [chatIslandProps, controlPanelProps])

  const defaultLeftPanel = React.useMemo(() => (
    <TaskList className="h-full" />
  ), [])

  const toolbarProps = externalToolbarProps ?? defaultToolbarProps
  const leftPanel = externalLeftPanel ?? defaultLeftPanel
  const mainContent = externalMainContent ?? defaultMainContent

  const leftPanelRef = React.useRef<ImperativePanelHandle>(null)
  const filesPanelRef = React.useRef<ImperativePanelHandle>(null)
  const sidePanelRef = React.useRef<ImperativePanelHandle>(null)
  const bottomPanelRef = React.useRef<ImperativePanelHandle>(null)

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

      <div className="flex-1 flex px-2 pb-2 gap-2">
        <div className="flex-1 min-w-0">
          <PanelGroup
            autoSaveId="window-layout-cp-main"
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
              <PanelGroup autoSaveId="window-layout-cp-vertical" direction="vertical" className="h-full">
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
                    {externalBottomPanel}
                  </MotionIslandWithTabs>
                </ResizablePanel>
              </PanelGroup>
            </ResizablePanel>

            {/* Side Panel */}
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
                {externalSidePanel}
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
WindowLayoutCP.displayName = "WindowLayoutCP"

export { WindowLayoutCP }

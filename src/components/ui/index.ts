// Export all Air components
export { ScrollArea, ScrollBar } from "./scroll-area"
export { Button, buttonVariants } from "./button-shadcn"
export { Typography, typographyVariants } from "./typography"
export * from "./icon"

// Air TextInput - single-line input component with all Air variants controlled by props
export { 
  TextInput,
  textInputVariants,
  type TextInputProps 
} from "./input"

// Alias for compatibility - TextInput is the main component
export { TextInput as Input } from "./input"

// Air Textarea - multiline text input with Air design system integration
export { 
  Textarea,
  ShadcnTextarea,
  textareaVariants,
  type TextareaProps 
} from "./textarea"

// Air List - List component with Air styling, keyboard navigation, and selection
export {
  List,
  ListItem,
  ListItemContainer,
  DefaultListItem,
  FleetListCell,
  listVariants,
  listItemVariants,
  type ListProps,
  type ListItemContainerProps,
  type ListItemProps,
  type ListItemOpts,
  type ListState,
  type ListOptions,
  type DefaultListItemProps,
  type ItemProps,
  type FleetListCellProps,
  type Matcher
} from "./list"

export { Checkbox } from "./checkbox" 

// Air Tabs - Tab component with Air styling, keyboard navigation, and all Air states
export { 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DefaultTabs,
  VerticalTabs,
  FileTab,
  CounterTab,
  IconTab,
  fleetTabsVariants,
  fleetTabsListVariants,
  fleetTabsTriggerVariants,
  fleetTabsContentVariants,
  type FleetTabsProps,
  type FleetTabsListProps,
  type FleetTabsTriggerProps,
  type FileTabProps,
  type CounterTabProps,
  type IconTabProps,
} from "./tabs"

// Air Menu - Menu component with Air styling, search, and submenu support
export {
  Menu,
  ContextMenu,
  RightClickContextMenu,
  buildMenu,
  useContextMenu,
  menuContentVariants,
  menuItemVariants,
  menuHeaderVariants,
  menuSeparatorVariants,
  contextMenuContentVariants,
  contextMenuItemVariants,
  contextMenuHeaderVariants,
  contextMenuSeparatorVariants,
  type MenuProps,
  type ContextMenuProps,
  type FleetMenuItem,
  type ActionMenuItem,
  type CheckboxMenuItem,
  type GroupMenuItem,
  type HeaderMenuItem,
  type SeparatorMenuItem,
  type TextMenuItem,
  type MenuSearchOptions,
} from "./context-menu"

// Air Window Layout - Complete window layout system with panels, splitters, and toolbars
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
  windowLayoutVariants,
  windowHeaderVariants,
  toolbarVariants,
  panelContainerVariants,
  panelVariants,
  splitterVariants,
  type WindowLayoutProps,
  type WindowHeaderProps,
  type ToolbarProps,
  type PanelContainerProps,
  type PanelProps,
  type SplitterProps,
} from "./window-layout"

// Air Window Layout with Control Panel - WindowLayout variant with ControlPanel above chat input
export {
  WindowLayoutCP,
  type WindowLayoutCPProps,
} from "./window-layout-cp"

// Air File Tree - File tree component using Air design patterns
export {
  FileTree,
  defaultProjectTree,
  type FileTreeItem,
  type FileTreeProps,
} from "./file-tree"

// Air File Tree Island - File tree island panel variant with tabs
export {
  FileTreeIsland,
  type FileTreeIslandProps,
} from "./file-tree-island"

// Air Main Toolbar - Precise implementation of Air's main toolbar with intelligent layout
export {
  MainToolbar,
  ToolbarButton,
  ToolbarSeparator,
  WorkspaceWidget,
  ProgressWidget,
  LeftToolbarSection,
  RightToolbarSection,
  mainToolbarVariants,
  separatorVariants,
  type MainToolbarProps,
  type ToolbarButtonProps,
  type ToolbarSeparatorProps,
  type WorkspaceWidgetProps,
  type ProgressWidgetProps,
} from "./main-toolbar"

// Islands Theme Components
export {
  Island,
  IslandSplitter,
  IslandContainer,
  IslandWithTabs,
  MotionIslandWithTabs,
  TabBar,
  TabContentArea,
  ChatIsland,
  DroppableTabIsland,
  islandVariants,
  islandSplitterVariants,
  type IslandProps,
  type IslandSplitterProps,
  type DraggableTab,
  type TabIsland,
  type DroppableTabIslandProps,
} from "./island"


// Air Draggable Tabs - Draggable tabs system for cross-island tab management
export {
  DraggableTabsProvider,
  useDraggableTabs,
} from "./draggable-tabs"

// Air AI Chat Input - Air-style AI chat input component with attachments and features
export {
  AiChatInput,
  type AiChatInputProps,
} from "./ai-chat-input"

// Air AI Chat Context Preview - Context preview component for AI chat interfaces
export {
  AiChatContextPreview,
  type AiChatContextPreviewProps,
  type AiContextEntry,
  type AiTool,
  type AiChatContext,
} from "./ai-chat-context-preview"

// Air Task List Item - Task item component for task lists
export {
  TaskListItem,
  type TaskListItemProps,
  type TaskStatus,
} from "./task-list-item"

// Air Task List - Task list panel with search, groups, and task items
export {
  TaskList,
  type TaskListProps,
  type TaskItem,
  type TaskGroup,
} from "./task-list"

// Air Tool Sidebar - Vertical tool sidebar with icon buttons
export {
  ToolSidebar,
  ToolSidebarButton,
  ToolSidebarSeparator,
  toolSidebarVariants,
  toolSidebarButtonVariants,
  defaultTopItems,
  defaultBottomItems,
  type ToolSidebarItem,
  type ToolSidebarProps,
} from "./tool-sidebar"

// Air Message - Chat message components (AI, User, System, Progress)
export {
  Message,
  AiMessage,
  UserMessage,
  SystemMessage,
  ProgressMessage,
  type MessageType,
  type MessageProps,
  type AiMessageProps,
  type UserMessageProps,
  type SystemMessageProps,
  type ProgressMessageProps,
} from "./message"

// Air Changes Island - VCS changes panel with file diff summary
export {
  ChangesIsland,
  type ChangesIslandProps,
  type ChangedFile,
} from "./changes-island"

// Air Dialog - Modal dialog built on Radix Dialog primitive
export {
  Dialog,
  FleetDialog,
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  type DialogProps,
  type DialogButton,
} from "./dialog"

// Air Select - Dropdown select built on Radix Select primitive
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  FleetSelect,
  AirSelect,
  type FleetSelectProps,
  type AirSelectProps,
  type SelectOption,
} from "./select"

// Air Segmented Control - Toggle between options, built on Radix RadioGroup
export {
  SegmentedControl,
  segmentedControlItemVariants,
  type SegmentedControlRootProps,
  type SegmentedControlItemProps,
} from "./segmented-control"

// Air Avatar - User avatar with generated or image-based avatars
export {
  Avatar,
  type AvatarProps,
} from "./avatar"

// Air Navigation - Sidebar navigation with hover-to-expand, nav items, and compound layout
export {
  Navigation,
  NavigationItem,
  useNavigationExpanded,
  useNavigationLock,
  type NavigationProps,
  type NavigationItemProps,
} from "./navigation"

// Air Web App Layout - Flexbox compound layout with navigation, islands, and two-column patterns
export {
  WebAppLayout,
  AppLayout,
  type WebAppLayoutProps,
  type WebAppLayoutIslandProps,
  type WebAppLayoutSecondLevelNavProps,
  type WebAppLayoutSidebarProps,
} from "./app-layout"

// Air Share Dialog - Sharing dialog with users, access levels, and publish action
export {
  ShareDialog,
  type ShareDialogProps,
  type ShareUser,
  type SuggestedUser,
  type ShareRole,
  type AccessLevel,
  type PublishState,
  type SharingMode,
} from "./share-dialog"

// Air Skeleton - Shimmer loading placeholder
export {
  Skeleton,
  skeletonVariants,
  type SkeletonProps,
  type SkeletonSize,
} from "./skeleton"

// Air TaskListGrouped - Grouped task list with search, status icons, and metadata
export {
  TaskListGrouped,
  TaskListGroup,
  TaskListGroupedItem,
  type TaskListGroupedProps,
  type TaskListGroupProps,
  type TaskListGroupedItemProps,
  type TaskItemData,
  type TaskGroupData,
  type TaskStatus as TaskGroupedStatus,
} from "./task-list-grouped"

// Air Banner - Notification banner with type variants and actions
export {
  Banner,
  bannerVariants,
  type BannerProps,
  type BannerType,
  type BannerButton,
  type BannerLink,
} from "./banner"

// Air Workflow Step - Workflow step card with done/in-progress/todo states
export {
  WorkflowStep,
  type WorkflowStepProps,
  type WorkflowStepStatus,
} from "./workflow-step"
   
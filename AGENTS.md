# AI Agent Guide — Air Web Components

This file tells AI coding agents (Claude, Cursor, Copilot, etc.) how to prototype with this library. If you are an AI agent helping a user build a prototype, follow these instructions.

## Installation

Components are installed directly into your `src/` directory (like shadcn):

```bash
npx github:JetBrains/air-web-components
```

This copies all components, styles, icons, and utilities into your project. The files are yours — import from `@/` paths.

### Setup (required once)

**Next.js** (App Router):

```tsx
// src/app/providers.tsx
"use client"
import { ThemeProvider } from "@/components/theme-provider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
}
```

```tsx
// src/app/layout.tsx
import "@/styles/globals.css"
import Providers from "./providers"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Vite / CRA / Remix**:

```tsx
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

<ThemeProvider defaultTheme="dark">
  <App />
</ThemeProvider>
```

Components require Tailwind CSS 4 (included by default in new Next.js projects).

## Critical Rules

### 1. Use existing components and styles FIRST

**This is the most important rule.** Before writing any custom HTML/CSS:

- **Check if a component already exists** in the library (see Component Reference below). Use it.
- **Check if a CSS variable exists** for the color, shadow, or radius you need. Read `src/lib/css-variables.txt` if unsure.
- **Check if an icon exists** in the Air icon set. Read `src/lib/icon-names.txt` if unsure.
- **Never hardcode colors** (`#hex`, `rgba(...)`, `oklch(...)`). Always use `var(--fleet-*)`.
- **Never hardcode font sizes or weights.** Use the `Typography` component.
- **Never hardcode border-radius.** Use `var(--fleet-radius-xs|sm|md|lg)`.
- **Never hardcode shadows.** Use `var(--fleet-shadow-sm|md|lg)`.

Only create new custom components when no existing library component can fulfill the need. When you do, still use Air CSS variables for all visual properties.

### 2. Import rules

- **Import everything from `"air-web-components"`** — there are no subpath imports for components.
- **Import styles once** in the app entry point: `import "air-web-components/styles"`

### 3. Typography CSS variable gotcha

Use `style` prop for Air CSS variables on Typography — not `className`:
```tsx
// CORRECT
<Typography variant="default" style={{ color: 'var(--fleet-text-secondary)' }}>

// WRONG — causes missing font-size
<Typography variant="default" className="text-[var(--fleet-text-secondary)]">
```

### 4. Components work without props

Don't add state management unless the user asks for it. Just render `<ChatIsland />` and it works.
6. **Use Typography component for all text** — never use raw `<p>`, `<h1>`, `<span>` with manual font sizing.

## Component Reference

### Imports

```tsx
// Most common imports
import {
  // Primitives
  Button, Typography, Icon, TextInput, Textarea, Checkbox,
  // Selects & Menus
  Select, AirSelect, ContextMenu,
  // Tabs
  Tabs, DefaultTabs, VerticalTabs,
  // Lists
  List, ListItem,
  // Layout
  WindowLayout, Island, IslandContainer, ChatIsland,
  MainToolbar, ToolSidebar, Toolbar,
  Panel, PanelContainer, Splitter,
  // File Tree
  FileTree, FileTreeIsland,
  // AI Chat
  AiChatInput, AiChatContextPreview, Message, AiMessage, UserMessage,
  // Task Management
  TaskList, TaskListItem,
  // Dialogs & Banners
  Dialog, Dialog, Banner,
  // Theme
  ThemeProvider, ThemeSwitcher, useTheme,
  // Utilities
  cn, Icon, getAllFleetIcons,
} from "@/components/ui"
```

### Typography Variants

Use these exact variant strings — they map to Air's Figma typography specs:

| Variant | Size | Use for |
|---------|------|---------|
| `header-0-semibold` | 26px | Hero headings (rare) |
| `header-1-semibold` | 23px | Page titles |
| `header-2-semibold` | 19px | Section headings |
| `header-3-semibold` | 15px | Subsection headings, card titles |
| `default` | 13px | Body text — **use this for 90% of content** |
| `default-semibold` | 13px | Emphasized body text |
| `default-chat` | 13px, 20px line-height | Chat message content |
| `medium` | 12px | Secondary text, compact layouts |
| `small` | 10px | Captions, labels, metadata |
| `code` | 13px mono | Code snippets |

### Button Variants

```tsx
<Button variant="primary">Primary action</Button>
<Button variant="secondary">Secondary action</Button>
<Button variant="dangerous">Destructive action</Button>
<Button variant="warning">Warning action</Button>
<Button variant="positive">Success action</Button>
<Button variant="ghost">Subtle action</Button>

// Sizes: "sm" | "default" | "lg" | "icon" | "icon-sm" | "icon-lg"
<Button variant="primary" size="sm">Small</Button>
<Button variant="ghost" size="icon" iconLeft="close" />
```

### Icon Usage

820 Air icons are bundled. No setup needed. Theme-aware (auto-switches dark/light).

**Icon priority:** Always try Air icons first (`fleet` prop). If the icon doesn't exist in Air, use [Lucide](https://lucide.dev/icons/) as fallback (`lucide` prop). Read `icon-names.txt` and `lucide-icon-names.txt` to find the right name.

```tsx
// Air icons — use the fleet prop (PREFERRED)
<Icon fleet="ai-chat" size="md" />
<Icon fleet="file-types-typescript" size="sm" />
<Icon fleet="vcs-branch" />
<Icon fleet="settings" colorize style={{ color: 'var(--fleet-icon-primary)' }} />

// Lucide fallback — use the lucide prop (PascalCase names)
<Icon lucide="Search" size="sm" />
<Icon lucide="ChevronDown" />
<Icon lucide="Mail" size="md" />
```

**Icon sizes:** `xs` (12px), `sm` (16px, default), `md` (20px), `lg` (24px), `xl` (32px), `2xl` (40px)

**Common Air icon names:**
- Navigation: `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`, `close`, `add`, `search`, `back`, `forward`
- Files: `file-types-typescript`, `file-types-javascript`, `file-types-python`, `file-types-kotlin`, `file-types-java`, `file-types-text`, `folder`, `new-file`
- AI: `ai-chat`, `ai-assistant`, `ai-send`, `ai-stop`, `ai-code`, `ai-file`, `ai-agent`, `ai-snapshot`, `thinking`, `claude-code-gray`
- VCS: `vcs-branch`, `vcs-commit`, `vcs-diff`, `vcs-history`, `branch`, `commit`
- Status: `progress`, `checkmark`, `error`, `warning`, `info`, `task-draft`, `task-completed`, `task-error`
- Actions: `settings`, `configure`, `expand`, `collapse`, `expand-all`, `pin`, `close`, `add-comment`, `copy`
- Panels: `panel-left-open`, `panel-right-open`, `panel-chat-open`, `terminal`, `notifications`

### Discovering All Icons, Colors, and Tokens

The lists above are curated subsets. To find the **complete** lists, read these source files from `node_modules/air-web-components/`:

| What | File to read | Format |
|------|-------------|--------|
| **All 820 Air icon names** | `src/lib/icon-names.txt` | One name per line |
| **All 5446 Lucide icon names** | `src/lib/lucide-icon-names.txt` | One PascalCase name per line |
| **All 775 CSS variables** | `src/lib/css-variables.txt` | One `--fleet-*` per line |
| CSS variable values (dark) | `src/styles/fleet-semantic-vars-dark.css` | `--fleet-*: value;` |
| CSS variable values (light) | `src/styles/fleet-semantic-vars-light.css` | `--fleet-*: value;` |
| Design tokens (shadows, radii) | `src/styles/globals.css` — search for `:root` | `--fleet-*: value;` |
| Component props & types | `src/components/ui/index.ts` | TypeScript interfaces |

**When you need an icon or color variable you're not sure about, read the `.txt` files above.** They are plain text, one entry per line, and contain the complete lists.

**To programmatically list all icons** (e.g. in a script or console):
```tsx
import { getAllIconNames } from "@/components/ui"
console.log(getAllIconNames()) // string[] of all 820 icon names
```

**To check if an icon exists:**
```tsx
import { hasIcon } from "@/components/ui"
hasIcon("ai-chat") // true
hasIcon("nonexistent") // false
```

**CSS variable naming patterns** — if you need a specific token, these patterns cover most cases:
```
Text:        --fleet-text-{primary|secondary|tertiary|accent|disabled|dangerous|positive}
Background:  --fleet-background-{primary|secondary}
Buttons:     --fleet-button-{primary|secondary|dangerous|warning|positive}-{background|text|border}-{default|hovered|pressed|disabled}
Ghost:       --fleet-ghostButton-off-{background|text|border}-{default|hovered|pressed|disabled}
Input:       --fleet-inputField-{background|text|border|hint|focusBorder|focusOutline}-{default|hovered|error|disabled}
List:        --fleet-listItem-{background|text}-{default|hovered|focused|selected}
Icons:       --fleet-icon-{primary|secondary}
Borders:     --fleet-border, --fleet-border-focused, --fleet-separator-default
Islands:     --fleet-island-background
Popups:      --fleet-popup-{background|border|text}
Tabs:        --fleet-tab-{background|text}-{default|hovered|selected}
Shadows:     --fleet-shadow-{sm|md|lg}
Radii:       --fleet-radius-{xs|sm|md|lg}
```

### Layout Patterns

**IMPORTANT: Most layout components are self-managing. Use them with ZERO props first.** They render complete UIs with default data. Only add props when you need to customize.

**Full IDE window — zero props gives you toolbar + task list + chat + file tree + tool sidebar:**
```tsx
// This renders a COMPLETE IDE layout with all panels, no props needed
<div className="h-screen">
  <WindowLayout />
</div>
```

**Full IDE window — with custom content:**
```tsx
<div className="h-screen">
  <WindowLayout
    toolbarProps={{
      type: "task",
      projectName: "my-project",
      branchName: "main",
      taskName: "Add search feature",
    }}
    mainContent={<ChatIsland className="h-full" />}
    filesPanel={<FileTreeIsland />}
  />
</div>
```

**WindowLayout accepts these optional props (all have defaults):**
- `toolbarProps` — props for MainToolbar (type, projectName, branchName, taskName)
- `mainContent` — center panel content (default: ChatIsland)
- `filesPanel` — right file panel (default: FileTreeIsland)
- `leftPanel` — left panel (default: TaskList)
- `sidePanel` — side panel content
- `bottomPanel` — bottom panel (default: Terminal-like panel)
- `children` — if provided, replaces the entire panel layout with custom content

**Chat interface:**
```tsx
<div className="flex flex-col h-screen" style={{ background: 'var(--fleet-background-primary)' }}>
  <MainToolbar type="task" />
  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
    <AiMessage>I'll help you build that feature.</AiMessage>
    <UserMessage>Add a search bar to the header</UserMessage>
    <ProgressMessage label="Analyzing" fileName="Header.tsx" />
  </div>
  <div className="p-4">
    <AiChatInput onSend={(msg) => console.log(msg)} />
  </div>
</div>
```

**Task management view — all self-managing:**
```tsx
<div className="flex h-screen" style={{ background: 'var(--fleet-background-primary)' }}>
  <TaskList width={280} />
  <ChatIsland className="flex-1 h-full" />
  <ToolSidebar />
</div>
```

**Zero-prop components that render complete UIs:**
```tsx
<WindowLayout />       // Full IDE: toolbar + task list + chat + file tree + tool sidebar
<ChatIsland />         // Chat panel with messages area and input
<TaskList />           // Task list with search, groups, status icons
<FileTreeIsland />     // File tree with expand/collapse
<ToolSidebar />        // Vertical icon sidebar
<MainToolbar />        // macOS-style toolbar with workspace info
<AiChatInput />        // AI chat input with model selector
<AiChatContextPreview /> // Context file list
<Dialog />             // Modal dialog with OK/Cancel
<Banner />             // Info notification banner
```

### Colors — CSS Variables

Use these for any custom styling. They automatically switch between light/dark themes.

**Text:**
```
var(--fleet-text-primary)      — main text
var(--fleet-text-secondary)    — secondary/muted text
var(--fleet-text-tertiary)     — very subtle text
var(--fleet-text-accent)       — accent/blue text
var(--fleet-text-disabled)     — disabled state
var(--fleet-text-dangerous)    — error/red text
var(--fleet-text-positive)     — success/green text
```

**Backgrounds:**
```
var(--fleet-background-primary)    — main background
var(--fleet-background-secondary)  — secondary/elevated background
var(--fleet-island-background)     — island/card background
var(--fleet-context-background)    — subtle panel background
```

**Borders & Separators:**
```
var(--fleet-border)            — default border
var(--fleet-separator-default) — separator lines
var(--fleet-border-focused)    — focused element border
```

**Interactive elements:**
```
var(--fleet-button-primary-background-default)
var(--fleet-ghostButton-off-background-hovered)
var(--fleet-listItem-background-hovered)
var(--fleet-listItem-background-focused)
var(--fleet-inputField-background-default)
var(--fleet-inputField-border-default)
var(--fleet-inputField-focusBorder-default)
```

**Shadows:**
```
var(--fleet-shadow-sm)   — inputs, small cards
var(--fleet-shadow-md)   — banners, elevated cards
var(--fleet-shadow-lg)   — dialogs, popups
```

**Radii:**
```
var(--fleet-radius-xs)   — 3px (ghost buttons)
var(--fleet-radius-sm)   — 4px (toolbar buttons, inputs)
var(--fleet-radius-md)   — 6px (messages, banners)
var(--fleet-radius-lg)   — 8px (cards, islands, dialogs)
```

### Dialog

```tsx
// Self-managing — opens automatically
<Dialog
  title="Confirm Delete"
  body="Are you sure you want to delete this file?"
  buttons={[
    { label: "Cancel", variant: "secondary" },
    { label: "Delete", variant: "primary", onClick: handleDelete },
  ]}
/>
```

### Banner

```tsx
<Banner type="info" text="File has been changed on disk" />
<Banner type="dangerous" text="Build failed" />
<Banner type="warning" text="Unsaved changes" />
<Banner type="positive" text="Deployment successful" />

// With actions
<Banner
  type="info"
  text="New version available"
  buttons={[{ label: "Update", variant: "primary", onClick: handleUpdate }]}
/>
```

### Select

```tsx
<AirSelect
  options={[
    { value: "sonnet", label: "Sonnet 4.6" },
    { value: "opus", label: "Opus 4.6" },
    { value: "haiku", label: "Haiku 4.5" },
  ]}
  placeholder="Select model..."
  onValueChange={(val) => console.log(val)}
/>
```

### Context Menu

```tsx
<RightClickContextMenu
  items={[
    { type: 'action', name: 'Cut', icon: 'cut', shortcut: '⌘X', enabled: true, callback: () => {} },
    { type: 'action', name: 'Copy', icon: 'copy', shortcut: '⌘C', enabled: true, callback: () => {} },
    { type: 'action', name: 'Paste', icon: 'paste', shortcut: '⌘V', enabled: true, callback: () => {} },
    { type: 'separator' },
    { type: 'action', name: 'Delete', icon: 'delete', enabled: true, callback: () => {} },
  ]}
>
  <div>Right-click me</div>
</RightClickContextMenu>
```

### Tabs

```tsx
// Simple tabs — works immediately
<DefaultTabs />

// Custom tabs
<DefaultTabs
  tabs={[
    { value: "code", label: "Code" },
    { value: "preview", label: "Preview" },
    { value: "terminal", label: "Terminal" },
  ]}
  defaultValue="code"
/>

// File tabs
<FileTab fileName="App.tsx" fileIcon="file-types-typescript" />

// Vertical tabs
<VerticalTabs />
```

## Anti-Patterns — Do NOT Do These

```tsx
// DON'T hardcode colors — EVER
<div style={{ color: '#e0e1e4' }}>                              // BAD
<div style={{ color: 'var(--fleet-text-primary)' }}>            // GOOD

// DON'T use raw HTML for text — use Typography
<h1 className="text-2xl font-bold">Title</h1>                  // BAD
<Typography variant="header-1-semibold">Title</Typography>      // GOOD

<p className="text-sm text-gray-500">Subtitle</p>              // BAD
<Typography variant="medium" style={{ color: 'var(--fleet-text-secondary)' }}>Subtitle</Typography>  // GOOD

// DON'T hardcode border-radius — use tokens
<div className="rounded-lg">                                    // BAD
<div className="rounded-[var(--fleet-radius-lg)]">              // GOOD

// DON'T hardcode shadows
<div className="shadow-lg">                                     // BAD
<div style={{ boxShadow: 'var(--fleet-shadow-lg)' }}>          // GOOD

// DON'T write custom buttons — use Button component
<button className="bg-blue-500 text-white px-4 py-2 rounded">  // BAD
<Button variant="primary">Save</Button>                         // GOOD

// DON'T write custom inputs — use TextInput
<input className="border rounded px-2 py-1" />                  // BAD
<TextInput placeholder="Enter text..." />                       // GOOD

// DON'T write custom selects — use AirSelect
<select className="border rounded">...</select>                 // BAD
<AirSelect options={options} />                                  // GOOD

// DON'T add state management for prototyping
const [tasks, setTasks] = useState(defaultTasks)                // UNNECESSARY
<TaskList />  // Just use the component — it manages its own state

// DON'T import from subpaths
import { Button } from "air-web-components/components/ui/button"  // BAD
import { Button } from "@/components/ui"                        // GOOD

// DON'T use className for CSS variables on Typography
<Typography className="text-[var(--fleet-text-secondary)]">     // BAD — breaks CVA
<Typography style={{ color: 'var(--fleet-text-secondary)' }}>   // GOOD
```

### When building new custom components

If the user asks for something not in the library, you may create new components. But:

1. **Use Air CSS variables** for all colors, shadows, radii — no hardcoded values
2. **Use Typography** for all text — no raw `<p>`, `<h1>`, `<span>` with manual font sizing
3. **Use Icon** for all icons — check `icon-names.txt` first, fall back to Lucide
4. **Use Button** for all clickable actions — don't write custom `<button>` elements
5. **Follow the self-managing pattern** — component should work with zero props for prototyping

## Quick Recipes

### Settings page
```tsx
<div className="flex flex-col gap-4 p-6 max-w-lg" style={{ color: 'var(--fleet-text-primary)' }}>
  <Typography variant="header-2-semibold">Settings</Typography>
  <div className="flex flex-col gap-3">
    <TextInput label="Project name" placeholder="my-project" />
    <AirSelect options={models} placeholder="Select model" />
    <Checkbox label="Enable auto-save" />
  </div>
  <div className="flex gap-2 justify-end">
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </div>
</div>
```

### File browser with preview
```tsx
<div className="flex h-screen">
  <ToolSidebar />
  <FileTreeIsland />
  <Island className="flex-1">
    <Typography variant="default" style={{ color: 'var(--fleet-text-primary)' }}>
      File preview content
    </Typography>
  </Island>
</div>
```

### Notification banner stack
```tsx
<div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
  <Banner type="positive" text="Changes saved" />
  <Banner type="warning" text="3 files have conflicts" buttons={[{ label: "Resolve", variant: "primary" }]} />
</div>
```

"use client"

import { useState } from "react"
import {
  WebAppLayout,
  Navigation,
  NavigationItem,
  useNavigationExpanded,
  Icon,
  Typography,
  ChatIsland,
  IslandWithTabs,
  TabBar,
  TabContentArea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  WorkflowStep,
  ScrollArea,
} from "@/components/ui"
import { Room } from "./Room"
import { Editor } from "./Editor"

// ─── Navigation ──────────────────────────────────────────────────────────────

function NavContent() {
  const expanded = useNavigationExpanded()
  const compact = !expanded
  const [active, setActive] = useState("specs")

  return (
    <>
      <Navigation.Top>
        <Navigation.Logo>
          <div className="flex items-center w-full cursor-pointer">
            <Icon fleet="ai-logo" className="!w-[34px] !h-[34px] shrink-0" />
          </div>
        </Navigation.Logo>
        <Navigation.Items>
          <NavigationItem isActive={active === "new"} compact={compact} onClick={() => setActive("new")}>
            <Icon fleet="add" size="sm" className="shrink-0" />
            <NavigationItem.Text>New Agent</NavigationItem.Text>
          </NavigationItem>
          <NavigationItem isActive={active === "automations"} compact={compact} onClick={() => setActive("automations")}>
            <Icon fleet="vcs-history" size="sm" className="shrink-0" />
            <NavigationItem.Text>Automations</NavigationItem.Text>
          </NavigationItem>
        </Navigation.Items>
      </Navigation.Top>
      <Navigation.Bottom>
        <NavigationItem compact={compact}>
          <Icon fleet="settings" size="sm" className="shrink-0" />
          <NavigationItem.Text>Settings</NavigationItem.Text>
        </NavigationItem>
        <NavigationItem compact={compact}>
          <Icon fleet="user" size="sm" className="shrink-0" />
          <NavigationItem.Text>Vadim Lobodin</NavigationItem.Text>
        </NavigationItem>
      </Navigation.Bottom>
    </>
  )
}

// ─── Workflow steps sidebar ──────────────────────────────────────────────────

function WorkflowStepsSidebar() {
  return (
    <div className="flex flex-col h-full p-2 gap-3">
      <Typography variant="header-2-semibold">
        Workflow steps
      </Typography>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2">
          <WorkflowStep title="Feature Workflow" hint="plan.md" status="done" agent="Codex" agentIcon="codex" />
          <WorkflowStep title="Requirements" status="in-progress" agent="Codex" agentIcon="codex" />
          <WorkflowStep title="Technical Specification" status="todo" agent="Claude" agentIcon="claude-code" />
          <WorkflowStep title="Build" status="todo" agent="Claude" agentIcon="claude-code" />
          <WorkflowStep title="Review" status="todo" agent="Codex" agentIcon="codex" />
          <div className="flex items-center gap-1 cursor-pointer py-1">
            <Icon fleet="add" size="sm" style={{ color: "var(--fleet-text-secondary)" }} />
            <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>
              Add step
            </Typography>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Right panel ─────────────────────────────────────────────────────────────

function RightPanel() {
  return (
    <IslandWithTabs className="h-full">
      <Tabs defaultValue="plan" className="h-full flex flex-col">
        <TabBar>
          <TabsList className="h-auto bg-transparent gap-1 p-0">
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="tech-spec">Tech Spec</TabsTrigger>
          </TabsList>
        </TabBar>
        <TabContentArea>
          <TabsContent value="plan" className="mt-0 h-full">
            <Room>
              <Editor />
            </Room>
          </TabsContent>
          <TabsContent value="requirements" className="mt-0 h-full" />
          <TabsContent value="tech-spec" className="mt-0 h-full" />
        </TabContentArea>
      </Tabs>
    </IslandWithTabs>
  )
}

// ─── Chat messages ───────────────────────────────────────────────────────────

const chatMessages = [
  { id: "1", role: "user" as const, content: "Create or update my AGENTS.md file." },
  {
    id: "2",
    role: "assistant" as const,
    content: (
      <Typography variant="default-chat" as="div" className="flex flex-col gap-3">
        <p>Created <strong>AGENTS.md</strong> at the repo root and populated it with project-specific guidance based on the current codebase.</p>
        <div>
          <Typography variant="default-chat" as="p" className="font-semibold mb-1">What I added</Typography>
          <ul className="list-disc pl-5 flex flex-col gap-1" style={{ color: "var(--fleet-text-secondary)" }}>
            <li>Repo summary (Next.js 15 + React 19 + TypeScript + Tailwind 4)</li>
            <li>Key directories and responsibilities (<code>src/app</code>, <code>src/components/ui</code>, <code>src/lib</code>, <code>public/mp3</code>)</li>
            <li>Common npm commands (<code>dev</code>, <code>lint</code>, <code>build</code>, <code>start</code>)</li>
            <li>Required env vars for voting API (<code>KV_REST_API_URL</code>, <code>KV_REST_API_TOKEN</code>)</li>
            <li>Coding conventions and architectural patterns to follow</li>
            <li>API behavior notes for <code>/api/vote</code></li>
          </ul>
        </div>
        <div>
          <Typography variant="default-chat" as="p" className="font-semibold mb-1">Git actions completed</Typography>
          <ul className="list-disc pl-5 flex flex-col gap-1" style={{ color: "var(--fleet-text-secondary)" }}>
            <li>Committed: <strong>Add AGENTS.md with repository-specific agent guidance</strong></li>
            <li>Pushed to: <code>cursor/agents-markdown-file-5a13</code></li>
            <li>Created draft PR targeting <strong>main</strong> (updated/created as required)</li>
          </ul>
        </div>
      </Typography>
    ),
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div
      className="h-screen flex"
      style={{
        ["--layout-padding" as string]: "16px",
        ["--layout-gap" as string]: "8px",
        ["--nav-width-collapsed" as string]: "68px",
        ["--nav-width-expanded" as string]: "232px",
        ["--second-level-navigation-width" as string]: "232px",
      }}
    >
      <Navigation alwaysExpanded>
        <NavContent />
      </Navigation>
      <WebAppLayout withNavigation expanded>
        {/* Left: workflow steps */}
        <WebAppLayout.Sidebar width={320}>
          <div className="h-full -m-[var(--layout-padding)]">
            <WorkflowStepsSidebar />
          </div>
        </WebAppLayout.Sidebar>

        {/* Center: conversation */}
        <WebAppLayout.Island main isEmpty className="!bg-[var(--fleet-island-background)] !p-0">
          <ChatIsland
            className="h-full [&>div:last-child]:pb-0"
            messages={chatMessages}
          />
        </WebAppLayout.Island>

        {/* Right: plan panel */}
        <WebAppLayout.Sidebar width={480}>
          <div className="h-full -m-[var(--layout-padding)] min-w-0 overflow-hidden">
            <RightPanel />
          </div>
        </WebAppLayout.Sidebar>
      </WebAppLayout>
    </div>
  )
}

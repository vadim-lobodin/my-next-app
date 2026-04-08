"use client"

import { useState, useCallback } from "react"
import {
  Navigation,
  NavigationItem,
  useNavigationExpanded,
  WebAppLayout,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Avatar,
  AvatarStack,
  ScrollArea,
  Icon,
  Input,
  Typography,
  Menu,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  TaskListGrouped,
} from "@/components/ui"
import type { FleetMenuItem, TaskItemData } from "@/components/ui"

// ── Data ──────────────────────────────────────────────

type Member = { name: string; role: "admin" | "member"; src?: string }
type AutomationRun = {
  id: string; name: string; subtitle: string; repo: string
  status: "idle" | "running" | "archived"
  hasUnread?: boolean; additions?: number; deletions?: number
}
type Project = {
  id: string; name: string; color: string; repos: string[]
  members: Member[]; tasks: TaskItemData[]; automations: AutomationRun[]
}

const h = (hours: number) => new Date(Date.now() - hours * 3600_000)
const d = (days: number) => new Date(Date.now() - days * 86_400_000)

const PROJECTS: Project[] = [
  {
    id: "pets-store", name: "Pets store", color: "#3b82f6",
    repos: ["pet-store", "pet-api"],
    members: [
      { name: "Marko", role: "admin", src: "https://randomuser.me/api/portraits/men/32.jpg" },
      { name: "Anna", role: "member", src: "https://randomuser.me/api/portraits/women/44.jpg" },
      { name: "Mikhail", role: "member", src: "https://randomuser.me/api/portraits/men/75.jpg" },
      { name: "Dima", role: "member", src: "https://randomuser.me/api/portraits/men/86.jpg" },
      { name: "Katya", role: "member", src: "https://randomuser.me/api/portraits/women/68.jpg" },
    ],
    tasks: [
      { id: "t1", title: "Add item search to catalogue page", repository: "pet-store", status: "idle", metadata: "Plan & task breakdown…", updatedAt: h(0.2), hasUnread: true, assignee: { name: "Marko", src: "https://randomuser.me/api/portraits/men/32.jpg" } },
      { id: "t2", title: "Implement shopping cart dropdown", repository: "pet-store", status: "idle", metadata: "Input required", updatedAt: h(5), assignee: { name: "Anna", src: "https://randomuser.me/api/portraits/women/44.jpg" } },
      { id: "t3", title: "Add product filters by pet type", repository: "pet-store", status: "running", metadata: "Plan & task breakdown…", updatedAt: h(0.03), hasUnread: true, assignee: { name: "Mikhail", src: "https://randomuser.me/api/portraits/men/75.jpg" } },
      { id: "t4", title: "Fix authentication bug", repository: "pet-api", status: "running", metadata: "Reviewing changes…", updatedAt: h(3), assignee: { name: "Dima", src: "https://randomuser.me/api/portraits/men/86.jpg" } },
      { id: "t5", title: "Update AGENTS.md", repository: "pet-store", status: "running", metadata: "Checking dependencies…", updatedAt: h(0.5), assignee: { name: "Marko", src: "https://randomuser.me/api/portraits/men/32.jpg" } },
      { id: "t6", title: "Optimize checkout page speed", repository: "pet-store", status: "archived", updatedAt: h(1), assignee: { name: "Katya", src: "https://randomuser.me/api/portraits/women/68.jpg" }, deliveryStatus: { text: "All checks passed", added: 978, removed: 144 } },
      { id: "t7", title: "Design search bar UI", repository: "pet-api", status: "archived", updatedAt: h(0.75), hasUnread: true, assignee: { name: "Anna", src: "https://randomuser.me/api/portraits/women/44.jpg" }, deliveryStatus: { text: "Changes delivered", added: 112, removed: 0 } },
    ],
    automations: [
      { id: "a1", name: "Summarize standup", subtitle: "Input required · Daily 9am trigger", repo: "pet-store", status: "idle", hasUnread: true },
      { id: "a2", name: "Generate Release Notes", subtitle: "Checking out latest changes… · Push to main", repo: "pet-store", status: "running" },
      { id: "a3", name: "Fix Bugs", subtitle: "Reviewing the latest changes… · Monthly run", repo: "pet-api", status: "running" },
      { id: "a4", name: "Fix Bugs", subtitle: "Mar 10, 12:00 · Monthly run", repo: "pet-api", status: "archived", hasUnread: true, additions: 5, deletions: 10 },
      { id: "a5", name: "Generate Release Notes", subtitle: "Mar 5, 12:00 · Push to main", repo: "pet-store", status: "archived", additions: 5, deletions: 10 },
      { id: "a6", name: "Generate Release Notes", subtitle: "Feb 28, 12:00 · Push to main", repo: "pet-api", status: "archived" },
    ],
  },
  {
    id: "platform", name: "Platform", color: "#22c55e",
    repos: [],
    members: [{ name: "Marko", role: "admin" }],
    tasks: [], automations: [],
  },
]

// ── Nav Content ───────────────────────────────────────

function NavContent({
  projects,
  activeProjectId,
  onSwitchProject,
  onCreateProject,
}: {
  projects: Project[]
  activeProjectId: string
  onSwitchProject: (id: string) => void
  onCreateProject: () => void
}) {
  const expanded = useNavigationExpanded()
  const compact = !expanded

  return (
    <>
      <Navigation.Top>
        <Navigation.Logo>
          <div className="flex items-center w-full cursor-pointer">
            <Icon fleet="air-logo" className="!w-[34px] !h-[34px] shrink-0" />
          </div>
        </Navigation.Logo>
        <Navigation.Items>
          <NavigationItem compact={compact}>
            <Icon fleet="ai-chat" size="sm" className="shrink-0" />
            <NavigationItem.Text>Tasks</NavigationItem.Text>
          </NavigationItem>
          <NavigationItem compact={compact}>
            <Icon fleet="vcs-history" size="sm" className="shrink-0" />
            <NavigationItem.Text>Automations</NavigationItem.Text>
          </NavigationItem>
        </Navigation.Items>

        {/* Projects */}
        {!compact && (
          <div className="px-2 pt-4 pb-1">
            <Typography variant="medium" className="px-2 uppercase tracking-wider" style={{ color: "var(--fleet-text-disabled)", fontSize: 11 }}>
              Projects
            </Typography>
          </div>
        )}
        <Navigation.Items>
          {projects.map((p) => (
            <NavigationItem
              key={p.id}
              isActive={p.id === activeProjectId}
              compact={compact}
              onClick={() => onSwitchProject(p.id)}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
              <NavigationItem.Text>{p.name}</NavigationItem.Text>
            </NavigationItem>
          ))}
          <NavigationItem compact={compact} onClick={onCreateProject}>
            <Icon fleet="add" size="sm" className="shrink-0" />
            <NavigationItem.Text>Create or join a project</NavigationItem.Text>
          </NavigationItem>
        </Navigation.Items>
      </Navigation.Top>

      <Navigation.Bottom>
        <NavigationItem compact={compact}>
          <Icon fleet="notifications" size="sm" className="shrink-0" />
          <NavigationItem.Text>Notifications</NavigationItem.Text>
        </NavigationItem>
        <NavigationItem compact={compact}>
          <Icon fleet="settings" size="sm" className="shrink-0" />
          <NavigationItem.Text>Settings</NavigationItem.Text>
        </NavigationItem>
        <NavigationItem compact={compact}>
          <Avatar name="Marko" size={20} />
          <NavigationItem.Text>Marko</NavigationItem.Text>
        </NavigationItem>
      </Navigation.Bottom>
    </>
  )
}

// ── Page ──────────────────────────────────────────────

export default function ProjectsPage() {
  const [activeProjectId, setActiveProjectId] = useState("pets-store")
  const [activeTab, setActiveTab] = useState("tasks")
  const [showSettings, setShowSettings] = useState(false)
  const [settingsSection, setSettingsSection] = useState<"general" | "members">("general")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createModalTab, setCreateModalTab] = useState<"create" | "join">("create")
  const [newProjectName, setNewProjectName] = useState("")
  const [projects, setProjects] = useState(PROJECTS)

  const project = projects.find((p) => p.id === activeProjectId) || projects[0]

  const switchProject = useCallback((id: string) => {
    setActiveProjectId(id)
    setShowSettings(false)
    setActiveTab("tasks")
  }, [])

  return (
    <div
      className="flex h-screen"
      style={{
        ["--layout-padding" as string]: "16px",
        ["--layout-gap" as string]: "8px",
        ["--nav-width-collapsed" as string]: "68px",
        ["--nav-width-expanded" as string]: "232px",
        ["--second-level-navigation-width" as string]: "232px",
      }}
    >
      {/* ── Navigation ── */}
      <Navigation alwaysExpanded={!showSettings}>
        <NavContent
          projects={projects}
          activeProjectId={activeProjectId}
          onSwitchProject={switchProject}
          onCreateProject={() => setShowCreateModal(true)}
        />
      </Navigation>

      {/* ── Layout ── */}
      <WebAppLayout withNavigation expanded={!showSettings}>
        <WebAppLayout.Island main>
          {showSettings ? (
            <SettingsView
              project={project}
              section={settingsSection}
              onSectionChange={setSettingsSection}
              onClose={() => setShowSettings(false)}
            />
          ) : (
            <div className="flex flex-col h-full min-h-0">
              {/* ── Page Header ── */}
              <div className="px-8 pt-6 pb-0 shrink-0">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <Typography variant="header-2-semibold" as="h1" className="mb-4">
                      {project.name}
                    </Typography>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {project.repos.map((r) => (
                        <div
                          key={r}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--fleet-radius-xs)] bg-[rgba(255,255,255,0.03)] cursor-pointer hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                        >
                          <Icon fleet="vcs" size="sm" />
                          <Typography variant="medium" style={{ color: "var(--fleet-text-secondary)" }}>{r}</Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 pt-1.5">
                    <AvatarStack
                      users={project.members.map((m) => ({ name: m.name, src: m.src }))}
                      size={32}
                    />
                    <div className="w-px h-6 bg-[var(--fleet-separator-default)]" />
                    <Button variant="ghost" onClick={() => setShowSettings(true)}>Settings</Button>
                    <Button variant="primary">Invite</Button>
                  </div>
                </div>
              </div>

              {/* ── Tabs ── */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
                <div className="px-8 pt-4">
                  <TabsList>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="automations">Automations</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="tasks" className="flex-1 min-h-0 px-6 pt-4">
                  <TaskListGrouped
                    items={project.tasks}
                    groupBy="status"
                    onClick={(id) => console.log("open task", id)}
                  />
                </TabsContent>

                <TabsContent value="automations" className="flex-1 min-h-0">
                  <AutomationsPanel automations={project.automations} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </WebAppLayout.Island>
      </WebAppLayout>

      {/* ── Create Modal ── */}
      <DialogRoot open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex gap-0 -mx-6 -mt-2 px-6 border-b border-[var(--fleet-border)]">
                {(["create", "join"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`pb-2 px-4 text-sm capitalize border-b-2 transition-colors ${
                      createModalTab === tab
                        ? "border-[var(--fleet-link-text-default)] text-[var(--fleet-text-primary)]"
                        : "border-transparent text-[var(--fleet-text-secondary)]"
                    }`}
                    onClick={() => setCreateModalTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div style={{ minHeight: 200 }}>
            {createModalTab === "create" ? (
              <div className="flex flex-col gap-4">
                <div>
                  <Typography variant="medium" as="label" className="block mb-1.5" style={{ color: "var(--fleet-text-secondary)" }}>
                    Project name
                  </Typography>
                  <Input
                    placeholder="Enter project name…"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <Typography variant="medium" as="label" className="block mb-1.5" style={{ color: "var(--fleet-text-secondary)" }}>
                    Repositories <span style={{ color: "var(--fleet-text-disabled)" }}>(connect at least one)</span>
                  </Typography>
                  <Button variant="secondary" className="w-full justify-between">
                    Select repositories…
                    <Icon fleet="chevron-down" size="sm" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Typography variant="default" style={{ color: "var(--fleet-text-disabled)" }}>Coming soon</Typography>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!newProjectName.trim()) return
                const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
                const np: Project = {
                  id: `project-${Date.now()}`, name: newProjectName.trim(),
                  color: colors[projects.length % colors.length],
                  repos: [], members: [{ name: "Marko", role: "admin" }],
                  tasks: [], automations: [],
                }
                setProjects([...projects, np])
                setActiveProjectId(np.id)
                setNewProjectName("")
                setShowCreateModal(false)
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  )
}

// ── Automations Panel ─────────────────────────────────

function AutomationsPanel({ automations }: { automations: AutomationRun[] }) {
  const byStatus = (s: string) => automations.filter((a) => a.status === s)
  const groups = [
    { status: "idle", label: "Action Needed" },
    { status: "running", label: "Running" },
    { status: "archived", label: "Recent" },
  ]

  if (automations.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>No automations yet</Typography>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto px-6 py-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <Menu
            trigger={<Button variant="secondary">All automations ▾</Button>}
            items={[
              { type: "action", name: "All automations", callback: () => {} },
              { type: "separator" },
              { type: "action", name: "Generate Release Notes", callback: () => {} },
              { type: "action", name: "Fix Bugs", callback: () => {} },
              { type: "action", name: "Summarize standup", callback: () => {} },
            ] as FleetMenuItem[]}
          />
          <Typography
            variant="medium"
            as="a"
            className="cursor-pointer"
            style={{ color: "var(--fleet-text-secondary)" }}
          >
            Manage automations →
          </Typography>
        </div>

        {groups.map(({ status, label }, idx) => {
          const runs = byStatus(status)
          if (runs.length === 0) return null
          return (
            <div key={status}>
              {idx > 0 && byStatus(groups[idx - 1].status).length > 0 && (
                <div className="h-px bg-[var(--fleet-border)] mx-2 my-6" />
              )}
              <div className="mb-6">
                <div className="flex items-center justify-between px-2 mb-1">
                  <Typography variant="default-semibold" style={{ color: "var(--fleet-text-secondary)" }}>
                    {label}
                  </Typography>
                  {status === "archived" && (
                    <Typography variant="medium" as="a" className="cursor-pointer" style={{ color: "var(--fleet-text-disabled)" }}>
                      View all runs →
                    </Typography>
                  )}
                </div>
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-start py-1 px-2 gap-1 rounded-[4px] cursor-pointer hover:bg-[rgba(255,255,255,0.09)] transition-colors"
                  >
                    <Icon
                      fleet={status === "running" ? "progress" : status === "idle" ? "task-user-input" : "task-paused"}
                      size="sm"
                      className={`shrink-0 ${status === "running" ? "animate-spin" : ""}`}
                    />
                    <div className="flex flex-1 flex-col min-w-0 gap-0.5">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-0.5 flex-1 min-w-0">
                          <Typography variant="default" className="truncate">{run.name}</Typography>
                          {run.hasUnread && <Icon fleet="task-unread" size="sm" className="shrink-0 text-[var(--air-blue-110)]" />}
                        </div>
                        <div className="shrink-0 ml-2 flex items-center gap-1">
                          {run.additions !== undefined && (
                            <span className="text-[var(--air-text-positive,#169068)] text-[13px]">+{run.additions}</span>
                          )}
                          {run.deletions !== undefined && (
                            <span className="text-[var(--air-text-dangerous,#e1465e)] text-[13px]">-{run.deletions}</span>
                          )}
                          <Typography variant="default" style={{ color: "var(--fleet-text-secondary)", fontSize: 12 }}>
                            {run.repo}
                          </Typography>
                        </div>
                      </div>
                      <Typography variant="default" style={{ color: "var(--fleet-text-secondary)", fontSize: 12 }}>
                        {run.subtitle}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

// ── Settings View ─────────────────────────────────────

function SettingsView({
  project, section, onSectionChange, onClose,
}: {
  project: Project; section: "general" | "members"
  onSectionChange: (s: "general" | "members") => void; onClose: () => void
}) {
  const [projectName, setProjectName] = useState(project.name)
  const [renamed, setRenamed] = useState(false)

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Topbar */}
      <div className="px-7 py-3 shrink-0 border-b border-[var(--fleet-border)]">
        <button
          onClick={onClose}
          className="text-[var(--fleet-text-secondary)] hover:text-[var(--fleet-text-primary)] transition-colors text-[12.5px] cursor-pointer bg-transparent border-none font-inherit"
        >
          ← Back to {project.name}
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sub-nav */}
        <div className="w-[164px] min-w-[164px] shrink-0 border-r border-[var(--fleet-border)] py-2">
          {(["general", "members"] as const).map((s) => (
            <NavigationItem key={s} isActive={section === s} onClick={() => onSectionChange(s)}>
              <NavigationItem.Text>{s === "general" ? "General" : "Members"}</NavigationItem.Text>
            </NavigationItem>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-8 max-w-2xl">
            {section === "general" ? (
              <>
                <Typography variant="header-3-semibold" className="mb-6">General</Typography>

                {/* Project name */}
                <div className="mb-5">
                  <Typography variant="medium" as="label" className="block mb-1.5" style={{ color: "var(--fleet-text-secondary)" }}>
                    Project name
                  </Typography>
                  <div className="flex items-center gap-2">
                    <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="flex-1" />
                    <Button variant="primary" onClick={() => { setRenamed(true); setTimeout(() => setRenamed(false), 1500) }}>
                      {renamed ? "Renamed ✓" : "Rename"}
                    </Button>
                  </div>
                </div>

                {/* Repositories */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="medium" style={{ color: "var(--fleet-text-secondary)" }}>Repositories</Typography>
                    <button className="text-xs text-[var(--fleet-text-disabled)] hover:text-[var(--fleet-text-secondary)] cursor-pointer bg-transparent border-none">Edit</button>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {project.repos.map((r) => (
                      <div key={r} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--fleet-radius-xs)] bg-[rgba(255,255,255,0.03)]">
                        <Icon fleet="vcs" size="sm" />
                        <Typography variant="medium" style={{ color: "var(--fleet-text-secondary)" }}>{r}</Typography>
                      </div>
                    ))}
                    {project.repos.length === 0 && (
                      <Typography variant="medium" style={{ color: "var(--fleet-text-disabled)" }}>No repositories connected</Typography>
                    )}
                  </div>
                </div>

                {/* Access */}
                <div className="mb-5">
                  <Typography variant="medium" as="label" className="block mb-1.5" style={{ color: "var(--fleet-text-secondary)" }}>Access</Typography>
                  <div className="border border-[var(--fleet-border)] rounded-md">
                    {[
                      { title: "Default task visibility", desc: "Controls who can see task details", value: "Visible" },
                      { title: "Edit automations", desc: "Who can create or modify automations", value: "Admins" },
                      { title: "Steer automation runs", desc: "Who can provide input to running automations", value: "Any member" },
                    ].map((row, i, arr) => (
                      <div key={row.title} className={`flex items-center gap-5 p-4 ${i < arr.length - 1 ? "border-b border-[var(--fleet-border)]" : ""}`}>
                        <div className="flex-1">
                          <Typography variant="default-semibold" className="mb-0.5">{row.title}</Typography>
                          <Typography variant="medium" style={{ color: "var(--fleet-text-secondary)" }}>{row.desc}</Typography>
                        </div>
                        <Button variant="secondary">{row.value} ▾</Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="mt-9 pt-5 border-t border-[var(--fleet-border)]">
                  <Typography variant="medium" className="mb-3.5" style={{ color: "var(--fleet-text-disabled)", fontWeight: 500 }}>
                    Danger zone
                  </Typography>
                  {[
                    { title: "Archive this project", sub: "Hide from sidebar and search. Can be restored later.", btn: "Archive", variant: "secondary" as const },
                    { title: "Delete this project", sub: "Permanently remove the project and all its data.", btn: "Delete", variant: "dangerous" as const },
                  ].map((row) => (
                    <div key={row.title} className="flex items-center justify-between gap-5 py-3 border-b border-[var(--fleet-separator-default)] last:border-b-0">
                      <div>
                        <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>{row.title}</Typography>
                        <Typography variant="medium" style={{ color: "var(--fleet-text-disabled)", marginTop: 2, fontSize: 11.5 }}>{row.sub}</Typography>
                      </div>
                      <Button variant={row.variant}>{row.btn}</Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="header-3-semibold">Members</Typography>
                  <Button variant="primary">Invite</Button>
                </div>
                {project.members.map((m) => (
                  <div key={m.name} className="grid grid-cols-[1fr_80px_32px] items-center py-1 px-1.5 rounded-[4px] hover:bg-[rgba(255,255,255,0.09)] transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={m.name} size={28} />
                      <Typography variant="default">{m.name}</Typography>
                    </div>
                    <Typography variant="medium" style={{ color: "var(--fleet-text-disabled)" }}>
                      {m.role === "admin" ? "Admin" : "Member"}
                    </Typography>
                    <div className="flex justify-end">
                      {m.role !== "admin" && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Menu
                            trigger={<Button variant="ghost" size="icon"><Icon fleet="more" size="sm" /></Button>}
                            items={[
                              { type: "action", name: "Change role", callback: () => {} },
                              { type: "separator" },
                              { type: "action", name: "Remove", variant: "destructive", callback: () => {} },
                            ] as FleetMenuItem[]}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

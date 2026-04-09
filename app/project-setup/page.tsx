"use client"

import React, { useCallback, useEffect, useReducer, useRef, useState } from "react"
import {
  AppToolbar,
  Typography,
  Icon,
  Button,
  TextInput,
  Textarea,
  Checkbox,
  Banner,
  WorkflowStep,
  FleetDialog,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  WebAppLayout,
  WebSidebar,
  SelectionCard,
  AiMessage,
  UserMessage,
  SystemMessage,
  ProgressMessage,
  ChatIsland,
  IslandWithTabs,
  TabBar,
  TabContentArea,
  QuestionWidget,
  InputQuestionWidget,
  List,
  ListItem,
  AirSelect,
  type ProgressSubstepStatus,
  type ChatMessage as UIChatMessage,
} from "@/components/ui"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

// ============================================================================
// Types
// ============================================================================

type SetupState =
  | "WELCOME"
  | "RUN_ANALYSIS"
  | "RUN_SETUP_ATTEMPT"
  | "BLOCKED_NPM_TOKEN"
  | "BLOCKED_DATABASE_URL"
  | "DATABASE_URL_ACKED"
  | "TESTS_PASSED"
  | "COMPLETION_ANNOUNCED"
  | "CAPTURING_CONFIG"
  | "CONFIG_CAPTURED"
  | "ENV_CONFIG_READY"
  | "GENERATE_CONFIG"
  | "REPORT_RESULT"
  | "COMPLETION_ACTIONS"
  | "AGENT_OPT_STARTING"
  | "AGENT_OPT_ANALYZING"
  | "AGENT_OPT_REPORT_READY"
  | "AGENT_OPT_APPLYING"
  | "AGENT_OPT_COMPLETE"

type StepStatus = "pending" | "running" | "success" | "fail" | "skipped"
type ActivityLineStatus = "pending" | "running" | "success" | "blocked" | "skipped"
type ValidationLevel = "FULL" | "PARTIAL"
type SecretStatus = "provided" | "missing" | "not_required"
type MessageRole = "agent" | "user" | "system"

interface ActivityLine {
  label: string
  status?: ActivityLineStatus
  id?: string
}

interface ChatMessage {
  id: string
  role: MessageRole
  title?: string
  text: string
  timestamp: number
  card?: CardPayload
}

interface SetupStep {
  id: string
  label: string
  status: StepStatus
  logHint?: string
}

interface SecretRequestCardType {
  kind: "secret_request"
  secretKey: "DATABASE_URL" | "NPM_TOKEN"
  description: string
  placeholder: string
  primaryLabel: string
  secondaryLabel: string
  onSecondary?: "skip_tests" | "stop_setup"
}

interface ResultCardType {
  kind: "result"
  validationLevel: ValidationLevel
  steps: { label: string; done: boolean }[]
}

interface NextStepsCardType {
  kind: "next_steps"
  createPrLabel: string
  continueDisabled: boolean
  continueTooltip: string
}

interface OptimizationReportCardType {
  kind: "optimization_report"
  autoFixCount: number
  recommendationCount: number
  appliedCount: number
}

type CardPayload =
  | { kind: "start_button" }
  | { kind: "setup_run"; steps: SetupStep[] }
  | SecretRequestCardType
  | { kind: "config_proposal"; runtime: string; install: string; build: string; test: string; secrets: string[]; files: string[]; expanded: boolean; generating: boolean }
  | ResultCardType
  | NextStepsCardType
  | { kind: "pr_created"; prTitle: string }
  | OptimizationReportCardType
  | { kind: "agent_opt_complete" }

interface AppState {
  state: SetupState
  simulateNpmTokenFailure: boolean
  messages: ChatMessage[]
  setupSteps: SetupStep[]
  setupRunSnapshot: SetupStep[] | null
  activityTimeline: ActivityLine[]
  secrets: { NPM_TOKEN: SecretStatus; DATABASE_URL: SecretStatus }
  secretValues: Record<string, string>
  installOutcome: StepStatus
  buildOutcome: StepStatus
  testOutcome: StepStatus
  configGenerated: boolean
  validationLevel: ValidationLevel | null
  detailsPanelOpen: boolean
  prModalOpen: boolean
  prCreated: boolean
  agentThinking: boolean
  lastRunTimestamp: number | null
  envConfigChoice: "continue" | "create_pr" | null
  captureConfigLines: ActivityLine[]
  optimizationAnalysisLines: ActivityLine[]
  optimizationApplyingLines: ActivityLine[]
  optimizationReportVisible: boolean
  optimizationChoice: "apply" | "skip" | null
  optimizationApplied: boolean
  optimizationPanelOpen: boolean
}

interface OptimizationItem {
  id: string
  type: "auto-fix" | "recommendation"
  title: string
  oneLine: string
  detected: string
  willDo?: string
  did?: string
  why?: string
  suggestedNextStep?: string
  files: string[]
  status: "ready" | "applied"
}

// ============================================================================
// Flow constants & helpers
// ============================================================================

let messageId = 0
function nextId(): string { return `msg-${++messageId}` }

function createInitialState(simulateNpmTokenFailure: boolean): AppState {
  return {
    state: "WELCOME", simulateNpmTokenFailure,
    messages: [],
    setupSteps: [
      { id: "env", label: "Build environment", status: "pending", logHint: "Building container…" },
      { id: "install", label: "Install dependencies", status: "pending", logHint: "Running npm ci…" },
      { id: "build", label: "Run build", status: "pending", logHint: "Running npm run build…" },
      { id: "test", label: "Validate test command", status: "pending", logHint: "Running npm test…" },
    ],
    setupRunSnapshot: null, activityTimeline: [],
    secrets: { NPM_TOKEN: simulateNpmTokenFailure ? "missing" : "not_required", DATABASE_URL: "missing" },
    secretValues: {}, installOutcome: "pending", buildOutcome: "pending", testOutcome: "pending",
    configGenerated: false, validationLevel: null, detailsPanelOpen: false, prModalOpen: false,
    prCreated: false, agentThinking: false, lastRunTimestamp: null, envConfigChoice: null,
    captureConfigLines: [], optimizationAnalysisLines: [], optimizationApplyingLines: [],
    optimizationReportVisible: false, optimizationChoice: null, optimizationApplied: false, optimizationPanelOpen: false,
  }
}

function getWelcomeMessage(): ChatMessage {
  return { id: nextId(), role: "agent", title: "Project setup", text: "I'll prepare this repository so cloud agents can run install, build, and test commands reliably.\nI'll validate that those commands work in a clean environment and only ask for input if something blocks progress.", timestamp: Date.now(), card: { kind: "start_button" } }
}
function getUserMessage(label: string): ChatMessage { return { id: nextId(), role: "user", text: label, timestamp: Date.now() } }
function getSystemMessage(text: string): ChatMessage { return { id: nextId(), role: "system", text, timestamp: Date.now() } }
function getAgentMessage(title: string, text: string, card?: CardPayload): ChatMessage { return { id: nextId(), role: "agent", title, text, timestamp: Date.now(), card } }

function maskDatabaseUrlForDisplay(value: string): string {
  if (value.startsWith("postgres://") || value.startsWith("postgresql://")) return "postgres://…"
  return "****"
}

function cloneSteps(steps: SetupStep[], updates: Partial<SetupStep>[]): SetupStep[] {
  const byId = new Map(steps.map((s) => [s.id, { ...s }]))
  for (const u of updates) { const id = u.id; if (id && byId.has(id)) Object.assign(byId.get(id)!, u) }
  return Array.from(byId.values())
}

function delay(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)) }

const TIMINGS = {
  analysisLine: 800, buildEnv: 750, install: 1800, build: 950, test: 1200,
  testRetry: 600, configWrite: 600, resumeAfterAckMs: 750, testRunDurationMs: 2000,
  completionPauseMs: 500, configCaptureNarrativeDelayMs: 650, configCaptureDurationMs: 2000,
  configConfirmationDelayMs: 750,
} as const

const CAPTURE_CONFIG_ACTIVITY_LINES = [
  "Detecting runtime and package manager",
  "Recording install, build, and test commands",
  "Identifying required secrets and files",
] as const

const CAPTURE_CONFIG_DURATION_SECONDS = Math.round(TIMINGS.configCaptureDurationMs / 1000)

const ANALYSIS_LINES = [
  "Analyzing repository structure…",
  "Detecting runtime and package manager…",
  "Reading scripts and configuration…",
  "Checking for existing environment setup…",
  "Preparing a setup run plan…",
] as const

const ANALYSIS_DURATION_SECONDS = Math.round((ANALYSIS_LINES.length * TIMINGS.analysisLine) / 1000)
const SETUP_RUN_DURATION_SECONDS = Math.round((TIMINGS.buildEnv + TIMINGS.install + TIMINGS.build + TIMINGS.test) / 1000)
const RESUMED_RUN_DURATION_SECONDS = Math.round((TIMINGS.resumeAfterAckMs + TIMINGS.testRunDurationMs) / 1000)
const SETUP_DURATION_BEFORE_INSTALL_FAILURE_SECONDS = Math.round((TIMINGS.buildEnv + TIMINGS.install) / 1000)

const ACTIVITY_ANALYSIS_LABELS = [
  "Reading repository structure",
  "Detecting runtime and package manager",
  "Inspecting scripts and configuration",
  "Checking for existing environment setup",
  "Preparing a setup plan",
] as const

const SETUP_STEP_SPEC = [
  { id: "env", timingKey: "buildEnv" as const, systemMessage: "Building environment…", activityLabel: "Building environment" },
  { id: "install", timingKey: "install" as const, systemMessage: "Installing dependencies…", activityLabel: "Installing dependencies (npm ci)" },
  { id: "build", timingKey: "build" as const, systemMessage: "Running build…", activityLabel: "Running build (npm run build)" },
  { id: "test", timingKey: "test" as const, systemMessage: "Validating test command…", activityLabel: "Validating test command (npm test)" },
]

function getResumedRunSteps(testStatus: "running" | "success"): SetupStep[] {
  return [{ id: "test", label: "Validate test command", status: testStatus, logHint: "Running npm test…" }]
}

function stepStatusToActivityStatus(s: StepStatus): ActivityLineStatus {
  if (s === "fail") return "blocked"
  return s as ActivityLineStatus
}

const OPTIMIZATION_ANALYSIS_LINES = [
  "Scanning repo structure and docs",
  "Detecting existing agent guidance",
  "Detecting install, build, test, and lint commands",
  "Checking verification workflow",
  "Checking PR and issue templates",
  "Checking linting, README, tests, and lockfiles",
] as const

const OPTIMIZATION_APPLYING_LINES = [
  "Creating or updating AGENTS.md",
  "Generating docs/agent/commands.md",
  "Creating scripts/verify.sh",
  "Creating PR and issue templates",
  "Cross-linking docs and templates",
] as const

const OPTIMIZATION_TIMINGS = {
  analysisStepMin: 700, analysisStepMax: 1200,
  applyStepMin: 900, applyStepMax: 1600,
  afterAnalysisDelayMs: 300, afterApplyChoiceDelayMs: 450, afterApplyingDelayMs: 1000,
} as const

const OPTIMIZATION_ANALYSIS_DURATION_SECONDS = Math.round(
  (OPTIMIZATION_ANALYSIS_LINES.length * ((OPTIMIZATION_TIMINGS.analysisStepMin + OPTIMIZATION_TIMINGS.analysisStepMax) / 2)) / 1000
)
const OPTIMIZATION_APPLYING_DURATION_SECONDS = Math.round(
  (OPTIMIZATION_APPLYING_LINES.length * ((OPTIMIZATION_TIMINGS.applyStepMin + OPTIMIZATION_TIMINGS.applyStepMax) / 2)) / 1000
)

const OPTIMIZATION_ITEMS: OptimizationItem[] = [
  { id: "agents-md", type: "auto-fix", title: "AGENTS.md governance", oneLine: "Add a standard governance file with roles, stop conditions, and definition of done.", detected: "AGENTS.md is missing in the repo root.", willDo: "Create AGENTS.md with a generic template covering roles, workflow, definition of done, stop conditions, and escalation.", did: "Created AGENTS.md with roles, workflow, definition of done, stop conditions, and escalation protocol.", files: ["AGENTS.md"], status: "ready" },
  { id: "commands-doc", type: "auto-fix", title: "Document project commands", oneLine: "Create docs/agent/commands.md from existing scripts and config.", detected: "No canonical commands documentation found.", willDo: "Create docs/agent/commands.md by extracting install, build, test, lint, and run commands from repo configuration.", did: "Created docs/agent/commands.md with detected install, build, test, lint, and run commands and a reference to verify.", files: ["docs/agent/commands.md"], status: "ready" },
  { id: "verify-script", type: "auto-fix", title: "Add a verify entrypoint", oneLine: "Create scripts/verify.sh to run lint, tests, and build using existing commands.", detected: "No single verify command found.", willDo: "Create scripts/verify.sh that runs lint (if available), then tests, then build using detected commands.", did: "Created scripts/verify.sh that chains lint (if available), tests, and build. Made it executable and referenced it in commands documentation.", files: ["scripts/verify.sh"], status: "ready" },
  { id: "pr-templates", type: "auto-fix", title: "PR and issue templates", oneLine: "Add templates to capture context, verification, and rollback in PRs and issues.", detected: "No pull request template found. Issue templates are missing or incomplete.", willDo: "Create .github/pull_request_template.md and add basic issue templates under .github/ISSUE_TEMPLATE/.", did: "Created a pull request template with change summary, verification checklist, risk, and rollback. Added basic bug and feature issue templates.", files: [".github/pull_request_template.md", ".github/ISSUE_TEMPLATE/bug_report.md", ".github/ISSUE_TEMPLATE/feature_request.md"], status: "ready" },
  { id: "linting-config", type: "recommendation", title: "Linting configuration", oneLine: "Ensure a linter is configured and enforced.", detected: "Linting configuration could not be validated as enforced for this repo.", why: "Agents rely on deterministic style checks to avoid noisy diffs and review churn.", suggestedNextStep: "Add or confirm a linter command and include it in scripts/verify.sh once established.", files: [], status: "ready" },
  { id: "readme-setup", type: "recommendation", title: "README setup", oneLine: "Document install, run, and test steps for humans and agents.", detected: "README does not clearly document a full setup and verification flow.", why: "A reliable setup guide reduces trial-and-error and speeds up agent onboarding.", suggestedNextStep: "Add a setup section to README that references docs/agent/commands.md and scripts/verify.sh.", files: [], status: "ready" },
  { id: "test-suite", type: "recommendation", title: "Test suite coverage", oneLine: "Ensure a test suite exists and runs reliably.", detected: "Tests are present but may require environment configuration such as DATABASE_URL.", why: "Agents need a repeatable validation command to confirm work is safe to merge.", suggestedNextStep: "Document required env vars in README and provide test setup guidance.", files: [], status: "ready" },
  { id: "dependencies-pinned", type: "recommendation", title: "Dependencies pinned", oneLine: "Use lockfiles for reproducible installs.", detected: "Dependency pinning cannot be guaranteed for all environments from repo metadata alone.", why: "Pinned dependencies reduce flaky installs in clean cloud environments.", suggestedNextStep: "Ensure a lockfile is committed and update commands documentation to use it (for example, npm ci).", files: [], status: "ready" },
]

// ============================================================================
// Reducer
// ============================================================================

type SetupAction =
  | { type: "ADD_MESSAGES"; payload: ChatMessage[] }
  | { type: "START_ANALYSIS" }
  | { type: "ADD_ANALYSIS_LINE"; payload: { systemMessage: string; activityLabel: string } }
  | { type: "ADD_PLAN_MESSAGE"; payload: { planMsg: ChatMessage } }
  | { type: "START_SETUP_RUN"; payload: { setupRunMsg: ChatMessage } }
  | { type: "ADD_SYSTEM_MESSAGE"; payload: string }
  | { type: "UPDATE_SETUP_STEP"; payload: { stepId: string; status: "success" | "running" }; nextStepId?: string; nextStatus?: "running" }
  | { type: "SET_OUTCOMES"; payload: { installOutcome?: "success" | "fail"; buildOutcome?: "success"; testOutcome?: "success" | "fail" } }
  | { type: "BLOCK_NPM"; payload: { blockMsg: ChatMessage } }
  | { type: "BLOCK_DATABASE_URL"; payload: { configMsg: ChatMessage } }
  | { type: "SET_SECRET"; payload: { key: "DATABASE_URL" | "NPM_TOKEN"; value: string }; messages: ChatMessage[] }
  | { type: "SET_TEST_RUNNING" }
  | { type: "SET_TEST_SUCCESS"; payload: { envMsg: ChatMessage } }
  | { type: "SET_TESTS_COMPLETE" }
  | { type: "ADD_COMPLETION_MESSAGE" }
  | { type: "ADD_CONFIG_CAPTURE_NARRATIVE" }
  | { type: "ADD_CAPTURE_CONFIG_LINE"; payload: string }
  | { type: "CONFIG_CAPTURE_COMPLETE" }
  | { type: "ADD_CONFIG_CONFIRMATION_NARRATIVE" }
  | { type: "SHOW_ENV_CONFIG_MILESTONE" }
  | { type: "ADD_TRANSITION_AND_CONFIG"; payload: { envMsg: ChatMessage } }
  | { type: "SET_INSTALL_RUNNING" }
  | { type: "SKIP_TESTS"; payload: { userMsg: ChatMessage; agentMsg: ChatMessage } }
  | { type: "CONFIG_GENERATING" }
  | { type: "CONFIG_GENERATED"; payload: { resultCard: ChatMessage; nextMsg: ChatMessage } }
  | { type: "CONTINUE_TO_AGENT_OPTIMIZATION"; payload: { resultCard: ChatMessage; nextMsg: ChatMessage } }
  | { type: "ENV_CONFIG_CHOICE"; payload: "continue" | "create_pr" }
  | { type: "RESET"; payload: AppState }
  | { type: "SET_DETAILS_PANEL_OPEN"; payload: boolean }
  | { type: "SET_PR_MODAL_OPEN"; payload: boolean }
  | { type: "CREATE_PR"; payload: ChatMessage }
  | { type: "SET_CONFIG_CARD_EXPANDED"; payload: boolean }
  | { type: "START_AGENT_OPTIMIZATION" }
  | { type: "ADD_OPTIMIZATION_ANALYSIS_LINE"; payload: string }
  | { type: "COMPLETE_OPTIMIZATION_ANALYSIS" }
  | { type: "SHOW_OPTIMIZATION_REPORT"; payload: ChatMessage }
  | { type: "OPTIMIZATION_CHOICE"; payload: "apply" | "skip" }
  | { type: "ADD_OPTIMIZATION_APPLYING_LINE"; payload: string }
  | { type: "COMPLETE_OPTIMIZATION_APPLYING" }
  | { type: "SHOW_AGENT_OPT_COMPLETE"; payload: ChatMessage }
  | { type: "SET_OPTIMIZATION_PANEL_OPEN"; payload: boolean }

function setupReducer(state: AppState, action: SetupAction): AppState {
  switch (action.type) {
    case "ADD_MESSAGES": return { ...state, messages: [...state.messages, ...action.payload] }
    case "START_ANALYSIS": return { ...state, state: "RUN_ANALYSIS", agentThinking: true }
    case "ADD_ANALYSIS_LINE": {
      const { systemMessage, activityLabel } = action.payload
      return { ...state, messages: [...state.messages, getSystemMessage(systemMessage)], activityTimeline: [...state.activityTimeline, { label: activityLabel, status: "success" }] }
    }
    case "ADD_PLAN_MESSAGE": return { ...state, messages: [...state.messages, action.payload.planMsg], agentThinking: false }
    case "START_SETUP_RUN": {
      const stepsWithEnvRunning = cloneSteps(state.setupSteps, [{ id: "env", status: "running" }])
      return { ...state, messages: [...state.messages, action.payload.setupRunMsg], state: "RUN_SETUP_ATTEMPT", setupSteps: stepsWithEnvRunning }
    }
    case "ADD_SYSTEM_MESSAGE": return { ...state, messages: [...state.messages, getSystemMessage(action.payload)] }
    case "UPDATE_SETUP_STEP": {
      const updates: { id: string; status: "success" | "running" }[] = [{ id: action.payload.stepId, status: action.payload.status }]
      if (action.nextStepId && action.nextStatus) updates.push({ id: action.nextStepId, status: action.nextStatus })
      return { ...state, setupSteps: cloneSteps(state.setupSteps, updates) }
    }
    case "SET_OUTCOMES": return { ...state, ...action.payload }
    case "BLOCK_NPM": return { ...state, setupSteps: cloneSteps(state.setupSteps, [{ id: "env", status: "success" }, { id: "install", status: "fail" }]), installOutcome: "fail", state: "BLOCKED_NPM_TOKEN", agentThinking: false, messages: [...state.messages, action.payload.blockMsg] }
    case "BLOCK_DATABASE_URL": {
      const stepsWithTestFail = cloneSteps(state.setupSteps, [{ id: "test", status: "fail" }])
      return { ...state, setupSteps: stepsWithTestFail, setupRunSnapshot: stepsWithTestFail.map((s) => ({ ...s })), testOutcome: "fail", state: "BLOCKED_DATABASE_URL", agentThinking: false, messages: [...state.messages, action.payload.configMsg] }
    }
    case "SET_SECRET": {
      const next = { ...state, secretValues: { ...state.secretValues, [action.payload.key]: action.payload.value }, secrets: { ...state.secrets, [action.payload.key]: "provided" as const }, messages: [...state.messages, ...action.messages] }
      if (action.payload.key === "DATABASE_URL") return { ...next, state: "DATABASE_URL_ACKED" }
      return next
    }
    case "SET_TEST_RUNNING": return { ...state, state: "RUN_SETUP_ATTEMPT", setupSteps: getResumedRunSteps("running"), agentThinking: true, messages: [...state.messages, getSystemMessage("Validating test command…")] }
    case "SET_TEST_SUCCESS": return { ...state, setupSteps: cloneSteps(state.setupSteps, [{ id: "test", status: "success" }]), testOutcome: "success", state: "GENERATE_CONFIG", agentThinking: false, validationLevel: "FULL", messages: [...state.messages, action.payload.envMsg] }
    case "SET_TESTS_COMPLETE": return { ...state, setupSteps: getResumedRunSteps("success"), state: "TESTS_PASSED", agentThinking: false }
    case "ADD_COMPLETION_MESSAGE": return { ...state, state: "COMPLETION_ANNOUNCED", messages: [...state.messages, getAgentMessage("", "The setup run completed successfully. Install, build, and test command were validated in a clean environment.")] }
    case "ADD_CONFIG_CAPTURE_NARRATIVE": return { ...state, state: "CAPTURING_CONFIG", messages: [...state.messages, getSystemMessage("That means this project can be run reliably by cloud agents. I'm capturing a reusable environment configuration based on this setup.")] }
    case "ADD_CAPTURE_CONFIG_LINE": return { ...state, state: "CAPTURING_CONFIG", captureConfigLines: [...state.captureConfigLines, { label: action.payload, status: "success" as const }] }
    case "CONFIG_CAPTURE_COMPLETE": return { ...state, state: "CONFIG_CAPTURED" }
    case "ADD_CONFIG_CONFIRMATION_NARRATIVE": return { ...state, messages: [...state.messages, getSystemMessage("I've captured a reusable environment configuration. Cloud agents can now install dependencies, build the project, and run the test command to validate their work using this setup.")] }
    case "SHOW_ENV_CONFIG_MILESTONE": return { ...state, state: "ENV_CONFIG_READY", testOutcome: "success", validationLevel: "FULL" }
    case "ADD_TRANSITION_AND_CONFIG": return { ...state, state: "GENERATE_CONFIG", testOutcome: "success", validationLevel: "FULL", messages: [...state.messages, action.payload.envMsg] }
    case "SET_INSTALL_RUNNING": return { ...state, setupSteps: cloneSteps(state.setupSteps, [{ id: "install", status: "running" }]), agentThinking: true, messages: [...state.messages, getSystemMessage("Installing dependencies…")] }
    case "SKIP_TESTS": {
      const confirmationNarrative = getSystemMessage("I've captured a reusable environment configuration. Cloud agents can now install dependencies, build the project, and run the test command to validate their work using this setup.")
      return { ...state, messages: [...state.messages, action.payload.userMsg, action.payload.agentMsg, confirmationNarrative], state: "ENV_CONFIG_READY", testOutcome: "skipped", validationLevel: "PARTIAL", setupSteps: cloneSteps(state.setupSteps, [{ id: "test", status: "skipped" }]) }
    }
    case "CONFIG_GENERATING": {
      const last = state.messages[state.messages.length - 1]
      const card = last?.card
      if (last && card?.kind === "config_proposal") return { ...state, messages: [...state.messages.slice(0, -1), { ...last, card: { ...card, generating: true } }] }
      return state
    }
    case "CONFIG_GENERATED": {
      const last2 = state.messages[state.messages.length - 1]
      const lastCard = last2?.card
      const updatedLast = lastCard?.kind === "config_proposal" && last2 ? { ...last2, card: { ...lastCard, generating: false } } : last2!
      return { ...state, configGenerated: true, state: "COMPLETION_ACTIONS", lastRunTimestamp: Date.now(), messages: [...state.messages.slice(0, -1), updatedLast, getAgentMessage("Configuration generated.", ""), action.payload.resultCard, action.payload.nextMsg] }
    }
    case "CONTINUE_TO_AGENT_OPTIMIZATION": return { ...state, configGenerated: true, state: "COMPLETION_ACTIONS", lastRunTimestamp: Date.now(), messages: [...state.messages, action.payload.resultCard, action.payload.nextMsg] }
    case "ENV_CONFIG_CHOICE": {
      if (action.payload === "create_pr") return { ...state, envConfigChoice: "create_pr", prModalOpen: true, messages: [...state.messages, getUserMessage("Create pull request")] }
      return { ...state, envConfigChoice: "continue", state: "AGENT_OPT_STARTING" }
    }
    case "RESET": return action.payload
    case "SET_DETAILS_PANEL_OPEN": return { ...state, detailsPanelOpen: action.payload }
    case "SET_PR_MODAL_OPEN": return { ...state, prModalOpen: action.payload }
    case "CREATE_PR": return { ...state, prModalOpen: false, prCreated: true, messages: [...state.messages, action.payload] }
    case "SET_CONFIG_CARD_EXPANDED": {
      const last3 = state.messages[state.messages.length - 1]
      if (last3?.card?.kind === "config_proposal") return { ...state, messages: [...state.messages.slice(0, -1), { ...last3, card: { ...last3.card, expanded: action.payload } }] }
      return state
    }
    case "START_AGENT_OPTIMIZATION": return { ...state, state: "AGENT_OPT_STARTING", envConfigChoice: "continue", messages: [...state.messages, getUserMessage("Continue to agent optimization"), getSystemMessage("I will analyze this repository for agent optimization best practices and generate an Optimization report. I will only apply changes that are safe to auto-fix.")] }
    case "ADD_OPTIMIZATION_ANALYSIS_LINE": return { ...state, state: "AGENT_OPT_ANALYZING", optimizationAnalysisLines: [...state.optimizationAnalysisLines, { label: action.payload, status: "success" as const }] }
    case "COMPLETE_OPTIMIZATION_ANALYSIS": return { ...state, state: "AGENT_OPT_REPORT_READY" }
    case "SHOW_OPTIMIZATION_REPORT": return { ...state, optimizationReportVisible: true, messages: [...state.messages, getSystemMessage("Analysis complete. I found 4 auto-fix improvements and 4 recommendations. Review the Optimization report, then choose whether to apply the auto-fixes."), action.payload] }
    case "OPTIMIZATION_CHOICE": {
      if (action.payload === "skip") return { ...state, optimizationChoice: "skip", messages: [...state.messages, getUserMessage("Skip auto-fixes"), getSystemMessage("Understood. I will not change the repo. You can still use the Optimization report as guidance and create a pull request for environment configuration.")] }
      return { ...state, optimizationChoice: "apply", messages: [...state.messages, getUserMessage("Apply auto-fixes"), getSystemMessage("Got it. I will apply the 4 auto-fix improvements now and keep recommendations as guidance only.")] }
    }
    case "ADD_OPTIMIZATION_APPLYING_LINE": return { ...state, state: "AGENT_OPT_APPLYING", optimizationApplyingLines: [...state.optimizationApplyingLines, { label: action.payload, status: "success" as const }] }
    case "COMPLETE_OPTIMIZATION_APPLYING": return { ...state, optimizationApplied: true, messages: [...state.messages, getSystemMessage("Auto-fixes applied. I created or updated 4 files to improve agent reliability and verification.")] }
    case "SHOW_AGENT_OPT_COMPLETE": return { ...state, state: "AGENT_OPT_COMPLETE", messages: [...state.messages, action.payload] }
    case "SET_OPTIMIZATION_PANEL_OPEN": return { ...state, optimizationPanelOpen: action.payload }
    default: return state
  }
}

// ============================================================================
// Simulation functions
// ============================================================================

async function runSimulation(dispatch: React.Dispatch<SetupAction>, simulateNpmFail: boolean): Promise<void> {
  dispatch({ type: "START_ANALYSIS" })
  for (let i = 0; i < ANALYSIS_LINES.length; i++) {
    dispatch({ type: "ADD_ANALYSIS_LINE", payload: { systemMessage: ANALYSIS_LINES[i]!, activityLabel: ACTIVITY_ANALYSIS_LABELS[i]! } })
    await delay(TIMINGS.analysisLine)
  }
  const planMsg = getAgentMessage("Initial plan", "I found a Node.js project with a lockfile.\nI'll validate:\n• Install: npm ci\n• Build: npm run build\n• Test command: npm test\n\nNext I'll run the setup to confirm these commands work in a clean environment.")
  dispatch({ type: "ADD_PLAN_MESSAGE", payload: { planMsg } })
  await delay(500)

  const stepsWithEnvRunning: SetupStep[] = [
    { id: "env", label: "Build environment", status: "running", logHint: "Building container…" },
    { id: "install", label: "Install dependencies", status: "pending", logHint: "Running npm ci…" },
    { id: "build", label: "Run build", status: "pending", logHint: "Running npm run build…" },
    { id: "test", label: "Validate test command", status: "pending", logHint: "Running npm test…" },
  ]
  const setupRunMsg = getAgentMessage("Setup run", "", { kind: "setup_run", steps: stepsWithEnvRunning })
  dispatch({ type: "START_SETUP_RUN", payload: { setupRunMsg } })

  for (let i = 0; i < SETUP_STEP_SPEC.length; i++) {
    const step = SETUP_STEP_SPEC[i]!
    const timingMs = TIMINGS[step.timingKey]
    dispatch({ type: "ADD_SYSTEM_MESSAGE", payload: step.systemMessage })
    await delay(timingMs)

    if (step.id === "install" && simulateNpmFail) {
      dispatch({ type: "BLOCK_NPM", payload: { blockMsg: getAgentMessage("Access required", "Dependency install failed due to private packages.\nPlease provide NPM_TOKEN so I can install dependencies and continue.", { kind: "secret_request", secretKey: "NPM_TOKEN", description: "Token for private npm registry. Stored securely.", placeholder: "npm_xxxxxxxx", primaryLabel: "Add NPM_TOKEN", secondaryLabel: "Stop setup", onSecondary: "stop_setup" }) } })
      return
    }
    if (step.id === "test") {
      dispatch({ type: "BLOCK_DATABASE_URL", payload: { configMsg: getAgentMessage("Configuration required", "The test command requires a database connection (e.g. DATABASE_URL). Add it so I can run the test command and confirm the setup allows agents to validate their work.", { kind: "secret_request", secretKey: "DATABASE_URL", description: "Connection string used when running the test command. Stored securely and never committed.", placeholder: "postgres://user:pass@host:5432/db", primaryLabel: "Add DATABASE_URL", secondaryLabel: "Skip validating test command (not recommended)", onSecondary: "skip_tests" }) } })
      return
    }
    const nextStep = SETUP_STEP_SPEC[i + 1]!
    dispatch({ type: "UPDATE_SETUP_STEP", payload: { stepId: step.id, status: "success" }, nextStepId: nextStep.id, nextStatus: "running" })
    if (step.id === "install") dispatch({ type: "SET_OUTCOMES", payload: { installOutcome: "success" } })
    if (step.id === "build") dispatch({ type: "SET_OUTCOMES", payload: { buildOutcome: "success" } })
  }
}

async function runCaptureConfig(dispatch: React.Dispatch<SetupAction>): Promise<void> {
  for (const line of CAPTURE_CONFIG_ACTIVITY_LINES) {
    await delay(500 + Math.random() * 800)
    dispatch({ type: "ADD_CAPTURE_CONFIG_LINE", payload: line })
  }
  dispatch({ type: "CONFIG_CAPTURE_COMPLETE" })
}

async function runOptimizationAnalysis(dispatch: React.Dispatch<SetupAction>): Promise<void> {
  for (const line of OPTIMIZATION_ANALYSIS_LINES) {
    await delay(OPTIMIZATION_TIMINGS.analysisStepMin + Math.random() * (OPTIMIZATION_TIMINGS.analysisStepMax - OPTIMIZATION_TIMINGS.analysisStepMin))
    dispatch({ type: "ADD_OPTIMIZATION_ANALYSIS_LINE", payload: line })
  }
  dispatch({ type: "COMPLETE_OPTIMIZATION_ANALYSIS" })
  await delay(OPTIMIZATION_TIMINGS.afterAnalysisDelayMs)
  dispatch({ type: "SHOW_OPTIMIZATION_REPORT", payload: getAgentMessage("", "", { kind: "optimization_report", autoFixCount: 4, recommendationCount: 4, appliedCount: 0 }) })
}

async function runOptimizationApplying(dispatch: React.Dispatch<SetupAction>): Promise<void> {
  await delay(OPTIMIZATION_TIMINGS.afterApplyChoiceDelayMs)
  for (const line of OPTIMIZATION_APPLYING_LINES) {
    await delay(OPTIMIZATION_TIMINGS.applyStepMin + Math.random() * (OPTIMIZATION_TIMINGS.applyStepMax - OPTIMIZATION_TIMINGS.applyStepMin))
    dispatch({ type: "ADD_OPTIMIZATION_APPLYING_LINE", payload: line })
  }
  dispatch({ type: "COMPLETE_OPTIMIZATION_APPLYING" })
  await delay(OPTIMIZATION_TIMINGS.afterApplyingDelayMs)
  dispatch({ type: "SHOW_AGENT_OPT_COMPLETE", payload: getAgentMessage("", "", { kind: "agent_opt_complete" }) })
}

// ============================================================================
// useSetupFlow hook
// ============================================================================

function parseSimulateNpmToken(): boolean {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).get("npm_token") === "1"
}

function getInitialState(): AppState {
  const sim = parseSimulateNpmToken()
  const initial = createInitialState(sim)
  initial.messages = [getWelcomeMessage()]
  return initial
}

function useSetupFlow() {
  const [state, dispatch] = useReducer(setupReducer, undefined, getInitialState)
  const runningRef = useRef(false)

  const onStart = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true
    dispatch({ type: "ADD_MESSAGES", payload: [getUserMessage("Start environment setup")] })
    runSimulation(dispatch, state.simulateNpmTokenFailure).finally(() => { runningRef.current = false })
  }, [state.simulateNpmTokenFailure])

  const onAddSecret = useCallback((key: "DATABASE_URL" | "NPM_TOKEN", value: string) => {
    if (key === "DATABASE_URL") {
      dispatch({ type: "SET_SECRET", payload: { key, value }, messages: [getUserMessage(`Added DATABASE_URL: ${maskDatabaseUrlForDisplay(value)}`), getAgentMessage("", "Got it. I saved DATABASE_URL securely.\n\nI'll resume the setup and validate the test command.")] })
      delay(TIMINGS.resumeAfterAckMs).then(() => { dispatch({ type: "SET_TEST_RUNNING" }); return delay(TIMINGS.testRunDurationMs) }).then(() => { dispatch({ type: "SET_TESTS_COMPLETE" }); dispatch({ type: "ADD_COMPLETION_MESSAGE" }); return delay(TIMINGS.configCaptureNarrativeDelayMs) }).then(() => { dispatch({ type: "ADD_CONFIG_CAPTURE_NARRATIVE" }); return runCaptureConfig(dispatch) }).then(() => { dispatch({ type: "ADD_CONFIG_CONFIRMATION_NARRATIVE" }); return delay(TIMINGS.configConfirmationDelayMs) }).then(() => { dispatch({ type: "SHOW_ENV_CONFIG_MILESTONE" }) })
    } else {
      dispatch({ type: "SET_SECRET", payload: { key, value }, messages: [getAgentMessage("", "Saved NPM_TOKEN. Resuming install…")] })
      dispatch({ type: "SET_INSTALL_RUNNING" })
      delay(TIMINGS.install).then(() => { dispatch({ type: "UPDATE_SETUP_STEP", payload: { stepId: "install", status: "success" }, nextStepId: "build", nextStatus: "running" }); dispatch({ type: "SET_OUTCOMES", payload: { installOutcome: "success" } }); dispatch({ type: "ADD_SYSTEM_MESSAGE", payload: "Running build…" }); return delay(TIMINGS.build) }).then(() => { dispatch({ type: "UPDATE_SETUP_STEP", payload: { stepId: "build", status: "success" }, nextStepId: "test", nextStatus: "running" }); dispatch({ type: "SET_OUTCOMES", payload: { buildOutcome: "success" } }); dispatch({ type: "ADD_SYSTEM_MESSAGE", payload: "Validating test command…" }); return delay(TIMINGS.test) }).then(() => {
        dispatch({ type: "BLOCK_DATABASE_URL", payload: { configMsg: getAgentMessage("Configuration required", "The test command requires a database connection (e.g. DATABASE_URL). Add it so I can run the test command and confirm the setup allows agents to validate their work.", { kind: "secret_request", secretKey: "DATABASE_URL", description: "Connection string used when running the test command. Stored securely and never committed.", placeholder: "postgres://user:pass@host:5432/db", primaryLabel: "Add DATABASE_URL", secondaryLabel: "Skip validating test command (not recommended)", onSecondary: "skip_tests" }) } })
      })
    }
  }, [])

  const onSkipTests = useCallback(() => {
    dispatch({ type: "SKIP_TESTS", payload: { userMsg: getUserMessage("Skip validating test command"), agentMsg: getAgentMessage("", "OK. I will complete the setup without validating the test command. You can add DATABASE_URL later to validate it.") } })
  }, [])

  const onEnvConfigChoice = useCallback((choice: "continue" | "create_pr") => {
    if (choice === "create_pr") { dispatch({ type: "ENV_CONFIG_CHOICE", payload: choice }) } else { dispatch({ type: "START_AGENT_OPTIMIZATION" }); runOptimizationAnalysis(dispatch) }
  }, [])

  const onOptimizationChoice = useCallback((choice: "apply" | "skip") => {
    dispatch({ type: "OPTIMIZATION_CHOICE", payload: choice })
    if (choice === "apply") runOptimizationApplying(dispatch)
  }, [])

  const reset = useCallback(() => {
    const initial = createInitialState(parseSimulateNpmToken())
    initial.messages = [getWelcomeMessage()]
    dispatch({ type: "RESET", payload: initial })
  }, [])

  return {
    state, onStart, onAddSecret, onSkipTests, onEnvConfigChoice, onOptimizationChoice, reset,
    setDetailsPanelOpen: (open: boolean) => dispatch({ type: "SET_DETAILS_PANEL_OPEN", payload: open }),
    setPrModalOpen: (open: boolean) => dispatch({ type: "SET_PR_MODAL_OPEN", payload: open }),
    setOptimizationPanelOpen: (open: boolean) => dispatch({ type: "SET_OPTIMIZATION_PANEL_OPEN", payload: open }),
    onCreatePr: () => dispatch({ type: "CREATE_PR", payload: getAgentMessage("Pull request created", "Pull request created: Configure cloud environment for agent runs.\nNext: merge to enable this setup for the whole team.", { kind: "pr_created", prTitle: "Configure cloud environment for agent runs" }) }),
    setConfigCardExpanded: (expanded: boolean) => dispatch({ type: "SET_CONFIG_CARD_EXPANDED", payload: expanded }),
  }
}

// ============================================================================
// CSS for animations (injected via style tag)
// ============================================================================

const CUSTOM_CSS = `
@keyframes chat-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-chat-in {
  opacity: 0;
  animation: chat-fade-in 0.22s ease-out var(--chat-in-delay, 0s) forwards;
}
.animate-chat-in-delay-1 { --chat-in-delay: 0.1s; }
.animate-chat-in-delay-2 { --chat-in-delay: 0.2s; }
.animate-chat-in-delay-3 { --chat-in-delay: 0.3s; }
@keyframes slide-up-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
  animation: slide-up-in 0.25s ease-out forwards;
}
.recommended-card-glow {
  box-shadow: 0 0 0 1px rgb(59 130 246 / 0.3), 0 0 20px rgb(59 130 246 / 0.15);
}
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`

// ============================================================================
// Stream Text Effect
// ============================================================================

function StreamText({ text, speed = 20, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const words = text.split(/(\s+)/)
  const [visibleCount, setVisibleCount] = useState(0)
  const completeRef = useRef(false)

  useEffect(() => {
    if (visibleCount >= words.length) {
      if (!completeRef.current) { completeRef.current = true; onComplete?.() }
      return
    }
    const timer = setTimeout(() => {
      setVisibleCount((c) => Math.min(c + 2, words.length))
    }, speed)
    return () => clearTimeout(timer)
  }, [visibleCount, words.length, speed, onComplete])

  return (
    <Typography variant="default-chat" style={{ color: "var(--fleet-text-primary)" }}>
      {words.slice(0, visibleCount).join("")}
    </Typography>
  )
}

// ============================================================================
// Inline Sub-Components
// ============================================================================

const activityToSubstepStatus: Record<ActivityLineStatus, ProgressSubstepStatus> = {
  success: "success",
  running: "running",
  blocked: "error",
  skipped: "skipped",
  pending: "pending",
}

function ActivityBox({ title = "Activity", doneLabel, failedLabel, lines, summary, expanded: controlledExpanded, thinking, onToggle, collapsedSecondaryLine, failed = false }: {
  title?: string; doneLabel?: string; failedLabel?: string; lines: ActivityLine[]; summary: string; expanded?: boolean; thinking?: boolean; onToggle?: () => void; collapsedSecondaryLine?: string; failed?: boolean
}) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded
  const handleToggle = onToggle ?? (controlledExpanded === undefined ? () => setInternalExpanded((e) => !e) : undefined)
  const isEmpty = lines.length === 0 && !thinking
  if (isEmpty && !summary) return null

  const substeps = [
    ...lines.map(line => ({
      label: line.label,
      status: activityToSubstepStatus[line.status ?? "pending"],
    })),
    ...(thinking ? [{ label: "Thinking…", status: "running" as ProgressSubstepStatus }] : []),
  ]

  const allDone = lines.length > 0 && !thinking && lines.every(l => l.status === "success" || l.status === "skipped")
  const hasFailed = failed || lines.some(l => l.status === "blocked")
  const type = hasFailed ? "failed" : allDone ? "done" : "loader"

  const label = hasFailed && failedLabel ? failedLabel : allDone && doneLabel ? doneLabel : title

  return (
    <ProgressMessage
      type={type}
      label={label}
      substeps={substeps}
      expanded={expanded}
      onToggleExpand={handleToggle}
    />
  )
}

function NarrativeBlock({ text }: { text: string }) {
  return (
    <div className="animate-chat-in">
      <Typography variant="default" as="p" className="whitespace-pre-wrap" style={{ color: "var(--fleet-text-primary)" }}>
        {text}
      </Typography>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return <UserMessage content={message.text} />
  }
  if (message.role === "system") {
    return (
      <Typography variant="default" as="p" className="whitespace-pre-wrap" style={{ color: "var(--fleet-text-primary)" }}>
        {message.text}
      </Typography>
    )
  }
  // agent
  return (
    <Typography variant="default" as="p" className="whitespace-pre-wrap" style={{ color: "var(--fleet-text-primary)" }}>
      {message.text}
    </Typography>
  )
}

function ChoiceCard({ recommended, title, description, onClick }: { recommended?: boolean; title: string; description: string; onClick: () => void }) {
  return (
    <SelectionCard.Root status={recommended ? "selected" : "default"} onClick={onClick}>
      <SelectionCard.Text>
        {recommended && <SelectionCard.Label>Recommended</SelectionCard.Label>}
        <SelectionCard.Title>{title}</SelectionCard.Title>
        <SelectionCard.Description>{description}</SelectionCard.Description>
      </SelectionCard.Text>
    </SelectionCard.Root>
  )
}

// SecretInputForm removed — replaced by InputQuestionWidget in activeQuestion

// SecretRequestForm removed — replaced by InputQuestionWidget in activeQuestion

// ============================================================================
// Secrets form (Environment Variables + Personal Secrets)
// ============================================================================

function SecretsForm({ appSecrets, appSecretValues, onAddSecret }: { appSecrets: AppState["secrets"]; appSecretValues: Record<string, string>; onAddSecret: (key: "DATABASE_URL" | "NPM_TOKEN", value: string) => void }) {
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }])
  const [secrets, setSecrets] = useState<{ key: string; value: string; visible: boolean }[]>(() => {
    const initial: { key: string; value: string; visible: boolean }[] = []
    for (const [k, v] of Object.entries(appSecretValues)) {
      initial.push({ key: k, value: v, visible: false })
    }
    if (initial.length === 0) initial.push({ key: "", value: "", visible: false })
    return initial
  })

  // Sync secrets added from the chat flow (e.g. DATABASE_URL)
  useEffect(() => {
    for (const [k, v] of Object.entries(appSecretValues)) {
      if (!secrets.some(s => s.key === k)) {
        setSecrets(prev => {
          // Replace the first empty row, or append
          const emptyIdx = prev.findIndex(s => s.key === "" && s.value === "")
          if (emptyIdx >= 0) {
            return prev.map((item, i) => i === emptyIdx ? { key: k, value: v, visible: false } : item)
          }
          return [...prev, { key: k, value: v, visible: false }]
        })
      }
    }
  }, [appSecretValues])

  const updateEnvVar = (index: number, field: "key" | "value", val: string) => {
    setEnvVars(prev => prev.map((item, i) => i === index ? { ...item, [field]: val } : item))
  }
  const removeEnvVar = (index: number) => setEnvVars(prev => prev.filter((_, i) => i !== index))
  const addEnvVar = () => setEnvVars(prev => [...prev, { key: "", value: "" }])

  const updateSecret = (index: number, field: "key" | "value", val: string) => {
    setSecrets(prev => prev.map((item, i) => i === index ? { ...item, [field]: val } : item))
  }
  const removeSecret = (index: number) => setSecrets(prev => prev.filter((_, i) => i !== index))
  const toggleSecretVisibility = (index: number) => {
    setSecrets(prev => prev.map((item, i) => i === index ? { ...item, visible: !item.visible } : item))
  }
  const addSecret = () => setSecrets(prev => [...prev, { key: "", value: "", visible: false }])

  return (
    <div className="p-4 space-y-3">
      {/* Environment Variables */}
      <div className="rounded-[12px] p-4 space-y-3" style={{ background: "#252629" }}>
        <Typography variant="header-3-semibold">Environment Variables</Typography>
        {envVars.map((env, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput placeholder="Key" value={env.key} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEnvVar(i, "key", e.target.value)} className="flex-1" />
            <TextInput placeholder="Value" value={env.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEnvVar(i, "value", e.target.value)} className="flex-1" />
            {envVars.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeEnvVar(i)}>
              <Icon lucide="Trash2" />
            </Button>}
          </div>
        ))}
        <Button variant="link" className="px-0" style={{ color: "var(--fleet-link-text-default)" }} onClick={addEnvVar}>Add variable</Button>
      </div>

      {/* Personal Secrets */}
      <div className="rounded-[12px] p-4 space-y-3" style={{ background: "#252629" }}>
        <div>
          <Typography variant="header-3-semibold">Personal Secrets</Typography>
          <div className="text-[12px] mt-0.5" style={{ color: "var(--fleet-text-secondary)" }}>Only you will have access to your personal secrets</div>
        </div>
        {secrets.map((secret, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput placeholder="Key" value={secret.key} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSecret(i, "key", e.target.value)} className="flex-1" />
            <div className="flex-1 relative">
              <TextInput type={secret.visible ? "text" : "password"} placeholder="Value" value={secret.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSecret(i, "value", e.target.value)} className="w-full pr-8" autoComplete="off" data-1p-ignore />
              <Button variant="ghost" size="icon" onClick={() => toggleSecretVisibility(i)} className="absolute right-1 top-1/2 -translate-y-1/2">
                <Icon lucide={secret.visible ? "Eye" : "EyeOff"} />
              </Button>
            </div>
            {secrets.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeSecret(i)}>
              <Icon lucide="Trash2" />
            </Button>}
          </div>
        ))}
        <Button variant="link" className="px-0" style={{ color: "var(--fleet-link-text-default)" }} onClick={addSecret}>Add secret</Button>
      </div>
    </div>
  )
}

// ============================================================================
// Execution view helpers
// ============================================================================

function getSetupActivityLinesFromSteps(steps: SetupStep[]): ActivityLine[] {
  return steps.map((step) => {
    const spec = SETUP_STEP_SPEC.find((s) => s.id === step.id)
    return { label: spec?.activityLabel ?? step.label, status: stepStatusToActivityStatus(step.status) as ActivityLine["status"] }
  })
}

function getCurrentSetupStepLabel(steps: SetupStep[]): string {
  const running = steps.find((s) => s.status === "running")
  if (running) { const spec = SETUP_STEP_SPEC.find((s) => s.id === running.id); return spec?.activityLabel ?? running.label }
  const failed = steps.find((s) => s.status === "fail")
  if (failed) { const spec = SETUP_STEP_SPEC.find((s) => s.id === failed.id); return spec?.activityLabel ?? failed.label }
  const last = steps[steps.length - 1]
  if (last) { const spec = SETUP_STEP_SPEC.find((s) => s.id === last.id); return spec?.activityLabel ?? last.label }
  return "Running setup"
}

function getAnalysisSummary(st: AppState): string {
  const hasPlan = st.messages.some((m) => m.role === "agent" && m.title === "Initial plan")
  if (hasPlan || st.state !== "RUN_ANALYSIS") return "Exploration completed"
  return "Exploring project…"
}

function getSetupSummary(st: AppState): string {
  if (st.state === "BLOCKED_DATABASE_URL") return "Test command requires DATABASE_URL"
  if (st.state === "BLOCKED_NPM_TOKEN") return "Installing dependencies failed"
  if (st.state === "DATABASE_URL_ACKED") return "Resuming…"
  const completedStates: SetupState[] = ["TESTS_PASSED", "COMPLETION_ANNOUNCED", "GENERATE_CONFIG", "CAPTURING_CONFIG", "CONFIG_CAPTURED", "ENV_CONFIG_READY", "REPORT_RESULT", "COMPLETION_ACTIONS", "AGENT_OPT_STARTING", "AGENT_OPT_ANALYZING", "AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"]
  if (completedStates.includes(st.state)) return "Setup run completed"
  return "Running setup"
}

const POST_SETUP_CONFIG_STATES: SetupState[] = ["CAPTURING_CONFIG", "CONFIG_CAPTURED", "ENV_CONFIG_READY", "AGENT_OPT_STARTING", "AGENT_OPT_ANALYZING", "AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"]
const COMPLETED_STATES: SetupState[] = ["TESTS_PASSED", "COMPLETION_ANNOUNCED", "GENERATE_CONFIG", "REPORT_RESULT", "COMPLETION_ACTIONS", ...POST_SETUP_CONFIG_STATES]
const OPT_STATES: SetupState[] = ["AGENT_OPT_STARTING", "AGENT_OPT_ANALYZING", "AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"]

type CardKind = NonNullable<ChatMessage["card"]>["kind"]

function findLastCard(st: AppState, kind: CardKind) {
  for (let i = st.messages.length - 1; i >= 0; i--) { if (st.messages[i]?.card?.kind === kind) return st.messages[i]!.card }
  return null
}

function indexOfLastMessageWithCard(st: AppState, kind: CardKind): number {
  for (let i = st.messages.length - 1; i >= 0; i--) { if (st.messages[i]?.card?.kind === kind) return i }
  return -1
}

function messagesAfterSecretRequest(st: AppState): ChatMessage[] {
  const idx = indexOfLastMessageWithCard(st, "secret_request")
  if (idx < 0) return []
  const includeSystem = POST_SETUP_CONFIG_STATES.includes(st.state)
  let list = st.messages.slice(idx + 1).filter((m) => m.role === "user" || m.role === "agent" || (includeSystem && m.role === "system"))
  if (st.state === "GENERATE_CONFIG") { const ci = list.findIndex((m) => m.card?.kind === "config_proposal"); if (ci >= 0) list = list.slice(0, ci) }
  return list
}

function messagesBeforeResumedRun(st: AppState): ChatMessage[] {
  const list = messagesAfterSecretRequest(st)
  if (st.setupRunSnapshot == null) return list
  return list.slice(0, 2)
}

function messagesAfterResumedRun(st: AppState): ChatMessage[] {
  const idx = indexOfLastMessageWithCard(st, "secret_request")
  if (idx < 0) return []
  const includeSystem = POST_SETUP_CONFIG_STATES.includes(st.state)
  let list = st.messages.slice(idx + 1).filter((m) => m.role === "user" || m.role === "agent" || (includeSystem && m.role === "system"))
  if (st.setupRunSnapshot != null) list = list.slice(2)
  if (includeSystem) list = list.filter((m) => !(m.role === "system" && m.text === "Validating test command…"))
  if (st.state === "GENERATE_CONFIG") { const ci = list.findIndex((m) => m.card?.kind === "config_proposal"); if (ci >= 0) list = list.slice(0, ci) }
  const optIdx = list.findIndex((m) => m.text === "Continue to agent optimization")
  if (optIdx >= 0) list = list.slice(0, optIdx)
  return list
}

function optimizationMessagesBeforeAnalysis(st: AppState): ChatMessage[] {
  const startIdx = st.messages.findIndex(m => m.text === "Continue to agent optimization")
  if (startIdx < 0) return []
  const analysisCompleteIdx = st.messages.findIndex(m => m.text?.startsWith("Analysis complete."))
  if (analysisCompleteIdx > startIdx) return st.messages.slice(startIdx, analysisCompleteIdx).filter(m => !m.card || (m.card.kind !== "optimization_report" && m.card.kind !== "agent_opt_complete"))
  return st.messages.slice(startIdx).filter(m => !m.card || (m.card.kind !== "optimization_report" && m.card.kind !== "agent_opt_complete"))
}

function optimizationMessagesBeforeReport(st: AppState): ChatMessage[] {
  const analysisCompleteIdx = st.messages.findIndex(m => m.text?.startsWith("Analysis complete."))
  if (analysisCompleteIdx < 0) return []
  const userChoiceIdx = st.messages.findIndex(m => m.text === "Apply auto-fixes" || m.text === "Skip auto-fixes")
  if (userChoiceIdx > analysisCompleteIdx) return st.messages.slice(analysisCompleteIdx, userChoiceIdx).filter(m => !m.card || (m.card.kind !== "optimization_report" && m.card.kind !== "agent_opt_complete"))
  return st.messages.slice(analysisCompleteIdx).filter(m => !m.card || (m.card.kind !== "optimization_report" && m.card.kind !== "agent_opt_complete"))
}

function optimizationMessagesAfterChoice(st: AppState): ChatMessage[] {
  const userChoiceIdx = st.messages.findIndex(m => m.text === "Apply auto-fixes" || m.text === "Skip auto-fixes")
  if (userChoiceIdx < 0) return []
  return st.messages.slice(userChoiceIdx).filter(m => !m.card || (m.card.kind !== "optimization_report" && m.card.kind !== "agent_opt_complete"))
}

// ============================================================================
// Config summary data
// ============================================================================

const CONFIG_SUMMARY = [
  { label: "Runtime", value: "Node.js 20" },
  { label: "Install", value: "npm ci" },
  { label: "Build", value: "npm run build" },
  { label: "Test command", value: "npm test" },
  { label: "Required secret", value: "DATABASE_URL" },
]

const OPT_SUMMARY = [
  { label: "Agent guidance", value: "AGENTS.md" },
  { label: "Commands", value: "docs/agent/commands.md" },
  { label: "Verification", value: "scripts/verify.sh" },
  { label: "PR templates", value: ".github/" },
]

const LOG_SNIPPETS: Record<string, string[]> = {
  env: ["Building base image...", "Using node:20", "Container ready"],
  install: ["npm ci", "added 142 packages in 4s"],
  build: ["npm run build", "Build completed"],
  test: ["npm test", "Test command ran successfully"],
}

// ============================================================================
// Inline card components
// ============================================================================

function EnvConfigReadyCardUI() {
  return (
    <div className="rounded-[12px] border p-4 space-y-4" style={{ borderColor: "var(--fleet-tileButton-off-border-default)", background: "var(--fleet-tileButton-off-background-default)" }}>
      <Typography variant="default-semibold">Environment configuration ready</Typography>
      <Typography variant="default" as="p" style={{ color: "var(--fleet-text-primary)" }}>This configuration reflects a validated setup where install, build, and test commands ran successfully in a clean environment. Agents will use it to run these commands and validate their work.</Typography>
      <ul className="space-y-1.5 text-[13px]" style={{ color: "var(--fleet-text-primary)" }}>
        {CONFIG_SUMMARY.map(({ label, value }) => <li key={label} className="flex gap-2"><span style={{ color: "var(--fleet-text-secondary)" }} className="shrink-0">{label}:</span><span>{value}</span></li>)}
      </ul>
    </div>
  )
}

function ResultCardUI({ card, onViewDetails, onViewLogs }: { card: ResultCardType; onViewDetails: () => void; onViewLogs: () => void }) {
  const isFull = card.validationLevel === "FULL"
  return (
    <div className="rounded-[12px] border p-3 space-y-3" style={{ borderColor: "var(--fleet-tileButton-off-border-default)", background: "var(--fleet-tileButton-off-background-default)" }}>
      <Banner type={isFull ? "positive" : "warning"} inline text={isFull ? "Environment validated" : "Validated with warnings"} closeable={false} />
      <ul className="text-[12px] space-y-0.5" style={{ color: "var(--fleet-text-primary)" }}>
        {card.steps.map((s, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {s.done ? <Icon fleet="task-completed" size="sm" className="text-[var(--fleet-green)]" /> : <span className="w-3 h-3 flex items-center justify-center opacity-50">−</span>}
            {s.label}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button variant="primary" onClick={onViewDetails}>View environment details</Button>
        <Button variant="secondary" onClick={onViewLogs}>View logs</Button>
      </div>
    </div>
  )
}

function OptReportCardUI({ card, onViewReport, onViewChanges }: { card: OptimizationReportCardType; onViewReport: () => void; onViewChanges?: () => void }) {
  const { autoFixCount, recommendationCount, appliedCount } = card
  const hasApplied = appliedCount > 0
  return (
    <div className="rounded-[12px] border p-4 space-y-3" style={{ borderColor: "var(--fleet-tileButton-off-border-default)", background: "var(--fleet-tileButton-off-background-default)" }}>
      <Typography variant="default-semibold">Optimization report</Typography>
      <p className="text-[12px]" style={{ color: "var(--fleet-text-secondary)" }}>Auto-fix: {hasApplied ? `${appliedCount} applied` : autoFixCount} &nbsp;&nbsp; Recommendations: {recommendationCount}</p>
      <Typography variant="default" as="p" style={{ color: "var(--fleet-text-primary)" }}>This report summarizes what I found in the repo and what I can improve automatically.</Typography>
      <div className="flex gap-2">
        <Button variant="primary" onClick={onViewReport}>View report</Button>
        {hasApplied && onViewChanges && <Button variant="secondary" onClick={onViewChanges}>View changes</Button>}
      </div>
    </div>
  )
}

function AgentOptCompleteCardUI() {
  return (
    <div className="rounded-[12px] border p-4 space-y-4" style={{ borderColor: "var(--fleet-tileButton-off-border-default)", background: "var(--fleet-tileButton-off-background-default)" }}>
      <Typography variant="default-semibold">Agent optimization complete</Typography>
      <Typography variant="default" as="p" style={{ color: "var(--fleet-text-primary)" }}>This repository now includes agent guidance, documented commands, and a verification entrypoint. Agents can follow the same workflow to validate their work before creating a pull request.</Typography>
      <ul className="space-y-1.5 text-[13px]" style={{ color: "var(--fleet-text-primary)" }}>
        {OPT_SUMMARY.map(({ label, value }) => <li key={label} className="flex gap-2"><span className="shrink-0 opacity-60">{label}:</span><span className="font-mono text-[12px]">{value}</span></li>)}
      </ul>
    </div>
  )
}

// ============================================================================
// Details Panel
// ============================================================================

function DetailsPanel({ st, onClose }: { st: AppState; onClose: () => void }) {
  const [tab, setTab] = useState("overview")
  const validationLabel = st.validationLevel === "FULL" ? "Full" : "Partial"
  const lastRun = st.lastRunTimestamp ? new Date(st.lastRunTimestamp).toLocaleString() : "—"

  return (
    <div className="w-[420px] shrink-0 flex flex-col border-l" style={{ borderColor: "var(--fleet-tileButton-off-border-default)", background: "var(--fleet-tileButton-off-background-default)" }}>
      <div className="flex items-center justify-between h-12 px-4 border-b" style={{ borderColor: "var(--fleet-border-primary)" }}>
        <Typography variant="default-semibold">Environment details</Typography>
        <Button variant="ghost" size="icon" onClick={onClose}><Icon lucide="X" size="xs" /></Button>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="px-2 border-b" style={{ borderColor: "var(--fleet-border-primary)" }}>
          {["overview", "commands", "secrets", "logs", "files"].map(t => <TabsTrigger key={t} value={t} size="sm">{t.charAt(0).toUpperCase() + t.slice(1)}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="overview" className="flex-1 overflow-auto p-4">
          <div className="space-y-3 text-[13px]">
            {[["Runtime", "Node.js 20"], ["Package manager", "npm"], ["Validation", validationLabel], ["Last run", lastRun]].map(([l, v]) => (
              <div key={l}><div className="text-[12px] mb-0.5" style={{ color: "var(--fleet-text-secondary)" }}>{l}</div><div style={{ color: "var(--fleet-text-primary)" }}>{v}</div></div>
            ))}
            <Button variant="secondary">Re-run validation</Button>
          </div>
        </TabsContent>
        <TabsContent value="commands" className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {["npm ci", "npm run build", "npm test"].map((cmd) => (
              <div key={cmd} className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[12px] px-2 py-1.5 rounded border" style={{ borderColor: "var(--fleet-tileButton-off-border-default)", background: "var(--fleet-tileButton-off-background-default)" }}>{cmd}</code>
                <Button variant="ghost" size="sm">Copy</Button>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="secrets" className="flex-1 overflow-auto p-4">
          <SecretsForm appSecrets={st.secrets} appSecretValues={st.secretValues} onAddSecret={() => {}} />
        </TabsContent>
        <TabsContent value="logs" className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            {st.setupSteps.map((step) => (
              <div key={step.id}>
                <div className="text-[12px] font-medium mb-1" style={{ color: "var(--fleet-text-secondary)" }}>{step.label}</div>
                <pre className="font-mono text-[10px] p-2 rounded border overflow-x-auto" style={{ borderColor: "var(--fleet-tileButton-off-border-default)", background: "var(--fleet-tileButton-off-background-default)" }}>{LOG_SNIPPETS[step.id]?.join("\n") ?? "—"}</pre>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="files" className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {["Dockerfile", "air-config.json", ".env.example"].map((name) => (
              <button key={name} type="button" className="block w-full text-left px-2 py-1.5 rounded border text-[13px] hover:opacity-80" style={{ borderColor: "var(--fleet-border-primary)", color: "var(--fleet-text-primary)" }}>{name}</button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================================
// Optimization Report Panel
// ============================================================================

type HighLevelStep = { title: string; description: string; estimate: string; doneStates: SetupState[]; activeStates: SetupState[] }

const HIGH_LEVEL_STEPS: HighLevelStep[] = [
  { title: "Explore project", description: "Runtime, scripts, config", estimate: "~1 min", doneStates: ["RUN_SETUP_ATTEMPT", "BLOCKED_NPM_TOKEN", "BLOCKED_DATABASE_URL", "DATABASE_URL_ACKED", "TESTS_PASSED", "COMPLETION_ANNOUNCED", "CAPTURING_CONFIG", "CONFIG_CAPTURED", "ENV_CONFIG_READY", "GENERATE_CONFIG", "REPORT_RESULT", "COMPLETION_ACTIONS", "AGENT_OPT_STARTING", "AGENT_OPT_ANALYZING", "AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"], activeStates: ["RUN_ANALYSIS"] },
  { title: "Setup run", description: "Install, build, test", estimate: "~2–3 min", doneStates: ["TESTS_PASSED", "COMPLETION_ANNOUNCED", "CAPTURING_CONFIG", "CONFIG_CAPTURED", "ENV_CONFIG_READY", "GENERATE_CONFIG", "REPORT_RESULT", "COMPLETION_ACTIONS", "AGENT_OPT_STARTING", "AGENT_OPT_ANALYZING", "AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"], activeStates: ["RUN_SETUP_ATTEMPT", "BLOCKED_NPM_TOKEN", "BLOCKED_DATABASE_URL", "DATABASE_URL_ACKED"] },
  { title: "Capture configuration", description: "Environment config", estimate: "~30s", doneStates: ["ENV_CONFIG_READY", "GENERATE_CONFIG", "REPORT_RESULT", "COMPLETION_ACTIONS", "AGENT_OPT_STARTING", "AGENT_OPT_ANALYZING", "AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"], activeStates: ["CAPTURING_CONFIG", "CONFIG_CAPTURED"] },
  { title: "Agent optimization", description: "AGENTS.md, commands, verify", estimate: "~2 min", doneStates: ["AGENT_OPT_COMPLETE"], activeStates: ["AGENT_OPT_STARTING", "AGENT_OPT_ANALYZING", "AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING"] },
]

function getStepStatus(step: HighLevelStep, state: SetupState): "done" | "in-progress" | "todo" {
  if (step.doneStates.includes(state)) return "done"
  if (step.activeStates.includes(state)) return "in-progress"
  return "todo"
}

function ProgressTabContent({ state }: { state: SetupState }) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <Typography variant="header-3-semibold">Setup progress</Typography>
        <Typography variant="default" as="p" className="mt-1" style={{ color: "var(--fleet-text-secondary)" }}>
          Preparing this repository so cloud agents can install, build, and test reliably.
        </Typography>
      </div>
      <div className="space-y-0.5">
        {(() => {
          const statuses = HIGH_LEVEL_STEPS.map(s => getStepStatus(s, state))
          const anyInProgress = statuses.includes("in-progress")
          const allDone = statuses.every(s => s === "done")
          const waitingStates: SetupState[] = ["ENV_CONFIG_READY", "COMPLETION_ACTIONS", "AGENT_OPT_REPORT_READY", "AGENT_OPT_COMPLETE"]
          // If no step is in-progress, not all done, and not waiting for user choice, highlight the last done step
          if (!anyInProgress && !allDone && !waitingStates.includes(state)) {
            const lastDoneIdx = statuses.lastIndexOf("done")
            if (lastDoneIdx >= 0) statuses[lastDoneIdx] = "in-progress"
          }
          return HIGH_LEVEL_STEPS.map((step, i) => {
            const status = statuses[i]
            const hint = status === "in-progress"
              ? `${step.description} · ${step.estimate}`
              : step.description
            return (
              <WorkflowStep
                key={step.title}
                title={step.title}
                hint={hint}
                status={status}
                isLast={i === HIGH_LEVEL_STEPS.length - 1}
              />
            )
          })
        })()}
      </div>
    </div>
  )
}

const ENV_CONFIG_FILES = [
  { name: ".cloud/env.json", added: 24, removed: 0 },
  { name: ".cloud/secrets.json", added: 8, removed: 0 },
  { name: ".cloud/commands.json", added: 12, removed: 0 },
]

const OPT_FILES = [
  { name: "AGENTS.md", added: 45, removed: 0 },
  { name: "docs/agent/commands.md", added: 18, removed: 0 },
  { name: "scripts/verify.sh", added: 12, removed: 0 },
  { name: ".github/pull_request_template.md", added: 9, removed: 0 },
  { name: ".github/ISSUE_TEMPLATE/bug_report.md", added: 6, removed: 0 },
  { name: ".github/ISSUE_TEMPLATE/feature_request.md", added: 5, removed: 17 },
]

const CONFIG_READY_STATES: SetupState[] = ["ENV_CONFIG_READY", "GENERATE_CONFIG", "REPORT_RESULT", "COMPLETION_ACTIONS", "AGENT_OPT_STARTING", "AGENT_OPT_ANALYZING", "AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"]

function ChangesTabContent({ state, optimizationApplied }: { state: SetupState; optimizationApplied: boolean }) {
  const showEnv = CONFIG_READY_STATES.includes(state)
  const showOpt = state === "AGENT_OPT_COMPLETE" && optimizationApplied
  const files = [...(showEnv ? ENV_CONFIG_FILES : []), ...(showOpt ? OPT_FILES : [])]

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: "var(--fleet-text-secondary)" }}>
        <Typography variant="default">No changes yet</Typography>
      </div>
    )
  }

  return (
    <List
      items={files}
      keyFn={f => f.name}
      renderItem={(f) => (
        <ListItem
          variant="changes"
          text={f.name}
          icon={<Icon fleet="json" />}
          additions={f.added}
          deletions={f.removed}
        />
      )}
    />
  )
}

function ReportTabContent({ appliedCount }: { appliedCount: number }) {
  const hasApplied = appliedCount > 0
  const autoFixItems = OPTIMIZATION_ITEMS.filter(item => item.type === "auto-fix")
  const recommendationItems = OPTIMIZATION_ITEMS.filter(item => item.type === "recommendation")

  return (
    <div className="flex-1 overflow-auto p-4 space-y-5">
      <div className="rounded-[12px] p-4" style={{ background: "#252629" }}>
        <Typography variant="header-2-semibold">Optimization Report (Needs design work)</Typography>
        <Typography variant="default" className="mt-1" style={{ color: "var(--fleet-text-secondary)" }}>Agent optimization best practices for this repository.</Typography>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Icon lucide="Check" size="xs" style={{ color: hasApplied ? "var(--fleet-green)" : "var(--fleet-text-secondary)" }} />
            <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>{hasApplied ? `${appliedCount} applied` : `${autoFixItems.length} auto-fixes`}</Typography>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon lucide="MessageCircle" size="xs" style={{ color: "var(--fleet-text-secondary)" }} />
            <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>{recommendationItems.length} recommendations</Typography>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Typography variant="header-3-semibold">Auto-fix ({hasApplied ? `${appliedCount} applied` : autoFixItems.length})</Typography>
        {autoFixItems.map(item => (
          <div key={item.id}>
            <Typography variant="default-semibold">{item.title}</Typography>
            <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>{item.oneLine}</Typography>
            {item.files.length > 0 && <Typography variant="default" className="mt-0.5 font-mono text-[12px]" style={{ color: "var(--fleet-text-secondary)" }}>{item.files.join(", ")}</Typography>}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Typography variant="header-3-semibold">Recommendations ({recommendationItems.length})</Typography>
        {recommendationItems.map(item => (
          <div key={item.id}>
            <Typography variant="default-semibold">{item.title}</Typography>
            <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>{item.oneLine}</Typography>
          </div>
        ))}
      </div>
    </div>
  )
}

function OptimizationReportPanel({ onClose, appliedCount }: { onClose: () => void; appliedCount: number }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const hasApplied = appliedCount > 0
  const autoFixItems = OPTIMIZATION_ITEMS.filter(item => item.type === "auto-fix")
  const recommendationItems = OPTIMIZATION_ITEMS.filter(item => item.type === "recommendation")

  const renderItem = (item: OptimizationItem) => {
    const isExpanded = expandedId === item.id
    const isAutoFix = item.type === "auto-fix"
    const statusLabel = hasApplied && isAutoFix ? "Applied" : isAutoFix ? "Ready to apply" : "Recommendation"

    return (
      <div key={item.id} className="border rounded-md" style={{ borderColor: "var(--fleet-tileButton-off-border-default)", background: "var(--fleet-tileButton-off-background-default)" }}>
        <button type="button" onClick={() => setExpandedId(isExpanded ? null : item.id)} className="w-full text-left p-3 hover:opacity-80 flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[13px] font-medium" style={{ color: "var(--fleet-text-primary)" }}>{item.title}</span>
              <Banner type={hasApplied && isAutoFix ? "positive" : isAutoFix ? "info" : "warning"} inline text={statusLabel} closeable={false} className="scale-75 origin-left" />
            </div>
            <p className="text-[12px]" style={{ color: "var(--fleet-text-primary)" }}>{item.oneLine}</p>
          </div>
          <Icon lucide="ChevronDown" size="xs" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
        {isExpanded && (
          <div className="px-3 pb-3 space-y-3 text-[12px] border-t pt-3" style={{ borderColor: "var(--fleet-border-primary)" }}>
            <div><div className="font-medium mb-1" style={{ color: "var(--fleet-text-secondary)" }}>What I detected</div><div style={{ color: "var(--fleet-text-primary)" }}>{item.detected}</div></div>
            {isAutoFix && <div><div className="font-medium mb-1" style={{ color: "var(--fleet-text-secondary)" }}>{hasApplied ? "What I did" : "What I will do"}</div><div style={{ color: "var(--fleet-text-primary)" }}>{hasApplied ? item.did : item.willDo}</div></div>}
            {!isAutoFix && (<><div><div className="font-medium mb-1" style={{ color: "var(--fleet-text-secondary)" }}>Why it matters</div><div style={{ color: "var(--fleet-text-primary)" }}>{item.why}</div></div><div><div className="font-medium mb-1" style={{ color: "var(--fleet-text-secondary)" }}>Suggested next step</div><div style={{ color: "var(--fleet-text-primary)" }}>{item.suggestedNextStep}</div></div></>)}
            {item.files.length > 0 && <div><div className="font-medium mb-1" style={{ color: "var(--fleet-text-secondary)" }}>Files</div>{item.files.map(f => <div key={f} className="font-mono text-[10px]" style={{ color: "var(--fleet-text-primary)" }}>{f}</div>)}</div>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-[420px] shrink-0 flex flex-col border-l" style={{ borderColor: "var(--fleet-tileButton-off-border-default)", background: "var(--fleet-tileButton-off-background-default)" }}>
      <div className="flex items-center justify-between h-12 px-4 border-b" style={{ borderColor: "var(--fleet-border-primary)" }}>
        <Typography variant="default-semibold">Optimization report</Typography>
        <Button variant="ghost" size="icon" onClick={onClose}><Icon lucide="X" size="xs" /></Button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-2">
          <Typography variant="default-semibold">Summary</Typography>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--fleet-text-secondary)" }}>Auto-fix items are safe, generic improvements. Recommendations may require team decisions.</p>
          <div className="flex gap-2">
            <Banner type="info" inline text={`Auto-fix: ${hasApplied ? `${appliedCount} applied` : autoFixItems.length}`} closeable={false} />
            <Banner type="warning" inline text={`Recommendations: ${recommendationItems.length}`} closeable={false} />
          </div>
        </div>
        {hasApplied && <div className="space-y-2"><Typography variant="default-semibold">Applied changes</Typography><div className="space-y-1 text-[12px]">{autoFixItems.flatMap(i => i.files).map(f => <div key={f} className="font-mono" style={{ color: "var(--fleet-text-secondary)" }}>{f}</div>)}</div></div>}
        <div className="space-y-2"><Typography variant="default-semibold">Auto-fix findings</Typography>{autoFixItems.map(renderItem)}</div>
        <div className="space-y-2"><Typography variant="default-semibold">Recommendations</Typography>{recommendationItems.map(renderItem)}</div>
      </div>
    </div>
  )
}

// ============================================================================
// PR Modal
// ============================================================================

function PRModal({ st, onClose, onCreatePr }: { st: AppState; onClose: () => void; onCreatePr: () => void }) {
  const hasOpt = st.optimizationApplied
  const defaultTitle = hasOpt ? "Configure environment and apply agent optimizations" : "Configure cloud environment for agent runs"
  const defaultDesc = `This change adds a reproducible cloud environment configuration for agent runs.${hasOpt ? "\nIncludes agent optimization: AGENTS.md, commands documentation, verify script, and PR templates." : ""}`
  const [prTitle, setPrTitle] = useState(defaultTitle)
  const [prDesc, setPrDesc] = useState(defaultDesc)

  return (
    <DialogRoot open onOpenChange={(open: boolean) => { if (!open) onClose() }}>
      <DialogContent className="max-w-[440px] !gap-4 !p-4" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Create pull request</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] mb-1" style={{ color: "var(--fleet-text-secondary)" }}>Title</label>
            <TextInput value={prTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] mb-1" style={{ color: "var(--fleet-text-secondary)" }}>Description</label>
            <Textarea value={prDesc} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrDesc(e.target.value)} rows={3} resize="none" />
          </div>
          <div>
            <label className="block text-[12px] mb-1" style={{ color: "var(--fleet-text-secondary)" }}>Branch</label>
            <AirSelect value="cloud-env-setup" options={[{ value: "cloud-env-setup", label: "cloud-env-setup" }, { value: "main", label: "main" }]} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onCreatePr}>Create PR</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

// ============================================================================
// Splash Screen
// ============================================================================

function SplashScreen({ onStart, onCancel }: { onStart: () => void; onCancel: () => void }) {
  return (
    <FleetDialog
      open
      title="Project setup"
      body="Prepare this repository so cloud agents can run install, build, and test commands reliably. I will validate that those commands work in a clean environment and only ask for input if I get blocked."
      buttons={[
        { label: "Cancel", variant: "secondary" as const, onClick: onCancel },
        { label: "Start environment setup", variant: "primary" as const, onClick: onStart },
      ]}
      showClose
      onClose={onCancel}
    />
  )
}

// ============================================================================
// Execution View
// ============================================================================

const STAGGER_MS = 100

function useExecutionMessages({ st, onAddSecret, onSkipTests, onEnvConfigChoice, onOptimizationChoice, onViewDetails, onViewLogs, onViewOptimizationReport, onOpenPrModal }: {
  st: AppState; onAddSecret: (key: "DATABASE_URL" | "NPM_TOKEN", value: string) => void; onSkipTests: () => void; onEnvConfigChoice: (choice: "continue" | "create_pr") => void; onOptimizationChoice: (choice: "apply" | "skip") => void; onViewDetails: () => void; onViewLogs: () => void; onViewOptimizationReport: () => void; onOpenPrModal: () => void
}) {
  const showAnalysisBox = st.activityTimeline.length > 0 || st.state === "RUN_ANALYSIS"
  const analysisSummary = getAnalysisSummary(st)
  const showSetupBox = ["RUN_SETUP_ATTEMPT", "BLOCKED_DATABASE_URL", "BLOCKED_NPM_TOKEN", "DATABASE_URL_ACKED", ...COMPLETED_STATES].includes(st.state)
  const hasFrozenRun = st.setupRunSnapshot != null
  const showResumedBox = hasFrozenRun && ["RUN_SETUP_ATTEMPT", ...COMPLETED_STATES].includes(st.state)
  const frozenLines = hasFrozenRun ? getSetupActivityLinesFromSteps(st.setupRunSnapshot!) : []
  const setupActivityLines = getSetupActivityLinesFromSteps(st.setupSteps)
  const setupSummary = getSetupSummary(st)
  const activityExpanded = st.state === "RUN_ANALYSIS" || st.state === "RUN_SETUP_ATTEMPT" || st.state === "BLOCKED_DATABASE_URL" || st.state === "BLOCKED_NPM_TOKEN"
  const hasPlanMessage = st.messages.some((m) => m.role === "agent" && m.title === "Initial plan")
  const secretCard = findLastCard(st, "secret_request")
  const resultCard = findLastCard(st, "result")
  const nextCard = findLastCard(st, "next_steps")

  const [secretInputOpen, setSecretInputOpen] = useState(false)
  const [analysisBoxUserExpanded, setAnalysisBoxUserExpanded] = useState(false)
  const [setupBoxUserExpanded, setSetupBoxUserExpanded] = useState(false)
  const [frozenSetupBoxUserExpanded, setFrozenSetupBoxUserExpanded] = useState(false)
  const [resumedBoxUserExpanded, setResumedBoxUserExpanded] = useState(false)
  const [configCaptureBoxUserExpanded, setConfigCaptureBoxUserExpanded] = useState(false)
  const [optimizationAnalysisBoxUserExpanded, setOptimizationAnalysisBoxUserExpanded] = useState(false)
  const [optimizationApplyingBoxUserExpanded, setOptimizationApplyingBoxUserExpanded] = useState(false)

  const analysisInProgress = st.state === "RUN_ANALYSIS"

  useEffect(() => { if (hasPlanMessage) setAnalysisBoxUserExpanded(false) }, [hasPlanMessage])
  useEffect(() => {
    if (COMPLETED_STATES.includes(st.state)) { if (hasFrozenRun) setResumedBoxUserExpanded(false); else setSetupBoxUserExpanded(false) }
    if (["CONFIG_CAPTURED", "ENV_CONFIG_READY", ...OPT_STATES].includes(st.state)) setConfigCaptureBoxUserExpanded(false)
    if (showResumedBox) setFrozenSetupBoxUserExpanded(false)
    if (st.state === "BLOCKED_DATABASE_URL" || st.state === "BLOCKED_NPM_TOKEN") { setFrozenSetupBoxUserExpanded(false); if (!hasFrozenRun) setSetupBoxUserExpanded(false) }
  }, [st.state, hasFrozenRun, showResumedBox])
  useEffect(() => {
    if (["AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"].includes(st.state)) setOptimizationAnalysisBoxUserExpanded(false)
    if (st.state === "AGENT_OPT_COMPLETE") setOptimizationApplyingBoxUserExpanded(false)
  }, [st.state])

  const analysisExpanded = analysisBoxUserExpanded
  const setupExpanded = setupBoxUserExpanded
  const frozenExpanded = frozenSetupBoxUserExpanded
  const resumedExpanded = resumedBoxUserExpanded
  const configCaptureExpanded = configCaptureBoxUserExpanded
  const optimizationAnalysisExpanded = optimizationAnalysisBoxUserExpanded
  const optimizationApplyingExpanded = optimizationApplyingBoxUserExpanded

  const bottomRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }) }

  useEffect(() => { const r = requestAnimationFrame(() => { requestAnimationFrame(scrollToBottom) }); return () => cancelAnimationFrame(r) }, [st.messages.length, st.state])
  useEffect(() => { const el = contentRef.current; if (!el) return; const obs = new ResizeObserver(() => { requestAnimationFrame(scrollToBottom) }); obs.observe(el); return () => obs.disconnect() }, [])

  // Build chat messages for ChatIsland
  const chatMessages: UIChatMessage[] = []
  let msgIdx = 0
  const pushAssistant = (content: React.ReactNode) => { chatMessages.push({ id: `auto-${msgIdx++}`, role: "assistant", content }) }
  const pushUser = (content: React.ReactNode) => { chatMessages.push({ id: `auto-${msgIdx++}`, role: "user", content }) }

  // Opening message
  pushAssistant("I'm going to analyze this repository and prepare an environment so cloud agents can run install, build, and test commands reliably.\n\nI'll validate that those commands work in a clean environment and only ask for input if something blocks progress.")

  // Analysis activity box
  if (showAnalysisBox) {
    pushAssistant(
      <ActivityBox title="Exploring the project" doneLabel="Explored the project" lines={st.activityTimeline} summary={analysisSummary} expanded={analysisExpanded} onToggle={() => setAnalysisBoxUserExpanded(e => !e)} thinking={st.agentThinking && st.state === "RUN_ANALYSIS"} collapsedSecondaryLine={hasPlanMessage ? `Thought for ${ANALYSIS_DURATION_SECONDS} seconds` : st.agentThinking && st.state === "RUN_ANALYSIS" && st.activityTimeline.length > 0 ? st.activityTimeline[st.activityTimeline.length - 1]?.label ?? "Exploring project…" : st.activityTimeline.length > 0 ? st.activityTimeline[st.activityTimeline.length - 1]?.label : undefined} />
    )
  }

  if (hasPlanMessage) {
    pushAssistant("I found a Node.js project with a lockfile.\n\nI'll validate the install, build, and test commands in a clean environment so agents can use them to validate their work.")
  }

  // Setup run box (no snapshot)
  if (showSetupBox && !hasFrozenRun) {
    pushAssistant(
      <ActivityBox title="Setup run" doneLabel="Setup complete" failedLabel="Setup run failed" lines={setupActivityLines} summary={setupSummary} expanded={setupExpanded} onToggle={() => setSetupBoxUserExpanded(e => !e)} failed={st.state === "BLOCKED_DATABASE_URL" || st.state === "BLOCKED_NPM_TOKEN"} collapsedSecondaryLine={["GENERATE_CONFIG", "REPORT_RESULT", "COMPLETION_ACTIONS"].includes(st.state) ? `Completed in ${SETUP_RUN_DURATION_SECONDS} seconds` : st.state === "BLOCKED_DATABASE_URL" ? `Ran for ${SETUP_RUN_DURATION_SECONDS} seconds` : st.state === "BLOCKED_NPM_TOKEN" ? `Ran for ${SETUP_DURATION_BEFORE_INSTALL_FAILURE_SECONDS} seconds` : getCurrentSetupStepLabel(st.setupSteps)} />
    )
  }

  // Frozen first run
  if (showSetupBox && hasFrozenRun) {
    pushAssistant(
      <ActivityBox title="Setup run" doneLabel="Setup complete" failedLabel="Setup run failed" lines={frozenLines} summary="Test command requires DATABASE_URL" expanded={frozenExpanded} onToggle={() => setFrozenSetupBoxUserExpanded(e => !e)} failed collapsedSecondaryLine={`Ran for ${SETUP_RUN_DURATION_SECONDS} seconds`} />
    )
  }

  // Configuration required: DATABASE_URL
  if (st.state === "BLOCKED_DATABASE_URL" && secretCard?.kind === "secret_request" && secretCard.secretKey === "DATABASE_URL") {
    pushAssistant("The test command requires a database connection (e.g. DATABASE_URL). Add it so I can run the test command and confirm the setup allows agents to validate their work.\n\nThe value is stored securely for you and is never committed to the repository.")
  }
  if (hasFrozenRun && st.state !== "BLOCKED_DATABASE_URL") {
    pushAssistant("The test command requires a database connection (e.g. DATABASE_URL). Add it so I can run the test command and confirm the setup allows agents to validate their work.\n\nThe value is stored securely for you and is never committed to the repository.")
  }

  // Blocked NPM_TOKEN
  if (st.state === "BLOCKED_NPM_TOKEN" && secretCard && secretCard.kind === "secret_request") {
    pushAssistant("I can't complete the setup yet.\n\nDependency install failed due to private packages. Please provide NPM_TOKEN to continue.")
  }

  // User + agent ack messages
  const ackMessages = hasFrozenRun ? messagesBeforeResumedRun(st) : messagesAfterSecretRequest(st)
  for (const msg of ackMessages) {
    if (msg.role === "user") pushUser(msg.text)
    else pushAssistant(msg.text)
  }

  // Resumed run box
  if (showResumedBox) {
    pushAssistant(
      <ActivityBox title="Validate test command" doneLabel="Test command validated" lines={setupActivityLines} summary={COMPLETED_STATES.includes(st.state) ? "Test command validated" : setupSummary} expanded={resumedExpanded} onToggle={() => setResumedBoxUserExpanded(e => !e)} collapsedSecondaryLine={COMPLETED_STATES.includes(st.state) || POST_SETUP_CONFIG_STATES.includes(st.state) ? `Completed in ${RESUMED_RUN_DURATION_SECONDS} seconds` : "Validating test command (npm test)"} />
    )
  }


  // Completion messages + capture config activity box
  if (hasFrozenRun) {
    const list = messagesAfterResumedRun(st)
    const firstSystemIdx = list.findIndex((m) => m.role === "system")
    const showCaptureBox = (st.state === "CAPTURING_CONFIG" || st.state === "CONFIG_CAPTURED" || st.state === "ENV_CONFIG_READY") && firstSystemIdx >= 0
    const isCompleted = st.state === "CONFIG_CAPTURED" || st.state === "ENV_CONFIG_READY"
    for (let i = 0; i < list.length; i++) {
      const msg = list[i]
      const captureBox = i === firstSystemIdx && showCaptureBox && st.captureConfigLines.length > 0
        ? <ActivityBox title="Capturing environment configuration" doneLabel="Captured environment configuration" lines={st.captureConfigLines} summary={isCompleted ? "Completed" : "Capturing…"} expanded={configCaptureExpanded} onToggle={() => setConfigCaptureBoxUserExpanded(e => !e)} collapsedSecondaryLine={isCompleted ? `Completed in ${CAPTURE_CONFIG_DURATION_SECONDS} seconds` : undefined} />
        : null
      if (msg.role === "user") {
        pushUser(msg.text)
      } else {
        pushAssistant(msg.text)
        if (captureBox) pushAssistant(captureBox)
      }
    }
  }

  // Env config ready milestone
  if (st.state === "ENV_CONFIG_READY" || OPT_STATES.includes(st.state)) {
    pushAssistant(`Environment configuration is ready. This configuration reflects a validated setup where install, build, and test commands ran successfully in a clean environment.\n\n${CONFIG_SUMMARY.map(s => `${s.label}: ${s.value}`).join("\n")}`)
  }

  // Optimization phase messages before analysis
  if (OPT_STATES.includes(st.state)) {
    for (const msg of optimizationMessagesBeforeAnalysis(st)) {
      if (msg.role === "user") pushUser(msg.text)
      else pushAssistant(msg.text)
    }
  }

  // Optimization analysis activity box
  if (["AGENT_OPT_ANALYZING", "AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"].includes(st.state) && st.optimizationAnalysisLines.length > 0) {
    const done = ["AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"].includes(st.state)
    pushAssistant(
      <ActivityBox title="Analyzing repository for agent optimization" doneLabel="Analyzed repository for agent optimization" lines={st.optimizationAnalysisLines} summary={done ? "Completed" : "Analyzing…"} expanded={optimizationAnalysisExpanded} onToggle={() => setOptimizationAnalysisBoxUserExpanded(e => !e)} collapsedSecondaryLine={done ? `Completed in ${OPTIMIZATION_ANALYSIS_DURATION_SECONDS} seconds` : undefined} />
    )
  }

  // Messages before report
  if (["AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"].includes(st.state)) {
    for (const msg of optimizationMessagesBeforeReport(st)) {
      if (msg.role === "user") pushUser(msg.text)
      else pushAssistant(msg.text)
    }
  }

  // Optimization report card + choice cards
  if (["AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"].includes(st.state) && st.optimizationReportVisible) {
    const rc = findLastCard(st, "optimization_report")
    if (rc && rc.kind === "optimization_report") {
      pushAssistant("Optimization report is ready. Auto-fix: " + (rc.appliedCount > 0 ? rc.appliedCount + " applied" : rc.autoFixCount) + ", Recommendations: " + rc.recommendationCount + ".\n\nThis report summarizes what I found in the repo and what I can improve automatically.")
      pushAssistant(
        <Button variant="primary" onClick={onViewOptimizationReport}>View report</Button>
      )
    }
  }

  // Messages after choice
  if (["AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"].includes(st.state)) {
    for (const msg of optimizationMessagesAfterChoice(st)) {
      if (msg.role === "user") pushUser(msg.text)
      else pushAssistant(msg.text)
    }
  }

  // Applying auto-fixes activity box
  if (["AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"].includes(st.state) && st.optimizationChoice === "apply" && st.optimizationApplyingLines.length > 0) {
    const done = st.state === "AGENT_OPT_COMPLETE"
    pushAssistant(
      <ActivityBox title="Applying auto-fixes" doneLabel="Applied auto-fixes" lines={st.optimizationApplyingLines} summary={done ? "Completed" : "Applying…"} expanded={optimizationApplyingExpanded} onToggle={() => setOptimizationApplyingBoxUserExpanded(e => !e)} collapsedSecondaryLine={done ? `Completed in ${OPTIMIZATION_APPLYING_DURATION_SECONDS} seconds` : undefined} />
    )
  }

  // Agent optimization complete
  if (st.state === "AGENT_OPT_COMPLETE") {
    const cc = findLastCard(st, "agent_opt_complete")
    if (cc && cc.kind === "agent_opt_complete" && st.optimizationApplied) {
      pushAssistant(`Agent optimization complete.\n\nThis repository now includes agent guidance, documented commands, and a verification entrypoint.\n\n${OPT_SUMMARY.map(s => `${s.label}: ${s.value}`).join("\n")}`)
    }
  }

  // Result card (for non-env-config path)
  if ((st.state === "REPORT_RESULT" || st.state === "COMPLETION_ACTIONS") && resultCard && resultCard.kind === "result") {
    pushAssistant(
      <div className="space-y-3">
        <NarrativeBlock text={"Your environment is ready.\n\nCloud agents can now install dependencies, build the project, and run the test command to validate their work."} />
        <ResultCardUI card={resultCard} onViewDetails={onViewDetails} onViewLogs={onViewLogs} />
      </div>
    )
  }

  // PR created banner
  if (st.prCreated) {
    pushAssistant(<Banner type="positive" inline text="Pull request created: Configure cloud environment for agent runs" closeable={false} />)
  }

  // Build active question widget (shown above input)
  let activeQuestion: React.ReactNode = null

  if (st.state === "BLOCKED_DATABASE_URL" && secretInputOpen) {
    activeQuestion = (
      <InputQuestionWidget
        question="Provide DATABASE_URL"
        placeholder="postgres://user:pass@host:5432/db"
        hint="Used when running the test command. Stored securely and never committed."
        submitLabel="Save"
        cancelLabel="Cancel"
        onSubmit={(value) => { onAddSecret("DATABASE_URL", value); setSecretInputOpen(false) }}
        onCancel={() => setSecretInputOpen(false)}
      />
    )
  } else if (st.state === "BLOCKED_DATABASE_URL" && !secretInputOpen) {
    activeQuestion = (
      <QuestionWidget
        question="The test command requires DATABASE_URL. How would you like to proceed?"
        answers={[
          { label: "Add DATABASE_URL", description: "Validates the full setup including the test command.", onClick: () => setSecretInputOpen(true) },
          { label: "Skip validating test command", description: "Setup completes without validating the test command.", onClick: onSkipTests },
        ]}
      />
    )
  } else if (st.state === "BLOCKED_NPM_TOKEN" && secretCard && secretCard.kind === "secret_request") {
    activeQuestion = (
      <InputQuestionWidget
        question={`Provide ${secretCard.secretKey}`}
        placeholder={secretCard.placeholder}
        hint={secretCard.description}
        submitLabel="Save"
        cancelLabel="Skip"
        onSubmit={(value) => onAddSecret(secretCard.secretKey, value)}
        onCancel={onSkipTests}
      />
    )
  } else if (st.state === "ENV_CONFIG_READY" && st.envConfigChoice == null) {
    activeQuestion = (
      <QuestionWidget
        question="What would you like to do next?"
        answers={[
          { label: "Continue to agent optimization", description: "Keep working with cloud agents using this validated environment.", onClick: () => onEnvConfigChoice("continue") },
          { label: "Create pull request", description: "Add the captured environment configuration to the repository.", onClick: () => onEnvConfigChoice("create_pr") },
        ]}
      />
    )
  } else if (st.optimizationChoice == null && st.state === "AGENT_OPT_REPORT_READY" && st.optimizationReportVisible) {
    activeQuestion = (
      <QuestionWidget
        question="Would you like to apply the suggested fixes?"
        answers={[
          { label: "Apply auto-fixes", description: "Create or update repo files for AGENTS.md, commands documentation, verify script, and PR templates.", onClick: () => onOptimizationChoice("apply") },
          { label: "Skip auto-fixes", description: "Continue without changing the repo.", onClick: () => onOptimizationChoice("skip") },
        ]}
      />
    )
  } else if (st.state === "AGENT_OPT_COMPLETE" && !st.prCreated) {
    activeQuestion = (
      <QuestionWidget
        question="What would you like to do next?"
        answers={[
          { label: "Create pull request", description: st.optimizationApplied ? "Open a PR with environment configuration and agent optimization changes." : "Open a PR with environment configuration changes.", onClick: onOpenPrModal },
          { label: "Continue exploring", description: "Keep reviewing the setup without creating a pull request yet.", onClick: () => {} },
        ]}
      />
    )
  } else if (st.state === "COMPLETION_ACTIONS" && nextCard && nextCard.kind === "next_steps") {
    activeQuestion = (
      <QuestionWidget
        question="What would you like to do next?"
        answers={[
          { label: nextCard.createPrLabel, onClick: onOpenPrModal },
          { label: "Continue to Agent Optimization", description: nextCard.continueDisabled ? "Not available yet" : undefined, onClick: nextCard.continueDisabled ? undefined : () => {} },
        ]}
      />
    )
  }

  // Reveal new messages one at a time with streaming text
  const [revealedCount, setRevealedCount] = useState(chatMessages.length)
  const totalCount = chatMessages.length

  useEffect(() => {
    if (revealedCount < totalCount) {
      const msg = chatMessages[revealedCount]
      if (msg.role === "user" || typeof msg.content !== "string") {
        // Pause briefly before showing non-text messages
        const delay = msg.role === "user" ? 100 : 400
        const timer = setTimeout(() => setRevealedCount((c) => c + 1), delay)
        return () => clearTimeout(timer)
      }
    }
  }, [revealedCount, totalCount])

  // Only show messages up to revealedCount + 1 (the one currently streaming)
  const visibleMessages = chatMessages.slice(0, revealedCount + 1)

  // Stream the latest new text message
  if (revealedCount < totalCount) {
    const streamingMsg = visibleMessages[visibleMessages.length - 1]
    if (streamingMsg && streamingMsg.role === "assistant" && typeof streamingMsg.content === "string") {
      const text = streamingMsg.content
      visibleMessages[visibleMessages.length - 1] = {
        ...streamingMsg,
        content: <StreamText text={text} onComplete={() => setRevealedCount((c) => c + 1)} />,
      }
    }
  }

  const allRevealed = revealedCount >= totalCount
  return { chatMessages: visibleMessages, activeQuestion: allRevealed ? activeQuestion : null }
}

// ============================================================================
// Resize Handle
// ============================================================================

function ResizeHandle() {
  const lineRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = lineRef.current
    const wrapper = wrapperRef.current
    if (!el || !wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const pct = Math.min(80, Math.max(20, ((e.clientY - rect.top) / rect.height) * 100))
    el.style.background = `linear-gradient(to bottom, transparent ${pct - 20}%, var(--fleet-border-focused, #fff) ${pct}%, transparent ${pct + 20}%)`
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="w-2 shrink-0 relative group cursor-col-resize"
      onMouseMove={handleMouseMove}
    >
      <PanelResizeHandle className="absolute inset-0" />
      <div
        ref={lineRef}
        className="absolute inset-y-0 left-[3px] w-px opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none"
      />
    </div>
  )
}

// ============================================================================
// Page Component
// ============================================================================

type View = "splash" | "setup"

export default function ProjectSetupPage() {
  const [view, setView] = useState<View>("setup")
  const { state: st, onStart, onAddSecret, onSkipTests, onEnvConfigChoice, onOptimizationChoice, reset, setDetailsPanelOpen, setPrModalOpen, setOptimizationPanelOpen, onCreatePr } = useSetupFlow()

  const startedRef = useRef(false)
  useEffect(() => { if (!startedRef.current) { startedRef.current = true; onStart() } }, [])

  const handleSplashStart = () => { setView("setup"); onStart() }
  const handleSplashCancel = () => { reset(); setView("splash") }

  const [sidebarPinned, setSidebarPinned] = useState(false)

  const SIDEBAR_TASKS = {
    "my-project-repo": [
      { id: "setup-1", title: "Project setup", description: "Configure cloud environment", status: "running" as const },
    ],
  }

  const [rightTab, setRightTab] = useState("progress")

  const { chatMessages, activeQuestion } = useExecutionMessages({
    st, onAddSecret, onSkipTests, onEnvConfigChoice, onOptimizationChoice,
    onViewDetails: () => setDetailsPanelOpen(true),
    onViewLogs: () => setDetailsPanelOpen(true),
    onViewOptimizationReport: () => setRightTab("report"),
    onOpenPrModal: () => setPrModalOpen(true),
  })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CUSTOM_CSS }} />
      <WebAppLayout
        className="h-screen overflow-clip items-stretch p-2"
        style={{
          ["--layout-padding" as string]: "16px",
          ["--layout-gap" as string]: "8px",
          ["--nav-width-collapsed" as string]: "40px",
          ["--nav-width-expanded" as string]: "300px",
          ["--second-level-navigation-width" as string]: "300px",
        }}
      >
        <WebSidebar
          alwaysExpanded={sidebarPinned}
          onTogglePin={() => setSidebarPinned((p) => !p)}
          taskGroups={SIDEBAR_TASKS}
        />
        {view === "splash" ? (
          <WebAppLayout.Island main isEmpty>
            <SplashScreen onStart={handleSplashStart} onCancel={handleSplashCancel} />
          </WebAppLayout.Island>
        ) : (
          <PanelGroup direction="horizontal" className="flex-1 !gap-0">
            <Panel defaultSize={66} minSize={30}>
              <ChatIsland
                className="h-full"
                messages={chatMessages}
                contextPreview={
                  activeQuestion ? (
                    <div key={String(activeQuestion)} className="animate-slide-up">
                      {activeQuestion}
                    </div>
                  ) : null
                }
                chatInputProps={{
                  onSend: () => {},
                  placeholder: "Ask a follow-up…",
                  modelName: "Sonnet 4.6",
                  permissionMode: "Ask Permission",
                }}
              />
            </Panel>
            <ResizeHandle />
            <Panel defaultSize={34} minSize={15}>
              <IslandWithTabs className="h-full">
                <Tabs value={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
                  <TabBar>
                    <TabsList>
                      <TabsTrigger value="progress">Progress</TabsTrigger>
                      <TabsTrigger value="secrets">Secrets</TabsTrigger>
                      <TabsTrigger value="changes">
                        {(() => {
                          const showEnv = CONFIG_READY_STATES.includes(st.state)
                          const showOpt = st.state === "AGENT_OPT_COMPLETE" && st.optimizationApplied
                          const files = [...(showEnv ? ENV_CONFIG_FILES : []), ...(showOpt ? OPT_FILES : [])]
                          if (files.length === 0) return "Changes"
                          const added = files.reduce((s, f) => s + f.added, 0)
                          const removed = files.reduce((s, f) => s + f.removed, 0)
                          return <>Changes <span className="text-[11px]"><span style={{ color: "var(--fleet-git-text-added)" }}>+{added}</span>{removed > 0 && <> <span style={{ color: "var(--fleet-git-text-deleted, #f87c88)" }}>-{removed}</span></>}</span></>
                        })()}
                      </TabsTrigger>
                      {["AGENT_OPT_REPORT_READY", "AGENT_OPT_APPLYING", "AGENT_OPT_COMPLETE"].includes(st.state) && st.optimizationReportVisible && (
                        <TabsTrigger value="report">Report</TabsTrigger>
                      )}
                    </TabsList>
                  </TabBar>
                  <TabContentArea>
                    <TabsContent value="progress" className="h-full m-0 overflow-auto">
                      <ProgressTabContent state={st.state} />
                    </TabsContent>
                    <TabsContent value="secrets" className="h-full m-0 overflow-auto">
                      <SecretsForm appSecrets={st.secrets} appSecretValues={st.secretValues} onAddSecret={onAddSecret} />
                    </TabsContent>
                    <TabsContent value="changes" className="h-full m-0 overflow-auto">
                      <ChangesTabContent state={st.state} optimizationApplied={st.optimizationApplied} />
                    </TabsContent>
                    <TabsContent value="report" className="h-full m-0 overflow-auto">
                      <ReportTabContent appliedCount={st.optimizationApplied ? 4 : 0} />
                    </TabsContent>
                  </TabContentArea>
                </Tabs>
              </IslandWithTabs>
            </Panel>
          </PanelGroup>
        )}
        {st.prModalOpen && <PRModal st={st} onClose={() => setPrModalOpen(false)} onCreatePr={onCreatePr} />}
      </WebAppLayout>
    </>
  )
}

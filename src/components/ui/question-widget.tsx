"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Typography } from "./typography"
import { Button } from "./button-shadcn"
import { TextInput } from "./input"
import { SegmentedControl } from "./segmented-control"
import { AnswerBadge, AnswerOption } from "./permission-widget"

// ===== QUESTION WIDGET =====

export interface QuestionAnswer {
  label: string
  description?: string
  focused?: boolean
  onClick?: () => void
}

export interface QuestionWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Segmented control tabs */
  tabs?: string[]
  /** Currently active tab */
  activeTab?: string
  /** Tab change handler */
  onTabChange?: (tab: string) => void
  /** Question text (numbered, e.g. "1. What platform...") */
  question: string
  /** Answer options */
  answers?: QuestionAnswer[]
  /** A "type something else" placeholder as the last freeform input option */
  freeformPlaceholder?: string
  /** Called when user submits freeform text */
  onFreeformSubmit?: (value: string) => void
  /** Bottom action button */
  action?: {
    label: string
    hint?: string
    variant?: "secondary" | "primary"
    onClick?: () => void
  }
}

export const QuestionWidget = React.forwardRef<HTMLDivElement, QuestionWidgetProps>(
  ({
    className,
    tabs,
    activeTab,
    onTabChange,
    question,
    answers,
    freeformPlaceholder,
    onFreeformSubmit,
    action,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 items-end p-3 rounded-lg border",
          className,
        )}
        style={{
          background: "var(--fleet-banner-background-info, #18263c)",
          borderColor: "var(--fleet-banner-border-info, #225090)",
        }}
        {...props}
      >
        {/* Form content */}
        <div className="flex flex-col gap-4 items-start w-full">
          {/* Segmented tabs */}
          {tabs && tabs.length > 0 && activeTab && (
            <SegmentedControl.Root value={activeTab} onChange={onTabChange}>
              {tabs.map((tab) => (
                <SegmentedControl.Item key={tab} value={tab}>
                  {tab}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          )}

          {/* Question + Answers */}
          <div className="flex flex-col gap-4 items-start w-full">
            {/* Question */}
            <Typography
              variant="default"
              className="leading-4 font-semibold"
              style={{ color: "var(--fleet-text-primary)" }}
            >
              {question}
            </Typography>

            {/* Answer options */}
            {answers && answers.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                {answers.map((answer, i) => (
                  <AnswerOption
                    key={i}
                    number={i + 1}
                    focused={i === 0}
                    description={answer.description}
                    onClick={answer.onClick}
                  >
                    {answer.label}
                  </AnswerOption>
                ))}
                {freeformPlaceholder && (
                  <div className="flex gap-1.5 items-start px-0.5 w-full">
                    <div className="shrink-0 w-4 h-5 flex items-center justify-center">
                      <AnswerBadge number={answers.length + 1} />
                    </div>
                    <input
                      type="text"
                      placeholder={freeformPlaceholder}
                      className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[13px] leading-[20px] tracking-[0.052px] placeholder:text-[var(--fleet-text-secondary)]"
                      style={{ color: "var(--fleet-text-primary)" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && onFreeformSubmit) {
                          onFreeformSubmit((e.target as HTMLInputElement).value)
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom action button */}
        {action && (
          <div className="h-5 w-full relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Button
                variant={action.variant ?? "secondary"}
                size="sm"
                hintText={action.hint}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
)
QuestionWidget.displayName = "QuestionWidget"

// ===== INPUT QUESTION WIDGET =====

export interface InputQuestionWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Question/prompt text */
  question: string
  /** Placeholder for the text input */
  placeholder?: string
  /** Hint text below the input */
  hint?: string
  /** Called with the input value on submit */
  onSubmit?: (value: string) => void
  /** Called on cancel */
  onCancel?: () => void
  /** Submit button label */
  submitLabel?: string
  /** Cancel button label */
  cancelLabel?: string
}

export const InputQuestionWidget = React.forwardRef<HTMLDivElement, InputQuestionWidgetProps>(
  ({
    className,
    question,
    placeholder,
    hint,
    onSubmit,
    onCancel,
    submitLabel = "Submit",
    cancelLabel = "Cancel",
    ...props
  }, ref) => {
    const [value, setValue] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      requestAnimationFrame(() => inputRef.current?.focus())
    }, [])

    const handleSubmit = () => {
      if (onSubmit) onSubmit(value)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleSubmit()
      } else if (e.key === "Escape") {
        onCancel?.()
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 items-end p-3 rounded-lg border",
          className,
        )}
        style={{
          background: "var(--fleet-banner-background-info, #18263c)",
          borderColor: "var(--fleet-banner-border-info, #225090)",
        }}
        {...props}
      >
        {/* Form */}
        <div className="flex flex-col gap-4 items-start w-full">
          <div className="flex flex-col gap-2 w-full">
            <Typography
              variant="default"
              className="leading-4 font-semibold"
              style={{ color: "var(--fleet-text-primary)" }}
            >
              {question}
            </Typography>

            <div className="flex flex-col gap-1 w-full">
              <TextInput
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
              />
              {hint && (
                <Typography
                  variant="default"
                  style={{ color: "var(--fleet-text-secondary)" }}
                >
                  {hint}
                </Typography>
              )}
            </div>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="w-full flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            hintText="Esc"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            hintText="⌘↵"
            onClick={handleSubmit}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    )
  },
)
InputQuestionWidget.displayName = "InputQuestionWidget"

// ===== ANSWERS SNIPPET =====

export interface AnswersSnippetEntry {
  question: string
  answer: string
}

export interface AnswersSnippetProps extends React.HTMLAttributes<HTMLDivElement> {
  entries: AnswersSnippetEntry[]
  expanded?: boolean
}

export const AnswersSnippet = React.forwardRef<HTMLDivElement, AnswersSnippetProps>(
  ({ className, entries, expanded = false, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(expanded)

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-start rounded-[6px] border min-w-[264px] max-w-[620px] cursor-pointer",
          className,
        )}
        style={{
          background: "var(--fleet-snippet-background-default, rgba(255,255,255,0.09))",
          borderColor: "var(--fleet-snippet-border-default, rgba(255,255,255,0))",
        }}
        onClick={() => setIsExpanded((e) => !e)}
        {...props}
      >
        {/* Header */}
        <div className="h-[26px] w-full flex items-center px-[3px] pt-[3px]">
          <div className="flex gap-[3px] items-center px-0.5 py-0.5 rounded">
            <div className="size-4 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4.5L6 9.5L11 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--fleet-text-secondary)" }} />
              </svg>
            </div>
            <Typography variant="default" style={{ color: "var(--fleet-text-primary)" }}>
              Answers
            </Typography>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="w-full px-[3px] pb-[3px]">
            <div
              className="w-full rounded px-2 py-1 flex flex-col gap-2 overflow-clip border"
              style={{
                background: "var(--fleet-island-background, #18191b)",
                borderColor: "var(--fleet-snippet-content-border-default, rgba(255,255,255,0))",
              }}
            >
              {entries.map((entry, i) => (
                <div key={i} className="flex flex-col gap-0.5 w-full">
                  <Typography
                    variant="medium"
                    className="font-medium"
                    style={{ color: "var(--fleet-text-primary)" }}
                  >
                    {entry.question}
                  </Typography>
                  <Typography
                    variant="medium"
                    style={{ color: "var(--fleet-text-secondary)" }}
                  >
                    {entry.answer}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  },
)
AnswersSnippet.displayName = "AnswersSnippet"

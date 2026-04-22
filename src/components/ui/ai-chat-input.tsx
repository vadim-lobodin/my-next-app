"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Typography } from "./typography"
import { Button } from "./button-shadcn"

// ===== FIGMA: AI Chat Input =====
// Structure: Plan Widget (optional) + Input wrapper (focus border + background + textarea + bottom bar)
// Figma vars: chat-input/corner-radius=8, background=#18191b, text-area bg=#090909, text-area corner-radius=4
// Focus: border=#2a7deb, outline=#224271
// Shadow: 0 0 1px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.25)

export interface AiChatInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSend?: (message: string) => void
  onStop?: () => void
  isSending?: boolean
  modelName?: string
  modelIcon?: string
  onModelClick?: () => void
  permissionMode?: string
  onPermissionClick?: () => void
  onAddContext?: () => void
  onReasoningClick?: () => void
  reasoningLevel?: "low" | "medium" | "high"
  focused?: boolean
  disabled?: boolean
  minimal?: boolean
  className?: string
}

export const AiChatInput = React.forwardRef<HTMLDivElement, AiChatInputProps>(
  ({
    placeholder = "Follow-up on this task, @ for mentions, / for commands",
    value: externalValue,
    onChange: externalOnChange,
    onSend,
    onStop,
    isSending = false,
    modelName = "Sonnet 4.6",
    modelIcon = "claude-code-gray",
    onModelClick,
    permissionMode = "Ask Permission",
    onPermissionClick,
    onAddContext,
    onReasoningClick,
    reasoningLevel = "medium",
    focused: externalFocused,
    disabled = false,
    minimal = false,
    className,
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState("")
    const [internalFocused, setInternalFocused] = React.useState(true)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const value = externalValue ?? internalValue
    const focused = externalFocused ?? internalFocused

    React.useEffect(() => {
      textareaRef.current?.focus()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (externalOnChange) {
        externalOnChange(newValue)
      } else {
        setInternalValue(newValue)
      }
    }

    const handleSend = () => {
      if (!value.trim() || isSending) return
      onSend?.(value)
      if (!externalOnChange) setInternalValue("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (isSending) {
          onStop?.()
        } else {
          handleSend()
        }
      }
    }

    return (
      <div ref={ref} className={cn("flex flex-col items-start w-full", className)}>
        {/* Figma: wrapper has min-h 108px, focusOutline border wraps the input */}
        <div
          className="flex flex-col items-start overflow-clip w-full"
          style={{
            borderRadius: 'var(--fleet-radius-lg)',
            border: focused
              ? '1px solid var(--fleet-inputField-focusBorder-default)'
              : '1px solid transparent',
          }}
        >
          {/* Figma: Input — bg #18191b, rounded 8, shadow, px 8, pt 8, pb 2, gap 2px */}
          <div
            className="flex flex-col items-start w-full px-2 pt-2 pb-0.5 gap-0.5"
            style={{
              background: 'var(--fleet-ai-chat-input-background-default)',
              borderRadius: 'var(--fleet-radius-lg)',
              border: focused
                ? '2px solid var(--fleet-inputField-focusOutline-default)'
                : '2px solid transparent',
              outline: focused
                ? 'none'
                : '1px solid var(--fleet-inputField-border-default)',
              outlineOffset: -2,
              boxShadow: 'var(--fleet-shadow-sm)',
            }}
          >
            {/* Text area — Figma: bg=#090909, corner-radius=4, padding=8 */}
            <div
              className="flex gap-2.5 items-start w-full p-2"
              style={{
                background: 'var(--fleet-inputField-ai-background-default)',
                border: '0.5px solid var(--fleet-inputField-ai-border-default)',
                borderRadius: 'var(--fleet-radius-sm)',
              }}
            >
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setInternalFocused(true)}
                onBlur={() => setInternalFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 bg-transparent border-none outline-none resize-none min-h-[60px] max-h-[200px] text-default leading-default font-body-regular tracking-default"
                style={{ color: 'var(--fleet-text-primary)' }}
              />
              {!minimal && (
                <button
                  aria-label="Expand input"
                  className="flex items-center rounded-[var(--fleet-radius-xs)] shrink-0 transition-colors hover:bg-[var(--fleet-ghostButton-off-background-hovered)] bg-transparent border border-transparent p-0.5"
                >
                  <Icon fleet="expand-all" size="sm" className="opacity-40" />
                </button>
              )}
            </div>

            {/* Bottom bar — Figma: _InputBottomBar, h=32px, py=4px, justify-between */}
            <div className="flex items-center justify-between w-full h-8 py-1">
              {/* Left toolbar */}
              <div className="flex gap-1.5 items-center">
                {/* Add to context — Figma: ghost-button padding=2px, radius=3px */}
                <button
                  aria-label="Add to context"
                  className="flex items-center rounded-[var(--fleet-radius-xs)] transition-colors hover:bg-[var(--fleet-ghostButton-off-background-hovered)] bg-transparent border border-transparent p-0.5"
                  onClick={onAddContext}
                >
                  <Icon fleet="add" size="sm" />
                </button>

                {/* Separator — Figma: toolbar/separator/padding top/bottom=2px */}
                <div className="flex items-stretch self-stretch py-0.5">
                  <div className="w-px h-full" style={{ background: 'var(--fleet-separator-default)' }} />
                </div>

                {/* Model selector */}
                <button
                  aria-label="Select model"
                  className="flex gap-0.5 items-center rounded-[var(--fleet-radius-sm)] transition-colors hover:bg-[var(--fleet-ghostButton-off-background-hovered)] py-0.5 pr-0.5 pl-1 max-w-[422px]"
                  onClick={onModelClick}
                  disabled={minimal}
                >
                  {modelIcon && <Icon fleet={modelIcon} size="sm" />}
                  <Typography
                    variant="default"
                    className="whitespace-nowrap"
                    style={{ color: 'var(--fleet-text-secondary)' }}
                  >
                    {modelName}
                  </Typography>
                  <Icon fleet="chevron-down" size="sm" className="opacity-40" />
                </button>
              </div>

              {/* Right toolbar */}
              <div className="flex gap-1.5 items-center">
                {!minimal && (
                  <>
                    {/* Permission mode */}
                    <button
                      aria-label="Select permission mode"
                      className="flex gap-0.5 items-center rounded-[var(--fleet-radius-sm)] transition-colors hover:bg-[var(--fleet-ghostButton-off-background-hovered)] py-0.5 pr-0.5 pl-1 max-w-[422px]"
                      onClick={onPermissionClick}
                    >
                      <Typography
                        variant="default"
                        className="whitespace-nowrap"
                        style={{ color: 'var(--fleet-text-secondary)' }}
                      >
                        {permissionMode}
                      </Typography>
                      <Icon fleet="chevron-down" size="sm" className="opacity-40" />
                    </button>

                    {/* Separator — Figma: toolbar/separator/padding top/bottom=2px */}
                    <div className="flex items-stretch self-stretch py-0.5">
                      <div className="w-px h-full" style={{ background: 'var(--fleet-separator-default)' }} />
                    </div>

                    {/* Reasoning toggle — Figma: ghost-button padding=6px, radius=4px */}
                    <button
                      aria-label="Toggle reasoning"
                      className="flex items-center rounded-[var(--fleet-radius-sm)] transition-colors hover:bg-[var(--fleet-ghostButton-off-background-hovered)] bg-transparent border border-transparent p-1.5"
                      onClick={onReasoningClick}
                    >
                      <Icon fleet="thinking" size="sm" />
                    </button>
                  </>
                )}

                {/* Send button */}
                <Button
                  variant="primary"
                  hintText={isSending ? "⎋" : "↩︎"}
                  onClick={() => isSending ? onStop?.() : handleSend()}
                  disabled={disabled || (!value.trim() && !isSending)}
                >
                  {isSending ? "Stop" : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

AiChatInput.displayName = "AiChatInput"

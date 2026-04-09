"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Typography } from "./typography"

// ─── Types ───────────────────────────────────────────────────────────────────

export type SelectionCardStatus = "default" | "selected" | "success" | "error"

const SelectionCardContext = React.createContext<SelectionCardStatus>("default")

export interface SelectionCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: SelectionCardStatus
  disabled?: boolean
}

export interface SelectionCardTitleProps extends React.HTMLAttributes<HTMLSpanElement> {}
export interface SelectionCardDescriptionProps extends React.HTMLAttributes<HTMLSpanElement> {}
export interface SelectionCardLabelProps extends React.HTMLAttributes<HTMLSpanElement> {}
export interface SelectionCardTextProps extends React.HTMLAttributes<HTMLDivElement> {}

// ─── Status styles ───────────────────────────────────────────────────────────

const statusStyles: Record<SelectionCardStatus, string> = {
  default: [
    "border-[var(--fleet-tileButton-off-border-default)]",
    "bg-[var(--fleet-tileButton-off-background-default)]",
    "hover:not-disabled:border-[var(--fleet-tileButton-off-border-hovered)]",
    "hover:not-disabled:bg-[var(--fleet-tileButton-off-background-hovered)]",
    "active:not-disabled:border-[var(--fleet-tileButton-off-border-pressed)]",
    "active:not-disabled:bg-[var(--fleet-tileButton-off-background-pressed)]",
  ].join(" "),
  selected: [
    "border-[var(--fleet-tileButton-on-border-default)]",
    "bg-[var(--fleet-tileButton-on-background-default)]",
    "hover:not-disabled:border-[var(--fleet-tileButton-on-border-hovered)]",
    "hover:not-disabled:bg-[var(--fleet-tileButton-on-background-hovered)]",
  ].join(" "),
  success: [
    "border-[var(--fleet-git-text-added,#69b090)]",
    "bg-[rgba(105,176,144,0.1)]",
    "hover:not-disabled:border-[var(--fleet-git-text-added,#69b090)]",
    "hover:not-disabled:bg-[rgba(105,176,144,0.15)]",
  ].join(" "),
  error: [
    "border-[var(--fleet-git-text-deleted,#f87c88)]",
    "bg-[rgba(248,124,136,0.1)]",
    "hover:not-disabled:border-[var(--fleet-git-text-deleted,#f87c88)]",
    "hover:not-disabled:bg-[rgba(248,124,136,0.15)]",
  ].join(" "),
}

const labelColorStyles: Record<SelectionCardStatus, string> = {
  default: "text-[var(--fleet-text-primary)]",
  selected: "text-[var(--fleet-link-text-default,#6b9eff)]",
  success: "text-[var(--fleet-git-text-added,#69b090)]",
  error: "text-[var(--fleet-git-text-deleted,#f87c88)]",
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const SelectionCardRoot = React.forwardRef<HTMLDivElement, SelectionCardRootProps>(
  ({ status = "default", disabled = false, children, className, ...props }, ref) => (
    <SelectionCardContext.Provider value={status}>
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-start overflow-clip box-border",
          "p-3 gap-2.5 rounded-[12px] border cursor-pointer select-none",
          "transition-colors",
          statusStyles[status],
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        aria-disabled={disabled || undefined}
        {...props}
      >
        {children}
      </div>
    </SelectionCardContext.Provider>
  ),
)
SelectionCardRoot.displayName = "SelectionCard"

const SelectionCardTitle: React.FC<SelectionCardTitleProps> = ({ children, className, ...props }) => (
  <Typography
    variant="default-semibold"
    as="span"
    className={cn(className)}
    style={{ color: "var(--fleet-text-primary)" }}
    {...props}
  >
    {children}
  </Typography>
)
SelectionCardTitle.displayName = "SelectionCard.Title"

const SelectionCardDescription: React.FC<SelectionCardDescriptionProps> = ({ children, className, ...props }) => (
  <Typography
    variant="default"
    as="span"
    className={cn(className)}
    style={{ color: "var(--fleet-text-secondary)" }}
    {...props}
  >
    {children}
  </Typography>
)
SelectionCardDescription.displayName = "SelectionCard.Description"

const SelectionCardLabel: React.FC<SelectionCardLabelProps> = ({ children, className, ...props }) => {
  const status = React.useContext(SelectionCardContext)
  return (
    <Typography
      variant="default"
      as="span"
      className={cn(labelColorStyles[status], className)}
      {...props}
    >
      {children}
    </Typography>
  )
}
SelectionCardLabel.displayName = "SelectionCard.Label"

const SelectionCardText: React.FC<SelectionCardTextProps> = ({ children, className, ...props }) => (
  <div className={cn("flex flex-col gap-1 w-full", className)} {...props}>
    {children}
  </div>
)
SelectionCardText.displayName = "SelectionCard.Text"

// ─── Compound Export ─────────────────────────────────────────────────────────

export const SelectionCard = {
  Root: SelectionCardRoot,
  Text: SelectionCardText,
  Title: SelectionCardTitle,
  Description: SelectionCardDescription,
  Label: SelectionCardLabel,
}

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Typography } from "./typography"

// ─── Types ───────────────────────────────────────────────────────────────────

export type PageTemplateVariant = "main" | "main-centered" | "default" | "empty"

export interface PageTemplateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout variant */
  variant?: PageTemplateVariant
  /** Page title */
  title?: string
  /** Page subtitle */
  subtitle?: string
  /** Whether content stretches full width or is constrained to max-w-600 */
  fullWidth?: boolean
}

export interface PageTemplateHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface PageTemplateContentProps extends React.HTMLAttributes<HTMLDivElement> {}

// ─── Sub-components ──────────────────────────────────────────────────────────

const PageTemplateHeader = React.forwardRef<HTMLDivElement, PageTemplateHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 items-start max-w-[600px] w-full", className)}
      {...props}
    >
      {children}
    </div>
  ),
)
PageTemplateHeader.displayName = "PageTemplate.Header"

const PageTemplateContent = React.forwardRef<HTMLDivElement, PageTemplateContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col flex-1 w-full max-w-[600px]", className)}
      {...props}
    >
      {children}
    </div>
  ),
)
PageTemplateContent.displayName = "PageTemplate.Content"

// ─── Variant config ──────────────────────────────────────────────────────────

const variantStyles: Record<PageTemplateVariant, string> = {
  "main": "pt-[100px] items-center",
  "main-centered": "pt-[240px] items-center",
  "default": "pt-4 items-start",
  "empty": "items-center justify-center",
}

// ─── Root ────────────────────────────────────────────────────────────────────

const PageTemplateRoot = React.forwardRef<HTMLDivElement, PageTemplateProps>(
  ({ variant = "main", title, subtitle, fullWidth = true, className, children, ...props }, ref) => {
    const isKomuna = variant === "main" || variant === "main-centered"

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col flex-1 min-w-0 min-h-0 overflow-clip px-4",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {(title || subtitle) && (
          <PageTemplateHeader>
            {title && (
              <div className="flex items-center justify-between w-full">
                <Typography
                  variant={isKomuna ? "komuna-h1" : "header-2-semibold"}
                  className="flex-1"
                >
                  {title}
                </Typography>
              </div>
            )}
            {subtitle && (
              <Typography variant="default" className="w-full" style={{ color: "var(--fleet-text-secondary)" }}>
                {subtitle}
              </Typography>
            )}
          </PageTemplateHeader>
        )}
        {children}
      </div>
    )
  },
)
PageTemplateRoot.displayName = "PageTemplate"

// ─── Compound Export ─────────────────────────────────────────────────────────

export const PageTemplate = Object.assign(PageTemplateRoot, {
  Header: PageTemplateHeader,
  Content: PageTemplateContent,
})

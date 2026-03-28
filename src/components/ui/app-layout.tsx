"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ─── CSS Variable Tokens ─────────────────────────────────────────────────────
// --nav-width-collapsed: 68px
// --nav-width-expanded: 232px
// --second-level-navigation-width: 232px
// --layout-padding: 16px
// --layout-gap: 8px

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WebAppLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show left margin for a fixed navigation sidebar */
  withNavigation?: boolean
  /** Whether the navigation sidebar is expanded */
  expanded?: boolean
}

export interface WebAppLayoutIslandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render as <main> element */
  main?: boolean
  /** Empty state — transparent background, no padding */
  isEmpty?: boolean
}

export interface WebAppLayoutSecondLevelNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface WebAppLayoutSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed width in px (default: 332) */
  width?: number
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const WebAppLayoutNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
)
WebAppLayoutNavigation.displayName = "WebAppLayout.Navigation"

const WebAppLayoutIsland = React.forwardRef<HTMLDivElement, WebAppLayoutIslandProps>(
  ({ className, main, isEmpty, children, ...props }, ref) => {
    const classes = cn(
      "overflow-hidden flex-1 min-w-0 min-h-0 p-[var(--layout-padding)] rounded-lg bg-[var(--fleet-island-background)]",
      isEmpty && "p-0 bg-transparent",
      className,
    )

    if (main) {
      return (
        <main
          ref={ref as React.Ref<HTMLElement>}
          className={cn(classes, "flex flex-col min-w-[500px] isolate")}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </main>
      )
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  },
)
WebAppLayoutIsland.displayName = "WebAppLayout.Island"

const WebAppLayoutSecondLevelNav = React.forwardRef<HTMLDivElement, WebAppLayoutSecondLevelNavProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed z-[2] top-[var(--layout-padding)] bottom-[var(--layout-padding)] left-[var(--nav-width-collapsed)]",
        "flex-shrink-0 w-[var(--second-level-navigation-width)] p-[var(--layout-padding)]",
        "rounded-lg bg-[var(--fleet-island-background)]",
        className,
      )}
      data-layout="second-level-nav"
      {...props}
    >
      {children}
    </div>
  ),
)
WebAppLayoutSecondLevelNav.displayName = "WebAppLayout.SecondLevelNav"

/** Generic sidebar panel for two-column layouts (e.g. automations list, settings nav) */
const WebAppLayoutSidebar = React.forwardRef<HTMLDivElement, WebAppLayoutSidebarProps>(
  ({ className, width = 332, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex-shrink-0 p-[var(--layout-padding)] rounded-lg bg-[var(--fleet-island-background)]",
        className,
      )}
      style={{ width }}
      {...props}
    >
      {children}
    </div>
  ),
)
WebAppLayoutSidebar.displayName = "WebAppLayout.Sidebar"

/** Content area that fills remaining space in a two-column layout */
const WebAppLayoutContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex-1 min-w-0 min-h-0 p-[var(--layout-padding)] rounded-lg bg-[var(--fleet-island-background)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)
WebAppLayoutContent.displayName = "WebAppLayout.Content"

// ─── Root ────────────────────────────────────────────────────────────────────

function WebAppLayoutRoot({
  children,
  withNavigation,
  expanded,
  className,
  ...props
}: WebAppLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-1 min-w-fit min-h-0 p-[var(--layout-gap)] gap-[var(--layout-gap)] bg-[var(--fleet-background-primary)]",
        withNavigation && "ml-[var(--nav-width-collapsed)] pl-0 transition-[margin-left] duration-150 ease-in-out",
        withNavigation && expanded && "ml-[var(--nav-width-expanded)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── Compound Export ─────────────────────────────────────────────────────────

export const WebAppLayout = Object.assign(WebAppLayoutRoot, {
  Navigation: WebAppLayoutNavigation,
  Island: WebAppLayoutIsland,
  SecondLevelNav: WebAppLayoutSecondLevelNav,
  Sidebar: WebAppLayoutSidebar,
  Content: WebAppLayoutContent,
})

/** @deprecated Use WebAppLayout instead */
export const AppLayout = WebAppLayout

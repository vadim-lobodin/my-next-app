"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"


// ─── Navigation Context ──────────────────────────────────────────────────────

interface NavigationContextValue {
  readonly expanded: boolean
  /** Whether the sidebar is pinned open (alwaysExpanded), not just floating */
  readonly pinned: boolean
  readonly lockExpanded: () => void
  readonly unlockExpanded: () => void
}

const NavigationExpandedContext = React.createContext<NavigationContextValue>({
  expanded: false,
  pinned: false,
  lockExpanded: () => {},
  unlockExpanded: () => {},
})

export function useNavigationExpanded() {
  return React.useContext(NavigationExpandedContext).expanded
}

/** Whether the sidebar is pinned open (not just floating on hover) */
export function useNavigationPinned() {
  return React.useContext(NavigationExpandedContext).pinned
}

export function useNavigationLock() {
  const { lockExpanded, unlockExpanded } = React.useContext(NavigationExpandedContext)
  return { lockExpanded, unlockExpanded }
}

// ─── NavigationItem ──────────────────────────────────────────────────────────

interface NavItemContextValue {
  readonly isActive?: boolean
  readonly compact?: boolean
}

const NavItemContext = React.createContext<NavItemContextValue | null>(null)

interface NavigationItemBaseProps {
  children: React.ReactNode
  isActive?: boolean
  compact?: boolean
  className?: string
}

interface NavigationItemButtonProps
  extends NavigationItemBaseProps,
    Omit<React.ComponentPropsWithoutRef<"button">, keyof NavigationItemBaseProps> {
  as?: "button"
}

interface NavigationItemAnchorProps
  extends NavigationItemBaseProps,
    Omit<React.ComponentPropsWithoutRef<"a">, keyof NavigationItemBaseProps> {
  as: "a"
}

export type NavigationItemProps = NavigationItemButtonProps | NavigationItemAnchorProps

function NavigationItemText({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(NavItemContext)
  if (ctx?.compact) return null
  return (
    <span
      className={cn(
        "overflow-hidden flex-1 whitespace-nowrap text-ellipsis",
        className,
      )}
    >
      {children}
    </span>
  )
}

const NavigationItemRoot = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  NavigationItemProps
>(({ children, isActive, compact, as: Component = "button", className, ...props }, ref) => {
  const classes = cn(
    // Reset browser button/anchor defaults
    "appearance-none border-0 outline-none no-underline",
    // Figma: list item — pl=8, pr=8, no vertical padding on outer, gap=6 icon-to-text
    // Height 32px comes from inner text py-8 + 16px line-height
    "relative flex items-center w-full h-[32px] box-border cursor-pointer select-none",
    "pl-[8px] pr-[8px] gap-[6px] rounded-[var(--fleet-selection-corner-radius,6px)]",
    "text-[13px] font-[480] leading-4 tracking-[0.052px] text-left",
    "text-[var(--fleet-text-primary)]",
    "bg-transparent",
    "hover:bg-[var(--fleet-listItem-background-hovered,rgba(255,255,255,0.09))]",
    "active:bg-[var(--fleet-listItem-background-pressed,rgba(255,255,255,0.13))]",
    isActive && "bg-[#ffffff21]",
    // Compact: 32x32, rounded-4px, centered
    compact && "justify-center items-center !w-[32px] h-[32px] py-0 px-0 gap-0 rounded-[4px]",
    className,
  )

  const contextValue: NavItemContextValue = { isActive, compact }

  if (Component === "a") {
    return (
      <NavItemContext.Provider value={contextValue}>
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      </NavItemContext.Provider>
    )
  }

  return (
    <NavItemContext.Provider value={contextValue}>
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    </NavItemContext.Provider>
  )
})
NavigationItemRoot.displayName = "NavigationItem"

export const NavigationItem = Object.assign(NavigationItemRoot, {
  Text: NavigationItemText,
})

// ─── Navigation Sub-components ───────────────────────────────────────────────

interface NavigationChildProps {
  children: React.ReactNode
  className?: string
}

function NavigationLogo({ children, className }: NavigationChildProps) {
  return (
    <div className={cn("flex items-center justify-center flex-shrink-0 w-full text-white rounded", className)}>
      {children}
    </div>
  )
}

function NavigationTop({ children, className }: NavigationChildProps) {
  return <div className={cn("flex flex-col gap-3 flex-shrink-0 min-h-0 flex-1", className)}>{children}</div>
}

function NavigationBottom({ children, className }: NavigationChildProps) {
  return <div className={cn("flex flex-col gap-1 flex-shrink-0", className)}>{children}</div>
}

function NavigationItems({ children, className }: NavigationChildProps) {
  return <div className={cn("flex flex-col gap-[2px]", className)}>{children}</div>
}

// ─── useIsNarrow Hook ────────────────────────────────────────────────────────

function useIsNarrow(breakpoint = 1000) {
  const [narrow, setNarrow] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  )

  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches)
    setNarrow(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [breakpoint])

  return narrow
}

// ─── Navigation Root ─────────────────────────────────────────────────────────

export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  /** Whether the sidebar is pinned open */
  alwaysExpanded?: boolean
}

function NavigationRoot({ children, className, alwaysExpanded, ...props }: NavigationProps) {
  const lockExpanded = React.useCallback(() => {}, [])
  const unlockExpanded = React.useCallback(() => {}, [])

  const isNarrow = useIsNarrow()

  // When pinned on narrow screen: show collapsed + floating
  // When pinned on wide screen: expand in-flow
  // When not pinned: always collapsed
  const expandInFlow = !!alwaysExpanded && !isNarrow
  const showFloating = !!alwaysExpanded && isNarrow
  const expanded = expandInFlow || showFloating

  const contextValue = React.useMemo(
    () => ({ expanded, pinned: !!alwaysExpanded, lockExpanded, unlockExpanded }),
    [expanded, alwaysExpanded, lockExpanded, unlockExpanded],
  )

  // Figma sidebar: pt-[4px] px-[4px] gap-[4px] rounded-[8px]
  const sidebarClasses = "flex flex-col gap-1 pt-1 px-1 rounded-[8px] overflow-hidden"
  const ease = [0.25, 0.1, 0.25, 1] as const

  return (
    <NavigationExpandedContext.Provider value={contextValue}>
      {/* In-flow sidebar — animates width between collapsed and expanded */}
      <motion.nav
        initial={false}
        animate={{
          width: expandInFlow ? "var(--nav-width-expanded)" : "var(--nav-width-collapsed)",
          opacity: expandInFlow ? [0.5, 1] : [0.5, 1],
        }}
        transition={{ duration: 0.2, ease }}
        className={cn(
          "flex-shrink-0 h-full box-border",
          sidebarClasses,
          className,
        )}
        {...(props as React.HTMLAttributes<HTMLElement>)}
      >
        {expandInFlow ? (
          children
        ) : (
          <NavigationExpandedContext.Provider value={{ expanded: false, pinned: false, lockExpanded, unlockExpanded }}>
            {children}
          </NavigationExpandedContext.Provider>
        )}
      </motion.nav>

      {/* Floating panel — shown when pinned on narrow screens */}
      <AnimatePresence>
        {showFloating && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "fixed z-[100] top-[var(--layout-gap,8px)] bottom-[var(--layout-gap,8px)] left-[var(--layout-gap,8px)]",
              "w-[var(--nav-width-expanded)]",
              sidebarClasses,
              "border border-white/[0.06] bg-[rgba(24,25,27,0.5)] backdrop-blur-[40px] shadow-xl",
            )}
          >
            {children}
          </motion.nav>
        )}
      </AnimatePresence>
    </NavigationExpandedContext.Provider>
  )
}

// ─── Compound Export ─────────────────────────────────────────────────────────

export const Navigation = Object.assign(NavigationRoot, {
  Logo: NavigationLogo,
  Top: NavigationTop,
  Bottom: NavigationBottom,
  Items: NavigationItems,
})

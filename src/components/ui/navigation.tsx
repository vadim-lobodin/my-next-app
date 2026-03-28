"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"

// ─── useHoverPanel Hook ──────────────────────────────────────────────────────

interface HoverPanelOptions {
  openDelay?: number
  closeDelay?: number
}

function useHoverPanel(options?: HoverPanelOptions) {
  const openDelay = options?.openDelay ?? 200
  const closeDelay = options?.closeDelay ?? 350

  const [isOpen, setIsOpen] = React.useState(false)
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const lockCountRef = React.useRef(0)

  const clearOpenTimer = React.useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const handlePointerEnter = React.useCallback(() => {
    clearCloseTimer()
    if (!isOpen) {
      clearOpenTimer()
      openTimerRef.current = setTimeout(() => {
        setIsOpen(true)
        openTimerRef.current = null
      }, openDelay)
    }
  }, [isOpen, openDelay, clearCloseTimer, clearOpenTimer])

  const handlePointerLeave = React.useCallback(() => {
    clearOpenTimer()
    if (isOpen && lockCountRef.current === 0) {
      clearCloseTimer()
      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false)
        closeTimerRef.current = null
      }, closeDelay)
    }
  }, [isOpen, closeDelay, clearOpenTimer, clearCloseTimer])

  const close = React.useCallback(() => {
    if (lockCountRef.current > 0) return
    clearOpenTimer()
    clearCloseTimer()
    setIsOpen(false)
  }, [clearOpenTimer, clearCloseTimer])

  const lockExpanded = React.useCallback(() => {
    lockCountRef.current += 1
    clearCloseTimer()
  }, [clearCloseTimer])

  const unlockExpanded = React.useCallback(() => {
    lockCountRef.current = Math.max(0, lockCountRef.current - 1)
    if (lockCountRef.current === 0 && panelRef.current) {
      const hovered = panelRef.current.matches(":hover")
      if (!hovered) {
        clearCloseTimer()
        closeTimerRef.current = setTimeout(() => {
          setIsOpen(false)
          closeTimerRef.current = null
        }, closeDelay)
      }
    }
  }, [closeDelay, clearCloseTimer])

  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, close])

  React.useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [isOpen, close])

  React.useEffect(() => {
    return () => {
      clearOpenTimer()
      clearCloseTimer()
    }
  }, [clearOpenTimer, clearCloseTimer])

  return {
    isOpen,
    panelRef,
    handlePointerEnter,
    handlePointerLeave,
    close,
    lockExpanded,
    unlockExpanded,
  }
}

// ─── Navigation Context ──────────────────────────────────────────────────────

interface NavigationContextValue {
  readonly expanded: boolean
  readonly lockExpanded: () => void
  readonly unlockExpanded: () => void
}

const NavigationExpandedContext = React.createContext<NavigationContextValue>({
  expanded: false,
  lockExpanded: () => {},
  unlockExpanded: () => {},
})

export function useNavigationExpanded() {
  return React.useContext(NavigationExpandedContext).expanded
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
        "overflow-hidden flex-1 py-1 whitespace-nowrap text-ellipsis",
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
    "flex items-center w-full min-h-[36px] box-border",
    "py-0 pr-[4px] pl-[8px] gap-[8px] rounded-[4px] cursor-pointer select-none",
    "text-[13px] font-[480] leading-[16px] tracking-[0.004em] text-left",
    "text-[var(--air-list-item-text-default,var(--fleet-text-primary))]",
    "bg-transparent",
    "hover:bg-[rgba(255,255,255,0.09)]",
    "active:bg-[rgba(255,255,255,0.13)]",
    isActive && "bg-[rgba(255,255,255,0.13)]",
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
    <div className={cn("flex items-center flex-shrink-0 w-full h-7 text-white rounded", className)}>
      {children}
    </div>
  )
}

function NavigationTop({ children, className }: NavigationChildProps) {
  return <div className={cn("flex flex-col gap-4 flex-shrink-0", className)}>{children}</div>
}

function NavigationBottom({ children, className }: NavigationChildProps) {
  return <div className={cn("flex flex-col gap-1 flex-shrink-0", className)}>{children}</div>
}

function NavigationItems({ children, className }: NavigationChildProps) {
  return <div className={cn("flex flex-col gap-1", className)}>{children}</div>
}

// ─── Navigation Root ─────────────────────────────────────────────────────────

const HOT_ZONE_INSET_RIGHT = 16

export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  alwaysExpanded?: boolean
}

function NavigationRoot({ children, className, alwaysExpanded, ...props }: NavigationProps) {
  const {
    isOpen,
    panelRef,
    handlePointerEnter,
    handlePointerLeave,
    lockExpanded,
    unlockExpanded,
  } = useHoverPanel()

  const expanded = alwaysExpanded || isOpen
  const inHotZoneRef = React.useRef(false)

  const handleNavPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (isOpen) return
      const el = panelRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const nowInHotZone = e.clientX < rect.right - HOT_ZONE_INSET_RIGHT
      const wasIn = inHotZoneRef.current
      inHotZoneRef.current = nowInHotZone
      if (nowInHotZone && !wasIn) {
        handlePointerEnter()
      }
    },
    [isOpen, handlePointerEnter, panelRef],
  )

  const handleNavPointerLeave = React.useCallback(() => {
    inHotZoneRef.current = false
    handlePointerLeave()
  }, [handlePointerLeave])

  const contextValue = React.useMemo(
    () => ({ expanded, lockExpanded, unlockExpanded }),
    [expanded, lockExpanded, unlockExpanded],
  )

  return (
    <NavigationExpandedContext.Provider value={contextValue}>
      <nav
        ref={panelRef as React.Ref<HTMLElement>}
        className={cn(
          "fixed z-[100] top-0 bottom-0 left-0 flex items-stretch box-border p-2",
          "w-[var(--nav-width-collapsed)] transition-[width] duration-150 ease-in-out",
          expanded && "w-[var(--nav-width-expanded)]",
          className,
        )}
        onPointerMove={alwaysExpanded ? undefined : handleNavPointerMove}
        onPointerLeave={alwaysExpanded ? undefined : handleNavPointerLeave}
        {...props}
      >
        <div
          className={cn(
            "flex overflow-hidden flex-1 flex-col justify-between min-w-0 min-h-0 pt-4 px-2 pb-2 rounded-lg",
            expanded && !alwaysExpanded && "border-r border-white/[0.04] bg-white/[0.04] backdrop-blur-[20px]",
          )}
        >
          {children}
        </div>
      </nav>
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

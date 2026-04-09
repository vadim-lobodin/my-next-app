"use client"

import * as React from "react"
import { FleetIcon } from "@/components/ui/icon"
import { useTheme } from "./theme-provider"

export function ThemeSwitcher() {
  const { theme, setTheme, resolved } = useTheme()

  if (!resolved) {
    // Show a loading skeleton or placeholder while theme is resolving
    return <div className="h-6 w-6 bg-muted animate-pulse rounded-[4px]" />
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center h-6 w-6 rounded-[4px] p-1 hover:bg-[var(--fleet-background-hover)] transition-colors focus:outline-none focus-visible:outline-none"
      style={{
        outline: 'none'
      }}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      <FleetIcon 
        fleet={theme === "light" ? "color-mode-dark" : "color-mode-light"} 
        size="md" 
      />
    </button>
  )
} 
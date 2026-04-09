"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"
import { getIconSvg } from "@/lib/fleet-icons-bundle"

const iconVariants = cva("inline-flex items-center justify-center", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
      "2xl": "h-10 w-10",
    },
  },
  defaultVariants: {
    size: "sm",
  },
})

export interface IconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconVariants> {
  lucide?: keyof typeof LucideIcons
  fleet?: string
  strokeWidth?: number | string
  colorize?: boolean
}

function colorizeSvgContent(svgContent: string): string {
  return svgContent
    .replace(/fill="(?!none|currentColor)[^"]*"/g, 'fill="currentColor"')
    .replace(/fill-opacity="[^"]*"/g, '')
    .replace(/fill:(?!none)\s*[^;"]+/g, 'fill:currentColor')
}

function getCurrentTheme(): 'dark' | 'light' {
  if (typeof document !== 'undefined') {
    if (document.documentElement.classList.contains('dark')) return 'dark'
    if (document.documentElement.classList.contains('light')) return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// Air Icon Component — icons are bundled, no network requests needed
export const FleetIcon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ className, size, fleet, colorize, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false)
    const [theme, setTheme] = React.useState<'dark' | 'light'>('dark')

    // Only render SVG after mount to avoid hydration mismatch
    React.useEffect(() => {
      setTheme(getCurrentTheme())
      setMounted(true)

      const observer = new MutationObserver(() => {
        setTheme(getCurrentTheme())
      })
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => setTheme(getCurrentTheme())
      mediaQuery.addEventListener('change', handleChange)

      return () => {
        observer.disconnect()
        mediaQuery.removeEventListener('change', handleChange)
      }
    }, [])

    // Render empty placeholder during SSR to avoid hydration mismatch
    if (!mounted) {
      return <div ref={ref} className={cn(iconVariants({ size }), className)} {...props} />
    }

    if (!fleet) {
      return (
        <div
          ref={ref}
          className={cn(iconVariants({ size }), "bg-destructive/20 rounded flex items-center justify-center", className)}
          title="No icon specified"
          {...props}
        >
          <span className="text-xs text-destructive">?</span>
        </div>
      )
    }

    const svgContent = getIconSvg(fleet, theme)

    if (!svgContent) {
      return (
        <div
          ref={ref}
          className={cn(iconVariants({ size }), "bg-destructive/20 rounded flex items-center justify-center", className)}
          title={`Icon not found: ${fleet}`}
          {...props}
        >
          <span className="text-xs text-destructive">?</span>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(iconVariants({ size }), className)}
        dangerouslySetInnerHTML={{ __html: colorize ? colorizeSvgContent(svgContent) : svgContent }}
        {...props}
      />
    )
  }
)
FleetIcon.displayName = "FleetIcon"

// Lucide Icon Component
export const LucideIcon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ className, size, lucide, strokeWidth = 1, colorize: _colorize, ...props }, ref) => {
    if (!lucide || !(lucide in LucideIcons)) {
      return (
        <div
          ref={ref}
          className={cn(iconVariants({ size }), "bg-destructive/20 rounded flex items-center justify-center", className)}
          title={`Lucide icon not found: ${lucide}`}
          {...props}
        >
          <span className="text-xs text-destructive">?</span>
        </div>
      )
    }

    const IconComponent = LucideIcons[lucide] as React.ComponentType<LucideIcons.LucideProps>

    return (
      <div ref={ref} className={cn(iconVariants({ size }), "text-foreground", className)} {...props}>
        <IconComponent className="w-full h-full" strokeWidth={strokeWidth} />
      </div>
    )
  }
)
LucideIcon.displayName = "LucideIcon"

// Unified Icon Component
export const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ fleet, lucide, strokeWidth, ...props }, ref) => {
    if (fleet) return <FleetIcon ref={ref} fleet={fleet} {...props} />
    if (lucide) return <LucideIcon ref={ref} lucide={lucide} strokeWidth={strokeWidth} {...props} />
    return null
  }
)
Icon.displayName = "Icon"

export { iconVariants }

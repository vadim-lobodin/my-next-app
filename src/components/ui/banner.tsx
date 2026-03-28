"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button-shadcn"
import { Icon } from "./icon"
import { Typography } from "./typography"

// ===== FIGMA: Banner Component =====
// Types: Info, Dangerous, Warning, Positive
// Variants: Regular (440px), Inline (fill parent)
// Layout: [icon] [text] [spacer] [actions: buttons/links] [close]
// Figma vars: min-h 32, radius 6, padding 0 8 0 12, icon-to-text 8, text-to-actions 12

const bannerVariants = cva(
  // Base: flex, items-center, min-h 32px, rounded 6px, padding left 12 right 8
  "flex items-center w-full overflow-hidden",
  {
    variants: {
      type: {
        info: "",
        dangerous: "",
        warning: "",
        positive: "",
      },
      inline: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      type: "info",
      inline: false,
    },
  }
)

// Type-specific styles using CSS variables (supports light/dark themes)
const typeStyles = {
  info: {
    bg: "var(--fleet-banner-background-info)",
    border: "var(--fleet-banner-border-info)",
    icon: "info",
  },
  dangerous: {
    bg: "var(--fleet-banner-background-dangerous)",
    border: "var(--fleet-banner-border-dangerous)",
    icon: "error",
  },
  warning: {
    bg: "var(--fleet-banner-background-warning)",
    border: "var(--fleet-banner-border-warning)",
    icon: "warning",
  },
  positive: {
    bg: "var(--fleet-banner-background-positive)",
    border: "var(--fleet-banner-border-positive)",
    icon: "checkmark",
  },
} as const

// Map banner type to Button variant for the primary action button
const bannerTypeToButtonVariant = {
  info: "primary",
  dangerous: "dangerous",
  warning: "warning",
  positive: "positive",
} as const

const inlineStyles = {
  bg: "var(--fleet-banner-inline-background)",
  border: "var(--fleet-banner-inline-border)",
}

export type BannerType = "info" | "dangerous" | "warning" | "positive"

export interface BannerButton {
  label: string
  onClick?: () => void
  variant?: "secondary" | "primary" // "primary" maps to banner type color (info→primary, dangerous→dangerous, etc.)
}

export interface BannerLink {
  label: string
  href?: string
  onClick?: () => void
}

export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "type">,
    VariantProps<typeof bannerVariants> {
  type?: BannerType
  inline?: boolean
  text?: string
  icon?: string
  buttons?: BannerButton[]
  links?: BannerLink[]
  closeable?: boolean
  onClose?: () => void
  children?: React.ReactNode
}

export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({
    className,
    type = "info",
    inline = false,
    text = "File has been changed on disk",
    icon: customIcon,
    buttons,
    links,
    closeable = true,
    onClose,
    children,
    ...props
  }, ref) => {
    const [visible, setVisible] = React.useState(true)
    const typeStyle = typeStyles[type]

    if (!visible) return null

    const handleClose = () => {
      setVisible(false)
      onClose?.()
    }

    const resolvedIcon = customIcon ?? typeStyle.icon

    return (
      <div
        ref={ref}
        className={cn(bannerVariants({ type, inline }), inline ? "h-8" : "h-10", "pl-3 pr-2 py-0", !inline && "w-[440px]", className)}
        style={{
          background: inline ? inlineStyles.bg : typeStyle.bg,
          border: `1px solid ${inline ? inlineStyles.border : typeStyle.border}`,
          borderRadius: 'var(--fleet-radius-md)',
          ...(!inline && {
            boxShadow: 'var(--fleet-shadow-md)',
          }),
        }}
        {...props}
      >
        {/* Icon — Figma: icon-to-text gap 8px */}
        <div className="flex items-center shrink-0 mr-2">
          <Icon fleet={resolvedIcon} size="sm" />
        </div>

        {/* Text — Figma: Default typography, flex-1 */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {children ?? (
            <Typography
              variant="default"
              className="truncate"
              style={{ color: 'var(--fleet-banner-text)' }}
            >
              {text}
            </Typography>
          )}
        </div>

        {/* Actions — Figma: text-to-actions gap 12px, between-buttons/links gap 8px */}
        {(buttons?.length || links?.length) && (
          <div className="flex items-center shrink-0 ml-3 gap-2">
            {/* Buttons */}
            {buttons?.map((button, i) => (
              <Button
                key={i}
                variant={button.variant === "primary" ? bannerTypeToButtonVariant[type] : "secondary"}
                size="default"
                onClick={button.onClick}
              >
                {button.label}
              </Button>
            ))}

            {/* Links */}
            {links?.map((link, i) => (
              <a
                key={i}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault()
                    link.onClick()
                  }
                }}
                className="whitespace-nowrap rounded-[var(--fleet-radius-xs)] transition-colors hover:underline px-1 py-0.5"
                style={{
                  color: 'var(--fleet-link-text-default)',
                }}
              >
                <Typography variant="medium" as="span">
                  {link.label}
                </Typography>
              </a>
            ))}
          </div>
        )}

        {/* Close button — Figma: ghost-button padding 2px, radius 3px */}
        {closeable && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 ml-1"
            onClick={handleClose}
            aria-label="Close banner"
            iconLeft="close"
          />
        )}
      </div>
    )
  }
)
Banner.displayName = "Banner"

export { bannerVariants }

"use client"

import * as React from "react"
import NiceAvatar, { genConfig, type NiceAvatarProps as NiceAvatarBaseProps } from "react-nice-avatar"
import { cn } from "@/lib/utils"
import { Typography } from "./typography"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** User display name */
  name: string
  /** Email or subtitle */
  email?: string
  /** Image URL — if provided, renders <img> instead of generated avatar */
  src?: string
  /** Avatar size in px (default: 28) */
  size?: number
  /** Seed string for deterministic avatar generation (defaults to name) */
  seed?: string
  /** Override react-nice-avatar config */
  avatarConfig?: Partial<NiceAvatarBaseProps>
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, email, src, size = 28, seed, avatarConfig, className, ...props }, ref) => {
    const config = React.useMemo(
      () => genConfig(seed ?? name),
      [seed, name],
    )

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <div
          className="shrink-0 overflow-hidden rounded-full"
          style={{ width: size, height: size }}
        >
          {src ? (
            <img
              src={src}
              alt={name}
              className="size-full object-cover"
            />
          ) : (
            <NiceAvatar
              style={{ width: size, height: size }}
              shape="circle"
              {...config}
              {...avatarConfig}
            />
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <Typography
            variant="default"
            className="truncate"
            style={{ color: "var(--fleet-text-primary)" }}
          >
            {name}
          </Typography>
          {email && (
            <Typography
              variant="default"
              className="truncate"
              style={{ color: "var(--fleet-text-secondary)" }}
            >
              {email}
            </Typography>
          )}
        </div>
      </div>
    )
  },
)
Avatar.displayName = "Avatar"

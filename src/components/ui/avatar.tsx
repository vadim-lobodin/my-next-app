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

// ─── Helpers ────────────────────────────────────────────────────────────────

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

// ─── AvatarStack ────────────────────────────────────────────────────────────

export interface AvatarStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** List of users to display */
  users: Array<{ name: string; src?: string; seed?: string; avatarConfig?: Partial<NiceAvatarBaseProps> }>
  /** Avatar size in px (default: 28) */
  size?: number
  /** Maximum visible avatars before showing overflow count (default: 4) */
  max?: number
  /** Overlap offset in px (default: size * 0.25) */
  overlap?: number
}

export const AvatarStack = React.forwardRef<HTMLDivElement, AvatarStackProps>(
  ({ users, size = 28, max = 4, overlap, className, ...props }, ref) => {
    const offset = overlap ?? Math.round(size * 0.25)
    const visible = users.slice(0, max)
    const overflowCount = users.length - max

    return (
      <div
        ref={ref}
        className={cn("flex items-center", className)}
        {...props}
      >
        {visible.map((user, i) => (
            <div
              key={user.name}
              className="shrink-0 overflow-hidden rounded-full cursor-pointer transition-transform duration-100 hover:-translate-y-px hover:z-[2]"
              style={{
                width: size,
                height: size,
                marginRight: i < visible.length - 1 || overflowCount > 0 ? -offset : 0,
                zIndex: visible.length - i,
                outline: `3px solid var(--fleet-island-background, var(--fleet-background-primary))`,
              }}
              title={user.name}
            >
              {user.src ? (
                <img src={user.src} alt={user.name} className="size-full object-cover" />
              ) : (
                <div
                  className="size-full flex items-center justify-center font-medium text-white"
                  style={{
                    fontSize: Math.round(size * 0.38),
                    background: `hsl(${hashCode(user.seed ?? user.name) % 360}, 55%, 45%)`,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        {overflowCount > 0 && (
          <div
            className="shrink-0 rounded-full flex items-center justify-center font-medium cursor-pointer"
            style={{
              width: size,
              height: size,
              fontSize: size * 0.35,
              background: "var(--fleet-ghostButton-off-background-hovered)",
              color: "var(--fleet-text-secondary)",
              outline: `3px solid var(--fleet-island-background, var(--fleet-background-primary))`,
              zIndex: 0,
            }}
            title={users.slice(max).map((u) => u.name).join(", ")}
          >
            +{overflowCount}
          </div>
        )}
      </div>
    )
  },
)
AvatarStack.displayName = "AvatarStack"

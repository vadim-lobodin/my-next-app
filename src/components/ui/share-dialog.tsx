"use client"

import * as React from "react"
import NiceAvatar, { genConfig } from "react-nice-avatar"
import { cn } from "@/lib/utils"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog"
import { ContextMenu, type ActionMenuItem } from "./context-menu"
import { Avatar } from "./avatar"
import { TextInput } from "./input"
import { Button } from "./button-shadcn"
import { Icon } from "./icon"
import { Typography } from "./typography"

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShareRole = "owner" | "view-comment" | "view"
export type AccessLevel = "restricted" | "anyone"

export interface ShareUser {
  id: string
  name: string
  email: string
  role: ShareRole
  avatarSrc?: string
  isCurrentUser?: boolean
}

export interface SuggestedUser {
  id: string
  name: string
  email: string
  avatarSrc?: string
}

export type PublishState = "unpublished" | "publishing" | "published"
export type SharingMode = "local" | "cloud"

export interface ShareDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  subtitle?: string
  users?: ShareUser[]
  suggestedUsers?: SuggestedUser[]
  accessLevel?: AccessLevel
  /** @deprecated Use publishState instead */
  isPublished?: boolean
  /** Publishing state: unpublished, publishing (animated), published */
  publishState?: PublishState
  /** Local or cloud sharing mode */
  sharingMode?: SharingMode
  placeholder?: string
  onSearch?: (query: string) => void
  onPublish?: () => void
  /** Called when "Copy link" is clicked (published state) */
  onCopyLink?: () => void
  onRoleChange?: (userId: string, role: ShareRole) => void
  onAccessLevelChange?: (level: AccessLevel) => void
  /** Called when sharing mode changes */
  onSharingModeChange?: (mode: SharingMode) => void
  onAddUser?: (user: SuggestedUser) => void
  /** Called when a user is removed */
  onRemoveUser?: (userId: string) => void
  /** General access permission for the organization */
  orgPermission?: ShareRole
  onOrgPermissionChange?: (role: ShareRole) => void
  className?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const roleLabels: Record<ShareRole, string> = {
  owner: "Owner",
  "view-comment": "View & Comment",
  view: "View",
}

const accessConfig: Record<AccessLevel, { label: string; description: string }> = {
  restricted: {
    label: "Restricted",
    description: "Only people with access can open with the link",
  },
  anyone: {
    label: "Anyone in JetBrains",
    description: "Anyone in the organization can access this task",
  },
}

// ─── UserSuggestMenu ─────────────────────────────────────────────────────────

interface UserSuggestMenuProps {
  query: string
  suggestions: SuggestedUser[]
  existingUserIds: Set<string>
  onSelect: (user: SuggestedUser) => void
}

function UserSuggestMenu({ query, suggestions, existingUserIds, onSelect }: UserSuggestMenuProps) {
  const filtered = React.useMemo(() => {
    const q = query.toLowerCase()
    return suggestions
      .filter((u) => !existingUserIds.has(u.id))
      .filter((u) =>
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
  }, [suggestions, existingUserIds, query])

  if (filtered.length === 0) return null

  return (
    <div className="flex flex-col py-1">
      {filtered.map((user) => (
        <button
          key={user.id}
          type="button"
          className={cn(
            "appearance-none border-0 outline-none bg-transparent",
            "flex items-center gap-3 px-3 py-1.5 w-full text-left cursor-pointer",
            "rounded-[var(--fleet-radius-xs)]",
            "hover:bg-[var(--fleet-menu-item-background-hovered,rgba(255,255,255,0.09))]",
          )}
          onClick={() => onSelect(user)}
        >
          {/* Avatar image only (no text) */}
          <div className="shrink-0 overflow-hidden rounded-full" style={{ width: 24, height: 24 }}>
            {user.avatarSrc ? (
              <img src={user.avatarSrc} alt={user.name} className="size-full object-cover" />
            ) : (
              <NiceAvatar style={{ width: 24, height: 24 }} shape="circle" {...genConfig(user.name)} />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <Typography variant="default" className="truncate">{user.name}</Typography>
            <Typography
              variant="default"
              className="truncate"
              style={{ color: "var(--fleet-text-secondary)", fontSize: "12px" }}
            >
              {user.email}
            </Typography>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── ShareDialog ─────────────────────────────────────────────────────────────

export function ShareDialog({
  open,
  onOpenChange,
  title = "Share Task",
  subtitle = "Choose who can access this task:",
  users = [],
  suggestedUsers = [],
  accessLevel = "restricted",
  isPublished,
  publishState: publishStateProp,
  sharingMode = "cloud",
  placeholder = "Add emails, names or groups",
  onSearch,
  onPublish,
  onCopyLink,
  onRoleChange,
  onAccessLevelChange,
  onSharingModeChange,
  onAddUser,
  onRemoveUser,
  orgPermission = "view",
  onOrgPermissionChange,
  className,
}: ShareDialogProps) {
  // Support legacy isPublished prop
  const publishState: PublishState = publishStateProp ?? (isPublished ? "published" : "unpublished")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [suggestOpen, setSuggestOpen] = React.useState(false)
  const existingUserIds = React.useMemo(() => new Set(users.map((u) => u.id)), [users])

  const handleSelect = (user: SuggestedUser) => {
    onAddUser?.(user)
    setSearchQuery("")
    setSuggestOpen(false)
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className={cn("min-w-[420px] max-w-[420px]", className)} onOpenAutoFocus={(e) => e.preventDefault()}>
        {/* Header */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        {/* Search input with suggestions dropdown */}
        <div className="relative w-full">
          <TextInput
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              onSearch?.(e.target.value)
              if (!suggestOpen) setSuggestOpen(true)
            }}
            onFocus={() => setSuggestOpen(true)}
            onBlur={(e) => {
              // Delay close so click on suggestion registers first
              if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                setTimeout(() => setSuggestOpen(false), 150)
              }
            }}
            placeholder={placeholder}
            size="large"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            name="share-search-nonautocomplete"
            className="w-full"
          />
          {suggestOpen && suggestedUsers.length > 0 && (
            <div
              className={cn(
                "absolute left-0 right-0 top-full mt-1 z-50",
                "rounded-[var(--fleet-radius-sm)] border border-[var(--fleet-popup-border)]",
                "bg-[var(--fleet-popup-background)] shadow-lg",
                "overflow-hidden",
              )}
            >
              <UserSuggestMenu
                query={searchQuery}
                suggestions={suggestedUsers}
                existingUserIds={existingUserIds}
                onSelect={handleSelect}
              />
            </div>
          )}
        </div>

        {/* Users list */}
        {users.length > 0 && (
          <div className="flex flex-col gap-3 w-full">
            {users.map((user) => (
              <div key={user.id} className="flex items-start w-full">
                <Avatar
                  name={user.name}
                  email={user.email}
                  src={user.avatarSrc}
                  size={28}
                  className="flex-1 min-w-0"
                />
                <ContextMenu
                  items={[
                    ...(["owner", "view-comment", "view"] as ShareRole[]).map((role): ActionMenuItem => ({
                      type: "action" as const,
                      name: roleLabels[role],
                      rightIcon: user.role === role ? "checkmark" : undefined,
                      callback: () => onRoleChange?.(user.id, role),
                    })),
                    { type: "separator" as const },
                    {
                      type: "action" as const,
                      name: "Revoke access",
                      variant: "destructive" as const,
                      callback: () => onRemoveUser?.(user.id),
                    },
                  ]}
                  trigger={
                    <button
                      className="appearance-none border-0 outline-none bg-transparent p-0 cursor-pointer flex items-center gap-0.5 shrink-0 rounded-[3px] hover:bg-[var(--fleet-ghostButton-off-background-hovered,rgba(255,255,255,0.09))] px-1 py-0.5"
                    >
                      <Typography
                        variant="default"
                        className="text-right"
                        style={{ color: "var(--fleet-text-secondary)" }}
                      >
                        {roleLabels[user.role]}
                      </Typography>
                      <Icon fleet="chevron-down" size="xs" />
                    </button>
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* General access */}
        <div className="flex flex-col gap-3 w-full">
          <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>
            General access
          </Typography>
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <div className="shrink-0 size-[28px] rounded-full bg-[var(--fleet-selectionCard-background,rgba(255,255,255,0.07))] flex items-center justify-center overflow-hidden">
                {accessLevel === "anyone" ? (
                  <img
                    src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/jetbrains-ide-services-icon.png"
                    alt="JetBrains"
                    className="size-4 object-contain"
                  />
                ) : (
                  <Icon fleet="locked" size="sm" />
                )}
              </div>
              <div className="flex flex-col gap-1 items-start">
                <ContextMenu
                  items={
                    (["restricted", "anyone"] as AccessLevel[]).map((level): ActionMenuItem => ({
                      type: "action",
                      name: accessConfig[level].label,
                      rightIcon: accessLevel === level ? "checkmark" : undefined,
                      callback: () => onAccessLevelChange?.(level),
                    }))
                  }
                  trigger={
                    <button
                      className="appearance-none border-0 outline-none bg-transparent p-0 cursor-pointer inline-flex items-center gap-1 rounded-[3px] hover:bg-[var(--fleet-ghostButton-off-background-hovered,rgba(255,255,255,0.09))] -ml-1 px-1 py-0.5"
                    >
                      <Typography variant="default" style={{ color: "var(--fleet-text-primary)" }}>
                        {accessConfig[accessLevel].label}
                      </Typography>
                      <Icon fleet="chevron-down" size="sm" />
                    </button>
                  }
                />
                {accessLevel === "restricted" && (
                  <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>
                    {accessConfig[accessLevel].description}
                  </Typography>
                )}
              </div>
            </div>
            {/* Org permission dropdown — shown when "Anyone in JetBrains" */}
            {accessLevel === "anyone" && (
              <ContextMenu
                items={
                  (["view-comment", "view"] as ShareRole[]).map((role): ActionMenuItem => ({
                    type: "action",
                    name: roleLabels[role],
                    rightIcon: orgPermission === role ? "checkmark" : undefined,
                    callback: () => onOrgPermissionChange?.(role),
                  }))
                }
                trigger={
                  <button className="appearance-none border-0 outline-none bg-transparent p-0 cursor-pointer inline-flex items-center gap-0.5 shrink-0 rounded-[3px] hover:bg-[var(--fleet-ghostButton-off-background-hovered,rgba(255,255,255,0.09))] px-1 py-0.5">
                    <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>
                      {roleLabels[orgPermission]}
                    </Typography>
                    <Icon fleet="chevron-down" size="xs" />
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="justify-between w-full">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {publishState === "published" ? (
              <>
                <Icon fleet="checkmark" size="sm" className="shrink-0" colorize style={{ color: "var(--fleet-text-positive, #409d78)" }} />
                <Typography variant="default" className="truncate" style={{ color: "var(--fleet-text-positive, #409d78)" }}>
                  Published
                </Typography>
              </>
            ) : (
              <Typography variant="default" className="truncate" style={{ color: "var(--fleet-text-secondary)" }}>
                Not yet published
              </Typography>
            )}
          </div>
          {publishState === "published" ? (
            <Button variant="secondary" size="default" onClick={onCopyLink} iconLeft="link">
              Copy link
            </Button>
          ) : (
            <Button
              variant="primary"
              size="default"
              onClick={onPublish}
              isLoading={publishState === "publishing"}
              loadingText="Publishing..."
            >
              Publish to Cloud
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

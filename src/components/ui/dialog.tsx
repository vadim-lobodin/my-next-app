"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Typography } from "./typography"
import { Button } from "./button-shadcn"
import { Icon } from "./icon"
import { Checkbox } from "./checkbox"

// ===== RADIX PRIMITIVES WITH FLEET STYLING =====

function DialogRoot({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-[var(--fleet-overlay-background)]",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showClose = true,
  onClose,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showClose?: boolean
  onClose?: () => void
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-[20%] -translate-x-1/2 z-50",
          "flex flex-col gap-5 p-5",
          "min-w-[400px] max-w-[1040px]",
          "rounded-[var(--fleet-radius-lg)] border-[0.5px] outline-none",
          "shadow-[var(--fleet-shadow-lg)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        style={{
          background: "var(--fleet-popup-background)",
          borderColor: "var(--fleet-popup-border)",
        }}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className="absolute top-5 right-5 flex items-center justify-center p-0.5 rounded-[var(--fleet-radius-xs)] transition-colors hover:bg-[var(--fleet-ghostButton-off-background-hovered)]"
          >
            <Icon fleet="close" size="sm" colorize style={{ color: "var(--fleet-popup-closeIcon-default)" }} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props} />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-end justify-end gap-2", className)} {...props} />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-body-semibold text-header-2 leading-header-2", className)}
      style={{ color: "var(--fleet-text-primary)" }}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-default leading-default-multiline tracking-default", className)}
      style={{ color: "var(--fleet-popup-text)" }}
      {...props}
    />
  )
}

// ===== FLEET DIALOG — HIGH-LEVEL COMPONENT =====

export interface DialogButton {
  label: string
  variant?: "primary" | "secondary"
  onClick?: () => void
}

export interface FleetDialogProps {
  title?: string
  body?: React.ReactNode
  buttons?: DialogButton[]
  showClose?: boolean
  onClose?: () => void
  checkbox?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  image?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children?: React.ReactNode
}

const FleetDialog = React.forwardRef<HTMLDivElement, FleetDialogProps>(
  ({
    title = "Title",
    body = "Body text",
    buttons: externalButtons,
    showClose = true,
    onClose,
    checkbox,
    checked,
    onCheckedChange,
    image,
    open,
    onOpenChange,
    className,
    children,
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(true)
    const isOpen = open !== undefined ? open : internalOpen

    const handleOpenChange = (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value)
      } else {
        setInternalOpen(value)
      }
      if (!value && onClose) {
        onClose()
      }
    }

    const defaultButtons: DialogButton[] = [
      { label: "Cancel", variant: "secondary" },
      { label: "OK", variant: "primary" },
    ]

    const buttons = externalButtons ?? defaultButtons

    return (
      <DialogRoot open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent showClose={showClose} className={className}>
          <DialogHeader>
            {image && (
              <div className="w-full h-[180px] rounded-[var(--fleet-radius-lg)] overflow-hidden" style={{ background: "var(--fleet-popup-editor-background)" }}>
                {image}
              </div>
            )}

            <DialogTitle>{title}</DialogTitle>

            {children ?? (
              typeof body === "string" ? (
                <DialogDescription>{body}</DialogDescription>
              ) : body
            )}

            {checkbox && (
              <Checkbox
                label={checkbox}
                checked={checked}
                onCheckedChange={onCheckedChange}
              />
            )}
          </DialogHeader>

          {buttons.length > 0 && (
            <DialogFooter>
              {buttons.map((btn, i) => (
                <Button
                  key={i}
                  variant={btn.variant === "primary" ? "primary" : "secondary"}
                  size="default"
                  onClick={btn.onClick ?? (btn.variant === "secondary" ? () => handleOpenChange(false) : undefined)}
                >
                  {btn.label}
                </Button>
              ))}
            </DialogFooter>
          )}
        </DialogContent>
      </DialogRoot>
    )
  }
)
FleetDialog.displayName = "FleetDialog"

// Export primitives for custom composition + high-level FleetDialog
export {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  FleetDialog,
}

// Default export for simple usage
export { FleetDialog as Dialog }
export type { FleetDialogProps as DialogProps }

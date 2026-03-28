import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"

// Keep the original shadcn/ui Textarea for compatibility
function ShadcnTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

// Air Textarea variants based on the original Compose implementation
const textareaVariants = cva(
  // Base styles matching Air's design system exactly
  "flex w-full border transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--fleet-inputField-hint-default)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        default: [
          // Default state - matching Air exactly
          "border-[var(--fleet-inputField-border-default)]",
          "bg-[var(--fleet-inputField-background-default)]",
          "text-[var(--fleet-inputField-text-default)]",
          "caret-[var(--fleet-inputField-caret-default)]",
          // Hover state
          "hover:border-[var(--fleet-inputField-border-hovered)]",
          "hover:bg-[var(--fleet-inputField-background-hovered)]",
          "hover:text-[var(--fleet-inputField-text-hovered)]",
          // Focus state - proper Air focus colors  
          "focus-visible:border-[var(--fleet-inputField-focusBorder-default)]",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--fleet-inputField-focusOutline-default)]",
          "focus-visible:ring-offset-0",
          // Selection
          "selection:bg-[var(--fleet-inputField-selectionBackground-default)]",
          // Disabled state
          "disabled:border-[var(--fleet-inputField-border-disabled)]",
          "disabled:bg-[var(--fleet-inputField-background-disabled)]",
          "disabled:text-[var(--fleet-inputField-text-disabled)]",
          "disabled:placeholder:text-[var(--fleet-inputField-hint-disabled)]",
        ],
        error: [
          // Error state
          "border-[var(--fleet-inputField-border-error)]",
          "bg-[var(--fleet-inputField-background-error)]",
          "text-[var(--fleet-inputField-text-error)]",
          "caret-[var(--fleet-inputField-caret-error)]",
          // Hover state for error (same as default in Air)
          "hover:border-[var(--fleet-inputField-border-error)]",
          "hover:bg-[var(--fleet-inputField-background-error)]",
          "hover:text-[var(--fleet-inputField-text-error)]",
          // Focus state for error - proper Air error colors
          "focus-visible:border-[var(--fleet-inputField-focusBorder-error)]",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--fleet-inputField-focusOutline-error)]",
          "focus-visible:ring-offset-0",
          // Selection for error
          "selection:bg-[var(--fleet-inputField-selectionBackground-error)]",
          // Disabled state
          "disabled:border-[var(--fleet-inputField-border-disabled)]",
          "disabled:bg-[var(--fleet-inputField-background-disabled)]",
          "disabled:text-[var(--fleet-inputField-text-disabled)]",
          "disabled:placeholder:text-[var(--fleet-inputField-hint-disabled)]",
        ],
        inner: [
          // Inner style - no border, minimal padding, no focus ring
          "border-transparent",
          "bg-transparent",
          "text-[var(--fleet-inputField-text-default)]",
          "caret-[var(--fleet-inputField-caret-default)]",
          "focus-visible:border-transparent",
          "focus-visible:ring-0",
          "focus-visible:ring-offset-0",
          "selection:bg-[var(--fleet-inputField-selectionBackground-default)]",
          "disabled:border-transparent",
          "disabled:bg-transparent",
          "disabled:text-[var(--fleet-inputField-text-disabled)]",
        ],
        borderless: [
          // Borderless style - transparent borders but keeps background
          "border-transparent",
          "bg-[var(--fleet-inputField-background-default)]",
          "text-[var(--fleet-inputField-text-default)]",
          "caret-[var(--fleet-inputField-caret-default)]",
          "hover:border-transparent",
          "hover:bg-[var(--fleet-inputField-background-hovered)]",
          "focus-visible:border-transparent",
          "focus-visible:ring-0",
          "selection:bg-[var(--fleet-inputField-selectionBackground-default)]",
          "disabled:border-transparent",
          "disabled:bg-[var(--fleet-inputField-background-disabled)]",
          "disabled:text-[var(--fleet-inputField-text-disabled)]",
        ],
        borderlessTransparent: [
          // Borderless transparent style - completely transparent
          "border-transparent",
          "bg-transparent",
          "text-[var(--fleet-inputField-text-default)]",
          "caret-[var(--fleet-inputField-caret-default)]",
          "hover:border-transparent",
          "hover:bg-transparent",
          "focus-visible:border-transparent",
          "focus-visible:ring-0",
          "selection:bg-[var(--fleet-inputField-selectionBackground-default)]",
          "disabled:border-transparent",
          "disabled:bg-transparent",
          "disabled:text-[var(--fleet-inputField-text-disabled)]",
        ],
        innerError: [
          // Inner error style - combines inner styling (transparent borders, no focus ring) with error colors
          "border-transparent",
          "bg-transparent",
          "text-[var(--fleet-inputField-text-error)]",
          "caret-[var(--fleet-inputField-caret-error)]",
          "focus-visible:border-transparent",
          "focus-visible:ring-0",
          "selection:bg-[var(--fleet-inputField-selectionBackground-error)]",
          "disabled:border-transparent",
          "disabled:bg-transparent",
          "disabled:text-[var(--fleet-inputField-text-disabled)]",
        ],
      },
      size: {
        // Air sizes adapted for multiline textareas
        default: [
          "min-h-16", // Larger minimum height for textarea (64px)
          "min-w-[60px]", // Air minWidth = 60.dp
          "rounded", // 4px border radius
          "pl-[6px] pr-[2px] py-[2px]", // Air padding: start=6dp, top=2dp, end=2dp, bottom=2dp (asymmetric!)
        ],
        large: [
          "min-h-20", // Larger minimum height for large textarea (80px)
          "min-w-[68px]", // Air large minWidth = 68.dp
          "rounded", // 4px border radius
          "pl-2 pr-1 py-1", // Air large padding: start=8dp, top=4dp, end=4dp, bottom=4dp (asymmetric!)
        ],
        inner: [
          "min-h-12", // Smaller minimum height for inner textarea (48px)
          "min-w-[60px]",
          "rounded-none", // Air inner uses RectangleShape
          "px-[2px] py-[2px]", // Air inner padding: vertical=2dp, horizontal=2dp
        ],
      },
      textStyle: {
        // Air Typography classes - defined in globals.css with proper theme-aware font weights
        default: [
          "text-default-multiline", 
          "leading-default-multiline", 
          "font-sans", 
          "font-body-regular", // Uses CSS var: light=520, dark=480 weight
          "tracking-default"
        ], 
        chatMultiline: [
          "text-default-chat", 
          "leading-default-chat", 
          "font-sans", 
          "font-body-regular", 
          "tracking-default"
        ],  
        code: [
          "text-code", 
          "leading-code", 
          "font-mono", 
          "font-code" // Uses CSS var: light=420, dark=400 weight
        ],
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      textStyle: "default",
      resize: "vertical",
    },
  }
)

// Container variants for handling prefix/suffix layout
const textareaContainerVariants = cva(
  "relative flex w-full items-start border transition-colors", // Note: items-start for multiline
  {
    variants: {
      variant: {
        default: [
          "border-[var(--fleet-inputField-border-default)]",
          "bg-[var(--fleet-inputField-background-default)]",
          "hover:border-[var(--fleet-inputField-border-hovered)]",
          "hover:bg-[var(--fleet-inputField-background-hovered)]",
          "focus-within:border-[var(--fleet-inputField-focusBorder-default)]",
          "focus-within:ring-2",
          "focus-within:ring-[var(--fleet-inputField-focusOutline-default)]",
          "focus-within:ring-offset-0",
          "has-[:disabled]:border-[var(--fleet-inputField-border-disabled)]",
          "has-[:disabled]:bg-[var(--fleet-inputField-background-disabled)]",
        ],
        error: [
          "border-[var(--fleet-inputField-border-error)]",
          "bg-[var(--fleet-inputField-background-error)]",
          "hover:border-[var(--fleet-inputField-border-error)]",
          "hover:bg-[var(--fleet-inputField-background-error)]",
          "focus-within:border-[var(--fleet-inputField-focusBorder-error)]",
          "focus-within:ring-2",
          "focus-within:ring-[var(--fleet-inputField-focusOutline-error)]",
          "focus-within:ring-offset-0",
          "has-[:disabled]:border-[var(--fleet-inputField-border-disabled)]",
          "has-[:disabled]:bg-[var(--fleet-inputField-background-disabled)]",
        ],
        inner: [
          "border-transparent",
          "bg-transparent",
          "hover:border-transparent",
          "hover:bg-transparent",
          "focus-within:border-transparent",
          "focus-within:ring-0",
          "has-[:disabled]:border-transparent",
          "has-[:disabled]:bg-transparent",
        ],
        borderless: [
          "border-transparent",
          "bg-[var(--fleet-inputField-background-default)]",
          "hover:border-transparent",
          "hover:bg-[var(--fleet-inputField-background-hovered)]",
          "focus-within:border-transparent",
          "focus-within:ring-0",
          "has-[:disabled]:border-transparent",
          "has-[:disabled]:bg-[var(--fleet-inputField-background-disabled)]",
        ],
        borderlessTransparent: [
          "border-transparent",
          "bg-transparent",
          "hover:border-transparent",
          "hover:bg-transparent",
          "focus-within:border-transparent",
          "focus-within:ring-0",
          "has-[:disabled]:border-transparent",
          "has-[:disabled]:bg-transparent",
        ],
        innerError: [
          "border-transparent",
          "bg-transparent",
          "hover:border-transparent",
          "hover:bg-transparent",
          "focus-within:border-transparent",
          "focus-within:ring-0",
          "has-[:disabled]:border-transparent",
          "has-[:disabled]:bg-transparent",
        ],
      },
      size: {
        default: "min-h-16 rounded min-w-[60px]",
        large: "min-h-20 rounded min-w-[68px]",
        inner: "min-h-12 rounded-none min-w-[60px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Air Textarea component interface
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "prefix">,
    VariantProps<typeof textareaVariants> {
  /**
   * Optional prefix element (icon, text, etc.) - Air calls this prefixBuilder
   */
  prefix?: React.ReactNode
  /**
   * Optional suffix element (icon, button, etc.) - Air calls this suffixBuilder  
   */
  suffix?: React.ReactNode
  /**
   * Container className for styling the wrapper when prefix/suffix are used
   */
  containerClassName?: string
  /**
   * Whether the textarea is in an error state - Air uses errorTextInputStyle()
   */
  error?: boolean
  /**
   * Alignment for prefix element
   */
  prefixAlignment?: "center" | "top" | "bottom"
  /**
   * Alignment for suffix element
   */
  suffixAlignment?: "center" | "top" | "bottom"
  /**
   * Auto-grow to content (up to maxRows)
   * @default false
   */
  autoGrow?: boolean
  /**
   * Maximum number of rows for auto-growing
   */
  maxRows?: number
}

/**
 * Air Textarea Component
 * 
 * Multiline text input component implementing Air design system.
 * Use variant and size props to achieve all Air styling options:
 * 
 * @example
 * // Air defaultTextInputStyle() for multiline
 * <Textarea variant="default" size="default" rows={4} />
 * 
 * // Air largeTextInputStyle() for multiline
 * <Textarea variant="default" size="large" rows={4} />
 * 
 * // Air errorTextInputStyle() for multiline
 * <Textarea variant="error" rows={4} />
 * 
 * // Air innerTextInputStyle() for multiline
 * <Textarea variant="inner" size="inner" rows={4} />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      variant,
      size,
      textStyle,
      resize,
      prefix,
      suffix,
      error,
      disabled,
      prefixAlignment = "top",
      suffixAlignment = "top",
      autoGrow = false,
      maxRows,
      style,
      ...props
    },
    ref
  ) => {
    // Determine the variant based on props - match Air's logic
    const computedVariant = React.useMemo(() => {
      if (error) return "error"
      return variant || "default"
    }, [error, variant])

    // Auto-grow logic
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    React.useImperativeHandle(ref, () => textareaRef.current!)

    const handleAutoGrow = React.useCallback(() => {
      if (autoGrow && textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = 'auto'
        
        if (maxRows) {
          const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
          const maxHeight = lineHeight * maxRows
          textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
        } else {
          textarea.style.height = textarea.scrollHeight + 'px'
        }
      }
    }, [autoGrow, maxRows])

    React.useEffect(() => {
      if (autoGrow) {
        handleAutoGrow()
      }
    }, [autoGrow, handleAutoGrow, props.value])

    const textareaStyle = {
      ...style,
      ...(autoGrow && { overflow: maxRows ? 'auto' : 'hidden' }),
    }

    // Helper to render prefix/suffix as Air icon if string, or as ReactNode
    const renderIcon = (icon: React.ReactNode | string | undefined) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon fleet={icon} size="sm" />;
      }
      return icon;
    };

    // If we have prefix or suffix, we need to use a container layout
    if (prefix || suffix) {
      return (
        <div className={cn(textareaContainerVariants({ variant: computedVariant, size }), containerClassName)}>
          {prefix && (
            <div className={cn(
              "flex pl-[6px] pointer-events-none text-[var(--fleet-inputField-hint-default)]",
              prefixAlignment === "center" && "items-center self-center",
              prefixAlignment === "top" && "items-start self-start pt-[2px]",
              prefixAlignment === "bottom" && "items-end self-end pb-[2px]"
            )}>
              {renderIcon(prefix)}
            </div>
          )}
          <textarea
            className={cn(
              textareaVariants({ variant: computedVariant, size, textStyle, resize }),
              "border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
              prefix && "pl-1",
              suffix && "pr-0",
              className
            )}
            ref={textareaRef}
            disabled={disabled}
            style={textareaStyle}
            onChange={(e) => {
              if (autoGrow) handleAutoGrow()
              props.onChange?.(e)
            }}
            {...props}
          />
          {suffix && (
            <div className={cn(
              "flex pr-[2px] text-[var(--fleet-inputField-hint-default)]",
              suffixAlignment === "center" && "items-center self-center",
              suffixAlignment === "top" && "items-start self-start pt-[2px]",
              suffixAlignment === "bottom" && "items-end self-end pb-[2px]"
            )}>
              {renderIcon(suffix)}
            </div>
          )}
        </div>
      )
    }

    // Simple textarea without prefix/suffix
    return (
      <textarea
        className={cn(textareaVariants({ variant: computedVariant, size, textStyle, resize }), className)}
        ref={textareaRef}
        disabled={disabled}
        style={textareaStyle}
        onChange={(e) => {
          if (autoGrow) handleAutoGrow()
          props.onChange?.(e)
        }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export {
  Textarea,
  ShadcnTextarea,
  textareaVariants,
}

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      // Headers
      "header-0-semibold": [
        "text-header-0",
        "leading-header-0", 
        "font-sans",
        "font-semibold",
      ],
      "header-1-semibold": [
        "text-header-1",
        "leading-header-1",
        "font-sans", 
        "font-semibold",
      ],
      "header-1": [
        "text-header-1",
        "leading-header-1",
        "font-sans",
        "font-light",
      ],
      "header-2-semibold": [
        "text-header-2",
        "leading-header-2",
        "font-sans",
        "font-semibold", 
      ],
      "header-2": [
        "text-header-2",
        "leading-header-2",
        "font-sans",
        "font-light",
      ],
      "header-3-semibold": [
        "text-header-3",
        "leading-header-3",
        "font-sans",
        "font-semibold",
        "tracking-header-3",
      ],
      "header-3": [
        "text-header-3",
        "leading-header-3", 
        "font-sans",
        "font-header3-regular",
        "tracking-header-3",
      ],
      "header-4-semibold": [
        "text-header-4",
        "leading-header-4",
        "font-sans",
        "font-semibold",
        "tracking-header-4",
      ],
      "header-5-semibold": [
        "text-xs",
        "leading-[var(--leading-header-5)]",
        "font-sans",
        "font-bold", // Figma: H5 SemiBold uses weight 700
        "tracking-[var(--tracking-header-5)]",
        "uppercase",
      ],
      
      // Default Text
      "default": [
        "text-default",
        "leading-default",
        "font-sans",
        "font-body-regular",
        "tracking-default",
      ],
      "default-italic": [
        "text-default",
        "leading-default",
        "font-sans",
        "font-body-regular",
        "italic",
        "tracking-default",
      ],
      "default-semibold": [
        "text-default",
        "leading-default",
        "font-sans",
        "font-body-semibold",
        "tracking-default",
      ],
      "default-semibold-italic": [
        "text-default",
        "leading-default",
        "font-sans",
        "font-body-semibold",
        "italic",
        "tracking-default",
      ],
      "default-multiline": [
        "text-default-multiline",
        "leading-default-multiline",
        "font-sans",
        "font-body-regular",
        "tracking-default",
      ],
      "default-chat": [
        "text-default-chat",
        "leading-default-chat",
        "font-sans",
        "font-body-regular",
        "tracking-default",
      ],
      
      // Medium and Small Text
      "medium": [
        "text-medium",
        "leading-medium",
        "font-sans",
        "font-medium",
        "tracking-medium",
      ],
      "medium-semibold": [
        "text-medium",
        "leading-medium",
        "font-sans",
        "font-medium-semibold",
        "tracking-medium",
      ],
      "small": [
        "text-small",
        "leading-small",
        "font-sans",
        "font-medium",
        "tracking-small",
      ],
      
      // Code Text
      "code": [
        "text-code",
        "leading-code",
        "[font-family:var(--font-mono)]",
        "font-code",
      ],
      "code-italic": [
        "text-code",
        "leading-code",
        "[font-family:var(--font-mono)]",
        "font-code",
        "italic",
      ],
      "code-bold": [
        "text-code",
        "leading-code",
        "[font-family:var(--font-mono)]",
        "font-code-bold",
      ],
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        className={cn(typographyVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

// Semantic Components
export interface HeadingProps extends Omit<TypographyProps, 'variant'> {
  level?: 0 | 1 | 2 | 3 | 4 | 5
  weight?: 'regular' | 'semibold'
}

const Heading = React.forwardRef<HTMLElement, HeadingProps>(
  ({ level = 1, weight = 'semibold', as, ...props }, ref) => {
    const Component = as || `h${Math.max(1, level)}` as React.ElementType
    
    const getVariant = (): VariantProps<typeof typographyVariants>['variant'] => {
      if (level === 0) return 'header-0-semibold'
      if (level === 1) return weight === 'semibold' ? 'header-1-semibold' : 'header-1'
      if (level === 2) return weight === 'semibold' ? 'header-2-semibold' : 'header-2'
      if (level === 3) return weight === 'semibold' ? 'header-3-semibold' : 'header-3'
      if (level === 4) return 'header-4-semibold'
      if (level === 5) return 'header-5-semibold'
      return 'default'
    }
    
    const variant = getVariant()
    
    return (
      <Typography
        variant={variant}
        as={Component}
        ref={ref}
        {...props}
      />
    )
  }
)
Heading.displayName = "Heading"

// Specific heading components
const H1 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level'>>(
  ({ weight = 'semibold', ...props }, ref) => (
    <Heading level={1} weight={weight} ref={ref} {...props} />
  )
)
H1.displayName = "H1"

const H2 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level'>>(
  ({ weight = 'semibold', ...props }, ref) => (
    <Heading level={2} weight={weight} ref={ref} {...props} />
  )
)
H2.displayName = "H2"

const H3 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level'>>(
  ({ weight = 'semibold', ...props }, ref) => (
    <Heading level={3} weight={weight} ref={ref} {...props} />
  )
)
H3.displayName = "H3"

const H4 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level'>>(
  (props, ref) => (
    <Heading level={4} weight="semibold" ref={ref} {...props} />
  )
)
H4.displayName = "H4"

const H5 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level'>>(
  (props, ref) => (
    <Heading level={5} weight="semibold" ref={ref} {...props} />
  )
)
H5.displayName = "H5"

// Text components
export interface TextProps extends Omit<TypographyProps, 'variant'> {
  size?: 'default' | 'medium' | 'small'
  variant?: 'default' | 'multiline' | 'chat'
  weight?: 'regular' | 'semibold'
  fontStyle?: 'normal' | 'italic'
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ 
    size = 'default', 
    variant = 'default', 
    weight = 'regular', 
    fontStyle = 'normal',
    as = 'span',
    ...props 
  }, ref) => {
    const getVariant = (): VariantProps<typeof typographyVariants>['variant'] => {
      if (size === 'medium') {
        return weight === 'semibold' ? 'medium-semibold' : 'medium'
      } else if (size === 'small') {
        return 'small'
      } else {
        // default size
        if (variant === 'multiline') {
          return 'default-multiline'
        } else if (variant === 'chat') {
          return 'default-chat'
        } else {
          // default variant
          if (weight === 'semibold' && fontStyle === 'italic') {
            return 'default-semibold-italic'
          } else if (weight === 'semibold') {
            return 'default-semibold'
          } else if (fontStyle === 'italic') {
            return 'default-italic'
          } else {
            return 'default'
          }
        }
      }
    }
    
    const typographyVariant = getVariant()
    
    return (
      <Typography
        variant={typographyVariant}
        as={as}
        ref={ref}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

// Body component (alias for Text with paragraph defaults)
const Body = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ as = 'p', ...props }, ref) => (
    <Text as={as} ref={ref} {...props} />
  )
)
Body.displayName = "Body"

// Caption component (alias for small text)
const Caption = React.forwardRef<HTMLElement, Omit<TextProps, 'size'>>(
  ({ as = 'span', ...props }, ref) => (
    <Text size="small" as={as} ref={ref} {...props} />
  )
)
Caption.displayName = "Caption"

// Code components
export interface CodeProps extends Omit<TypographyProps, 'variant'> {
  weight?: 'regular' | 'bold'
  fontStyle?: 'normal' | 'italic'
}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ weight = 'regular', fontStyle = 'normal', as = 'code', ...props }, ref) => {
    const getVariant = (): VariantProps<typeof typographyVariants>['variant'] => {
      if (weight === 'bold') {
        return 'code-bold'
      } else if (fontStyle === 'italic') {
        return 'code-italic'
      } else {
        return 'code'
      }
    }
    
    const variant = getVariant()
    
    return (
      <Typography
        variant={variant}
        as={as}
        ref={ref}
        {...props}
      />
    )
  }
)
Code.displayName = "Code"

// Inline code component
const InlineCode = React.forwardRef<HTMLElement, CodeProps>(
  (props, ref) => (
    <Code as="code" ref={ref} {...props} />
  )
)
InlineCode.displayName = "InlineCode"

// Code block component
const CodeBlock = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ as = 'pre', className, ...props }, ref) => (
    <Code 
      as={as} 
      className={cn('whitespace-pre-wrap', className)}
      ref={ref} 
      {...props} 
    />
  )
)
CodeBlock.displayName = "CodeBlock"

// Primary export - use this for all typography needs
export { 
  Typography, 
  typographyVariants
}

// Legacy exports - use Typography instead
export {
  Heading,
  H1, H2, H3, H4, H5,
  Text, Body, Caption,
  Code, InlineCode, CodeBlock
} 
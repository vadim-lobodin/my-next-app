"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const skeletonVariants = cva(
  [
    "block w-full",
    "bg-[var(--air-skeleton-background,rgba(255,255,255,0.06))]",
    "bg-[length:200%] bg-no-repeat animate-[skeleton-shimmer_1.5s_cubic-bezier(0.66,0.08,0.56,1)_infinite]",
  ],
  {
    variants: {
      size: {
        small: "h-7 rounded-[4px]",
        medium: "h-9 rounded-[6px]",
        large: "h-20 rounded-lg",
      },
    },
    defaultVariants: {
      size: "small",
    },
  },
)

export type SkeletonSize = "small" | "medium" | "large"

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof skeletonVariants> {
  width?: React.CSSProperties["width"]
  height?: React.CSSProperties["height"]
  minHeight?: React.CSSProperties["minHeight"]
}

export const Skeleton: React.FC<SkeletonProps> = ({
  size = "small",
  width,
  height,
  minHeight,
  className,
  style,
  ...props
}) => (
  <span
    className={cn(skeletonVariants({ size }), className)}
    style={{
      ...style,
      width,
      height,
      minHeight,
      backgroundImage:
        "linear-gradient(90deg, var(--air-skeleton-shimmer-gradient1, rgba(255,255,255,0.04)) 0%, var(--air-skeleton-shimmer-gradient2, rgba(255,255,255,0.08)) 25%, var(--air-skeleton-shimmer-gradient3, rgba(255,255,255,0.12)) 50%, var(--air-skeleton-shimmer-gradient2, rgba(255,255,255,0.08)) 75%, var(--air-skeleton-shimmer-gradient1, rgba(255,255,255,0.04)) 100%)",
    }}
    {...props}
  />
)
Skeleton.displayName = "Skeleton"

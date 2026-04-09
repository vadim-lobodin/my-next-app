import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Our custom font-size classes (text-default, text-medium, text-small, text-header-*, text-code)
      // must not conflict with Tailwind's text-color classes (text-foreground, text-[color])
      "font-size": [
        "text-default",
        "text-default-multiline",
        "text-default-chat",
        "text-medium",
        "text-small",
        "text-code",
        "text-header-0",
        "text-header-1",
        "text-header-2",
        "text-header-3",
        "text-header-4",
        "text-header-5",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ScrollArea } from "./scroll-area"
import { Typography } from "./typography"
import { Icon } from "./icon"
import { Button } from "./button-shadcn"
import { Checkbox } from "./checkbox" // Import the Checkbox component

// ===== TYPES AND INTERFACES =====

export interface ListItemOpts {
  isFocused: boolean
  isHovered: boolean
  isSelected: boolean
  isCursor: boolean
  hasSelectionAbove?: boolean
  hasSelectionBelow?: boolean
  matcher?: Matcher | null
}

export interface Matcher {
  matchedRanges(text: string): Array<{ start: number; end: number }> | null
  matchingDegree(text: string): number
}

export interface ListState<T = unknown> {
  cursorKey: T | null
  selection: Set<T>
  multiSelectionAnchorKey: T | null
}

export interface ListOptions {
  confirmOnClick?: boolean
  selectFirstItem?: boolean
  selectFirstItemOnFocus?: boolean
  updateCursorOnHover?: boolean
  resetCursorOnMouseLeave?: boolean
  resetCursorOnCancel?: boolean
  updateSelectionWithCursor?: boolean
  homeEndActionsEnabled?: boolean
  keyboardSelectActionEnabled?: boolean
  multiSelectionEnabled?: boolean
  contextActionsEnabled?: boolean
  spacing?: number
  className?: string
}

export interface ListProps<T> {
  items: T[]
  keyFn?: (item: T) => string | number
  renderItem: (item: T, opts: ListItemOpts) => React.ReactNode
  selectableFn?: (item: T) => boolean
  
  // State management
  selectedKeys?: Set<string | number>
  cursorKey?: string | number
  onSelectionChange?: (keys: Set<string | number>, items: T[]) => void
  onCursorChange?: (key: string | number | null, item: T | null) => void
  onConfirm?: (items: T[]) => void
  
  // Options
  options?: ListOptions
  
  // Styling
  className?: string
  style?: React.CSSProperties
  height?: number | string
}

// ===== FLEET STYLING =====

const listVariants = cva(
  [
    "flex flex-col",
    "text-default leading-default font-body-regular tracking-default",
    "focus-visible:outline-none"
  ],
  {
    variants: {
      spacing: {
        none: "gap-0",
        sm: "gap-0.5", // 2dp
        default: "gap-0.5", // 2dp
        md: "gap-1", // 4dp
        lg: "gap-1.5", // 6dp
      }
    },
    defaultVariants: {
      spacing: "default"
    }
  }
)

const listItemVariants = cva(
  [
    "relative flex items-center",
    "min-h-6 mx-1", // 4px inset from list edges for hover background
    "rounded-[var(--selection-corner-radius,4px)]",
    "transition-colors duration-75",
    "cursor-pointer select-none",
    "text-default leading-default font-body-regular tracking-default",
    "outline-none focus:outline-none focus-visible:outline-none",
    "ring-0 focus:ring-0 focus-visible:ring-0"
  ],
  {
    variants: {
      state: {
        // Figma: selection/no-background/default = transparent, hovered = #ffffff0a
        default: [
          "text-[var(--fleet-listItem-text-default)]",
          "hover:bg-[var(--fleet-listItem-background-hovered)]"
        ],
        // Figma: selection/no-background/hovered = #ffffff0a
        hovered: [
          "text-[var(--fleet-listItem-text-hovered)]"
        ],
        // Figma: selection/no-background/focused = #0870e466
        selected: [
          "text-[var(--fleet-listItem-text-focused)]"
        ],
        cursor: [
          "text-[var(--fleet-listItem-text-focused)]"
        ],
        selectedCursor: [
          "text-[var(--fleet-listItem-text-focused)]"
        ],
        // Figma: selection/no-background/inactive = #ffffff21
        focusedInactive: [
          "text-[var(--fleet-listItem-text-selected)]"
        ]
      }
    },
    defaultVariants: {
      state: "default"
    }
  }
)

// ===== HOOKS =====

function useListState<T>(
  items: T[],
  keyFn: (item: T) => string | number,
  initialState?: Partial<ListState<string | number>>
): [ListState<string | number>, React.Dispatch<React.SetStateAction<ListState<string | number>>>] {
  const [state, setState] = React.useState<ListState<string | number>>(() => ({
    cursorKey: initialState?.cursorKey ?? null,
    selection: initialState?.selection ?? new Set(),
    multiSelectionAnchorKey: initialState?.multiSelectionAnchorKey ?? null
  }))

  // Build key to index mapping
  const keyToIndex = React.useMemo(() => {
    const map = new Map<string | number, number>()
    items.forEach((item, index) => {
      map.set(keyFn(item), index)
    })
    return map
  }, [items, keyFn])

  // Auto-adjust cursor if it becomes invalid
  React.useEffect(() => {
    setState(prevState => {
      if (prevState.cursorKey !== null && !keyToIndex.has(prevState.cursorKey)) {
        // Cursor is invalid, clear it
        return {
          ...prevState,
          cursorKey: null
        }
      }
      return prevState
    })
  }, [keyToIndex])

  return [state, setState]
}

function useKeyboardNavigation<T>(
  items: T[],
  keyFn: (item: T) => string | number,
  selectableFn: (item: T) => boolean,
  state: ListState<string | number>,
  setState: React.Dispatch<React.SetStateAction<ListState<string | number>>>,
  options: ListOptions,
  onSelectionChange?: (keys: Set<string | number>, items: T[]) => void,
  onCursorChange?: (key: string | number | null, item: T | null) => void,
  onConfirm?: (items: T[]) => void
) {
  const keyToIndex = React.useMemo(() => {
    const map = new Map<string | number, number>()
    items.forEach((item, index) => {
      map.set(keyFn(item), index)
    })
    return map
  }, [items, keyFn])

  const findNextSelectableIndex = React.useCallback((
    startIndex: number,
    direction: 1 | -1,
    cycle: boolean = false
  ): number | null => {
    const size = items.length
    if (size === 0) return null

    let currentIdx = startIndex
    let visited = 0

    do {
      if (cycle) {
        currentIdx = ((currentIdx % size) + size) % size
      } else if (currentIdx < 0 || currentIdx >= size) {
        return null
      }

      if (currentIdx >= 0 && currentIdx < size && selectableFn(items[currentIdx])) {
        return currentIdx
      }

      visited++
      currentIdx += direction
    } while (currentIdx !== startIndex && visited < size)

    return null
  }, [items, selectableFn])

  const moveCursor = React.useCallback((targetKey: string | number) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        cursorKey: targetKey
      }

      if (options.updateSelectionWithCursor) {
        newState.selection = new Set([targetKey])
        newState.multiSelectionAnchorKey = targetKey
      }

      return newState
    })

    // Call callbacks
    const targetIndex = keyToIndex.get(targetKey)
    const targetItem = targetIndex !== undefined ? items[targetIndex] : null
    onCursorChange?.(targetKey, targetItem)
    
    if (options.updateSelectionWithCursor) {
      const selectedItems = targetIndex !== undefined ? [items[targetIndex]] : []
      onSelectionChange?.(new Set([targetKey]), selectedItems)
    }
  }, [setState, options.updateSelectionWithCursor, keyToIndex, items, onCursorChange, onSelectionChange])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    const currentIndex = state.cursorKey ? keyToIndex.get(state.cursorKey) : null

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        const nextIndex = findNextSelectableIndex(
          currentIndex !== null && currentIndex !== undefined ? currentIndex + 1 : 0, 
          1, 
          false
        )
        if (nextIndex !== null) {
          moveCursor(keyFn(items[nextIndex]))
        }
        break
      }

      case 'ArrowUp': {
        event.preventDefault()
        const prevIndex = findNextSelectableIndex(
          currentIndex !== null && currentIndex !== undefined ? currentIndex - 1 : items.length - 1, 
          -1, 
          false
        )
        if (prevIndex !== null) {
          moveCursor(keyFn(items[prevIndex]))
        }
        break
      }

      case 'Home': {
        if (options.homeEndActionsEnabled) {
          event.preventDefault()
          const firstIndex = findNextSelectableIndex(0, 1, false)
          if (firstIndex !== null) {
            moveCursor(keyFn(items[firstIndex]))
          }
        }
        break
      }

      case 'End': {
        if (options.homeEndActionsEnabled) {
          event.preventDefault()
          const lastIndex = findNextSelectableIndex(items.length - 1, -1, false)
          if (lastIndex !== null) {
            moveCursor(keyFn(items[lastIndex]))
          }
        }
        break
      }

      case 'Enter':
      case ' ': {
        event.preventDefault()
        if (state.cursorKey !== null) {
          const cursorIndex = keyToIndex.get(state.cursorKey)
          if (cursorIndex !== undefined) {
            const selectedItems = state.selection.size > 0 
              ? Array.from(state.selection).map(key => {
                  const idx = keyToIndex.get(key)
                  return idx !== undefined ? items[idx] : null
                }).filter(Boolean) as T[]
              : [items[cursorIndex]]
            onConfirm?.(selectedItems)
          }
        }
        break
      }

      case 'Escape': {
        if (options.resetCursorOnCancel) {
          event.preventDefault()
          setState(prevState => ({
            ...prevState,
            cursorKey: null,
            selection: new Set()
          }))
          onCursorChange?.(null, null)
          onSelectionChange?.(new Set(), [])
        }
        break
      }
    }
  }, [state, keyToIndex, findNextSelectableIndex, moveCursor, keyFn, items, options, onConfirm, setState, onCursorChange, onSelectionChange])

  return { handleKeyDown }
}

// ===== COMPONENTS =====

export interface ListItemContainerProps {
  children: React.ReactNode
  opts: ListItemOpts
  onClick?: (event: React.MouseEvent) => void
  onDoubleClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  className?: string
}

/** @deprecated Use ListItemContainerProps instead */
export type ListItemProps = ListItemContainerProps

export const ListItemContainer = React.forwardRef<HTMLDivElement, ListItemContainerProps>(
  ({ children, opts, onClick, onDoubleClick, onMouseEnter, onMouseLeave, className }, ref) => {
    const getState = () => {
      if (opts.isCursor && opts.isSelected) return "selectedCursor" as const
      if (opts.isCursor) return "cursor" as const
      if (opts.isSelected) return "selected" as const
      return "default" as const
    }

    // Figma selection backgrounds applied via inline style
    const getSelectionBackground = () => {
      const state = getState()
      switch (state) {
        case "selectedCursor":
        case "cursor":
        case "selected":
          // Figma: selection/no-background/focused = #0870e466
          return 'var(--fleet-listItem-background-focused)'
        case "default":
          // Figma: selection/no-background/default = transparent, hover handled via CSS
          return undefined
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          listItemVariants({
            state: getState()
          }),
          className
        )}
        style={{ background: getSelectionBackground() }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="option"
        aria-selected={opts.isSelected}
        tabIndex={opts.isCursor ? 0 : -1}
      >
        {children}
      </div>
    )
  }
)
ListItemContainer.displayName = "ListItemContainer"

/** @deprecated Use ListItemContainer instead */
export const ListItemWrapper = ListItemContainer

const ListComponent = React.forwardRef(<T extends object>({
    items,
    keyFn = (item: T) => {
      const key = (item as { id?: string | number; key?: string | number })?.id ?? (item as { id?: string | number; key?: string | number })?.key;
      if (key !== undefined) {
        return key;
      }
      // Fallback for items that are strings or numbers themselves, or have a different key property
      return String(item);
    },
    renderItem,
    selectableFn = () => true,
    selectedKeys,
    cursorKey,
    onSelectionChange,
    onCursorChange,
    onConfirm,
    options = {},
    className,
    style,
    height = "300px"
  }: ListProps<T>, ref: React.ForwardedRef<HTMLDivElement>) => {
    const [focused, setFocused] = React.useState(false)
    const [hoveredKey, setHoveredKey] = React.useState<string | number | null>(null)
    
    // Use controlled state if provided, otherwise use internal state
    const [internalState, setInternalState] = useListState(items, keyFn, {
      cursorKey,
      selection: selectedKeys
    })

    const isControlled = selectedKeys !== undefined || cursorKey !== undefined
    const state = React.useMemo(() => isControlled 
      ? { cursorKey: cursorKey ?? null, selection: selectedKeys ?? new Set(), multiSelectionAnchorKey: null }
      : internalState, [isControlled, cursorKey, selectedKeys, internalState])
    const setState = isControlled 
      ? (newState: React.SetStateAction<ListState<string | number>>) => {
          // For controlled mode, we call the callbacks instead of updating internal state
          if (typeof newState === 'function') {
            const computed = newState(state)
            const cursorIndex = computed.cursorKey ? keyToIndex.get(computed.cursorKey) : undefined
            const cursorItem = cursorIndex !== undefined ? items[cursorIndex] || null : null
            onCursorChange?.(computed.cursorKey, cursorItem)
            if (computed.selection !== state.selection) {
              const selectedItems = Array.from(computed.selection).map(key => {
                const idx = keyToIndex.get(key)
                return idx !== undefined ? items[idx] : null
              }).filter(Boolean) as T[]
              onSelectionChange?.(computed.selection, selectedItems)
            }
          }
        }
      : setInternalState

    const keyToIndex = React.useMemo(() => {
      const map = new Map<string | number, number>()
      items.forEach((item, index) => {
        map.set(keyFn(item), index)
      })
      return map
    }, [items, keyFn])

    const mergedOptions: Required<ListOptions> = React.useMemo(() => ({
      confirmOnClick: true,
      selectFirstItem: false,
      selectFirstItemOnFocus: true,
      updateCursorOnHover: false,
      resetCursorOnMouseLeave: false,
      resetCursorOnCancel: false,
      updateSelectionWithCursor: true,
      homeEndActionsEnabled: true,
      keyboardSelectActionEnabled: true,
      multiSelectionEnabled: false,
      contextActionsEnabled: true,
      spacing: 0,
      className: "",
      ...options
    }), [options])

    const { handleKeyDown } = useKeyboardNavigation(
      items,
      keyFn,
      selectableFn,
      state,
      setState,
      mergedOptions,
      onSelectionChange,
      onCursorChange,
      onConfirm
    )

    // Handle item click
    const handleItemClick = React.useCallback((item: T, event: React.MouseEvent) => {
      const itemKey = keyFn(item)
      
      if (!selectableFn(item)) return

      if (event.ctrlKey || event.metaKey) {
        // Multi-select toggle
        if (mergedOptions.multiSelectionEnabled) {
          const newSelection = new Set(state.selection)
          if (newSelection.has(itemKey)) {
            newSelection.delete(itemKey)
          } else {
            newSelection.add(itemKey)
          }
          
          const selectedItems = Array.from(newSelection).map(key => {
            const idx = keyToIndex.get(key)
            return idx !== undefined ? items[idx] : null
          }).filter(Boolean) as T[]
          
          onSelectionChange?.(newSelection, selectedItems)
          onCursorChange?.(itemKey, item)
        }
      } else if (event.shiftKey && mergedOptions.multiSelectionEnabled && state.multiSelectionAnchorKey) {
        // Range selection
        const anchorIndex = keyToIndex.get(state.multiSelectionAnchorKey)
        const targetIndex = keyToIndex.get(itemKey)
        
        if (anchorIndex !== undefined && targetIndex !== undefined) {
          const start = Math.min(anchorIndex, targetIndex)
          const end = Math.max(anchorIndex, targetIndex)
          const rangeSelection = new Set<string | number>()
          
          for (let i = start; i <= end; i++) {
            if (selectableFn(items[i])) {
              rangeSelection.add(keyFn(items[i]))
            }
          }
          
          const selectedItems = Array.from(rangeSelection).map(key => {
            const idx = keyToIndex.get(key)
            return idx !== undefined ? items[idx] : null
          }).filter(Boolean) as T[]
          
          onSelectionChange?.(rangeSelection, selectedItems)
          onCursorChange?.(itemKey, item)
        }
      } else {
        // Single selection
        const newSelection = new Set([itemKey])
        onSelectionChange?.(newSelection, [item])
        onCursorChange?.(itemKey, item)

        // Confirm on click if enabled
        if (mergedOptions.confirmOnClick) {
          onConfirm?.([item])
        }
      }
    }, [keyFn, selectableFn, mergedOptions, state, keyToIndex, items, onSelectionChange, onCursorChange, onConfirm])

    const handleItemDoubleClick = React.useCallback((item: T) => {
      if (selectableFn(item)) {
        onConfirm?.([item])
      }
    }, [selectableFn, onConfirm])

    const handleItemMouseEnter = React.useCallback((item: T) => {
      const itemKey = keyFn(item)
      setHoveredKey(itemKey)
      
      if (mergedOptions.updateCursorOnHover && selectableFn(item)) {
        onCursorChange?.(itemKey, item)
      }
    }, [keyFn, mergedOptions.updateCursorOnHover, selectableFn, onCursorChange])

    const handleItemMouseLeave = React.useCallback((item: T) => {
      const itemKey = keyFn(item)
      setHoveredKey(null)
      
      if (mergedOptions.resetCursorOnMouseLeave && state.cursorKey === itemKey) {
        onCursorChange?.(null, null)
      }
    }, [keyFn, mergedOptions.resetCursorOnMouseLeave, state.cursorKey, onCursorChange])

    // Auto-select first item on focus if enabled
    React.useEffect(() => {
      if (focused && mergedOptions.selectFirstItemOnFocus && !state.cursorKey && items.length > 0) {
        const firstSelectableIndex = items.findIndex(selectableFn)
        if (firstSelectableIndex !== -1) {
          const firstItem = items[firstSelectableIndex]
          const firstKey = keyFn(firstItem)
          onCursorChange?.(firstKey, firstItem)
          if (mergedOptions.updateSelectionWithCursor) {
            onSelectionChange?.(new Set([firstKey]), [firstItem])
          }
        }
      }
    }, [focused, mergedOptions.selectFirstItemOnFocus, mergedOptions.updateSelectionWithCursor, state.cursorKey, items, selectableFn, keyFn, onCursorChange, onSelectionChange])

    return (
      <div
        ref={ref}
        className={cn("flex flex-col", className)}
        style={{ height, ...style }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="listbox"
        aria-multiselectable={mergedOptions.multiSelectionEnabled}
      >
        <ScrollArea className="flex-1">
          <div className={cn(listVariants({ spacing: mergedOptions.spacing === 0 ? "none" : "default" }))}>
            {items.map((item) => {
              const itemKey = keyFn(item)
              const isSelected = state.selection.has(itemKey)
              const isCursor = state.cursorKey === itemKey
              const isHovered = hoveredKey === itemKey
              
              const opts: ListItemOpts = {
                isFocused: focused && isCursor, // Only the cursor item should be focused
                isHovered,
                isSelected,
                isCursor,
                hasSelectionAbove: false, // TODO: Implement proper selection grouping
                hasSelectionBelow: false, // TODO: Implement proper selection grouping
                matcher: null // TODO: Implement search highlighting
              }

              return (
                <ListItemContainer
                  key={itemKey}
                  opts={opts}
                  onClick={(e) => handleItemClick(item, e as React.MouseEvent)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  onMouseEnter={() => handleItemMouseEnter(item)}
                  onMouseLeave={() => handleItemMouseLeave(item)}
                >
                  {renderItem(item, opts)}
                </ListItemContainer>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    )
  })

ListComponent.displayName = "ListComponent"

export const List = ListComponent as <T extends object>(props: ListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }) => React.ReactElement
;(ListComponent as React.FunctionComponent<ListProps<object>>).displayName = "List"

// ===== ITEM (LIST CELL) VARIANTS =====

export interface ItemProps {
  text: string

  // Type - top-level discriminator matching Figma's ListItem types
  type?: 'item' | 'heading' | 'separator' | 'footer'

  // Heading sub-type
  headingType?: 'primary' | 'secondary' | 'tertiary'

  // Item variant - only applies when type='item'
  variant?: 'default' | 'hint' | 'chevron' | 'icon' | 'iconOverlay' | 'iconRight' | 'counter' | 'checkbox' | 'buttons' | 'rightHint' | 'changes'

  // Content
  hint?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  counter?: number | string
  rightHint?: string

  // Icon After Text - icon placed inline after the text label
  iconAfterText?: React.ReactNode

  // Tag - inline tag/badge
  tag?: React.ReactNode

  // Changes variant
  additions?: number
  deletions?: number

  // Icon variants
  hasOverlay?: boolean
  overlayIcon?: React.ReactNode

  // Nesting level - indentation depth for nested items
  nestingLevel?: number

  // Controls
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  buttons?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'dangerous'
  }>
  ghostButtons?: Array<{
    icon: React.ReactNode
    onClick: () => void
  }>

  // Layout
  className?: string
  onClick?: () => void
}

/** @deprecated Use ItemProps instead */
export type FleetListCellProps = ItemProps

export const ListItem = React.forwardRef<HTMLDivElement, ItemProps>(
  ({
    text,
    type = 'item',
    headingType = 'primary',
    variant = 'default',
    hint,
    icon,
    rightIcon,
    counter,
    rightHint,
    iconAfterText,
    tag,
    additions,
    deletions,
    hasOverlay = false,
    overlayIcon,
    nestingLevel = 0,
    checked,
    onCheckedChange,
    buttons,
    ghostButtons,
    className,
    onClick
  }, ref) => {
    // Type: Separator — Figma: separator/default=#ffffff21, padding 4px top/bottom
    if (type === 'separator') {
      return (
        <div
          ref={ref}
          className={cn("w-full py-1", className)}
          onClick={onClick}
        >
          <div className="h-px w-full" style={{ background: 'var(--fleet-separator-default)' }} />
        </div>
      )
    }

    // Type: Heading — Figma: Primary=SemiBold 13/16, Secondary=Medium 12/16, Tertiary=H5 Bold 10/14 uppercase
    if (type === 'heading') {
      const headingVariant = headingType === 'primary' ? 'default-semibold'
        : headingType === 'tertiary' ? 'header-5-semibold'
        : 'medium' as const

      const headingColor = headingType === 'primary'
        ? 'var(--fleet-listItem-text-default)'
        : 'var(--fleet-listItem-text-secondary)'

      return (
        <div
          ref={ref}
          className={cn("w-full flex items-center gap-1", className)}
          style={{ paddingLeft: 8, paddingRight: 4, paddingTop: 4, paddingBottom: 4 }}
          onClick={onClick}
        >
          <Typography
            variant={headingVariant}
            style={{ color: headingColor }}
          >
            {text}
          </Typography>
        </div>
      )
    }

    // Type: Footer — Figma: link/text/default=#4b8dec, padding-left 12px, padding-y 6px, bg #ffffff12
    if (type === 'footer') {
      return (
        <div
          ref={ref}
          className={cn("w-full flex items-center gap-1 cursor-pointer", className)}
          style={{ paddingLeft: 12, paddingTop: 6, paddingBottom: 6, background: 'var(--fleet-popup-footer-background)' }}
          onClick={onClick}
        >
          <Typography
            style={{ color: 'var(--fleet-link-text-default)' }}
          >
            {text}
          </Typography>
        </div>
      )
    }

    // Type: Item (default)
    const nestingPadding = nestingLevel > 0 ? { paddingLeft: `${nestingLevel * 16}px` } : undefined

    const renderIconAfterTextAndTag = () => (
      <>
        {iconAfterText && (
          <div className="flex-shrink-0 w-4 h-4">
            {iconAfterText}
          </div>
        )}
        {tag && (
          <span className="flex-shrink-0 text-medium leading-medium rounded-[var(--fleet-radius-xs)] px-1" style={{ background: 'var(--fleet-tag-default-background)', color: 'var(--fleet-tag-default-text)', border: '1px solid var(--fleet-tag-default-border)' }}>
            {tag}
          </span>
        )}
      </>
    )

    const renderControls = () => {
      const hasControls = counter !== undefined || rightIcon || buttons?.length || ghostButtons?.length || rightHint || checked !== undefined || (additions !== undefined || deletions !== undefined)
      if (!hasControls) return null

      return (
        <div className="flex items-center gap-1 flex-shrink-0" style={{ paddingLeft: 4, paddingTop: 2, paddingRight: 2, paddingBottom: 2 }}>
          {rightHint && (
            <Typography style={{ color: 'var(--fleet-listItem-text-secondary)' }}>
              {rightHint}
            </Typography>
          )}
          {counter !== undefined && (
            <Typography variant="medium" as="span" style={{ color: 'var(--fleet-listItem-text-secondary)' }}>
              {counter}
            </Typography>
          )}
          {(additions !== undefined || deletions !== undefined) && (
            <div className="flex items-center gap-1">
              {additions !== undefined && additions > 0 && (
                <Typography variant="medium" as="span" style={{ color: 'var(--fleet-git-text-added)' }}>+{additions}</Typography>
              )}
              {deletions !== undefined && deletions > 0 && (
                <Typography variant="medium" as="span" style={{ color: 'var(--fleet-git-text-deleted)' }}>-{deletions}</Typography>
              )}
            </div>
          )}
          {ghostButtons?.map((ghostButton, index) => (
            <button
              key={index}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--fleet-ghostButton-off-background-hovered)] transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                ghostButton.onClick()
              }}
            >
              {ghostButton.icon}
            </button>
          ))}
          {buttons?.map((button, index) => (
            <Button
              key={index}
              variant={button.variant || 'secondary'}
              onClick={(e) => {
                e.stopPropagation()
                button.onClick()
              }}
            >
              {button.label}
            </Button>
          ))}
          {rightIcon && (
            <div className="flex-shrink-0 flex items-center h-4">
              {rightIcon}
            </div>
          )}
        </div>
      )
    }

    const renderContent = () => {
      switch (variant) {
        case 'default':
          return (
            <div className="flex items-center gap-1 w-full min-w-0">
              <Typography className="truncate">{text}</Typography>
              {renderIconAfterTextAndTag()}
              {renderControls()}
            </div>
          )

        case 'hint':
          return (
            <div className="flex items-center gap-1 w-full min-w-0">
              <Typography className="truncate">{text}</Typography>
              {hint && (
                <Typography className="truncate" style={{ color: 'var(--fleet-listItem-text-secondary)' }}>
                  {hint}
                </Typography>
              )}
              {renderIconAfterTextAndTag()}
              {renderControls()}
            </div>
          )

        case 'chevron':
          return (
            <div className="flex items-center gap-1 w-full min-w-0">
              <Icon fleet="chevron-right" size="sm" className="flex-shrink-0" />
              <Typography className="truncate">{text}</Typography>
              {renderIconAfterTextAndTag()}
              {renderControls()}
            </div>
          )

        case 'icon':
        case 'iconOverlay':
          return (
            <div className="flex items-center gap-1 w-full min-w-0">
              <div className="relative flex-shrink-0 w-4 h-4">
                {icon}
                {variant === 'iconOverlay' && hasOverlay && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 flex items-center justify-center">
                    {overlayIcon || <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                )}
              </div>
              <Typography className="truncate">{text}</Typography>
              {renderIconAfterTextAndTag()}
              {renderControls()}
            </div>
          )

        case 'iconRight':
          return (
            <div className="flex items-center justify-between gap-1 w-full min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <Typography className="truncate">{text}</Typography>
                {renderIconAfterTextAndTag()}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="flex-shrink-0 w-4 h-4">
                  {rightIcon || icon}
                </div>
              </div>
            </div>
          )

        case 'counter':
          return (
            <div className="flex items-center justify-between gap-1 w-full min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <Typography className="truncate">{text}</Typography>
                {renderIconAfterTextAndTag()}
              </div>
              {renderControls()}
            </div>
          )

        case 'checkbox':
          return (
            <div className="flex items-center gap-1 w-full min-w-0">
              <Checkbox
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="flex-shrink-0"
              />
              <Typography className="truncate">{text}</Typography>
              {renderIconAfterTextAndTag()}
              {renderControls()}
            </div>
          )

        case 'buttons':
          return (
            <div className="flex items-center justify-between gap-1 w-full min-w-0">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                {icon && (
                  <div className="relative flex-shrink-0 w-4 h-4">
                    {icon}
                  </div>
                )}
                <Typography className="truncate">{text}</Typography>
                {hint && (
                  <Typography className="truncate" style={{ color: 'var(--fleet-listItem-text-secondary)' }}>
                    {hint}
                  </Typography>
                )}
                {renderIconAfterTextAndTag()}
              </div>
              {renderControls()}
            </div>
          )

        case 'rightHint':
          return (
            <div className="flex items-center justify-between gap-1 w-full min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <Typography className="truncate">{text}</Typography>
                {renderIconAfterTextAndTag()}
              </div>
              {renderControls()}
            </div>
          )

        case 'changes':
          return (
            <div className="flex items-center justify-between gap-1 w-full min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                {icon && (
                  <div className="flex-shrink-0 w-4 h-4">
                    {icon}
                  </div>
                )}
                <Typography className="truncate">{text}</Typography>
                {hint && (
                  <Typography className="truncate" style={{ color: 'var(--fleet-listItem-text-secondary)' }}>
                    {hint}
                  </Typography>
                )}
                {renderIconAfterTextAndTag()}
              </div>
              {renderControls()}
            </div>
          )

        default:
          return (
            <div className="flex items-center gap-1 w-full min-w-0">
              <Typography className="truncate">{text}</Typography>
              {renderIconAfterTextAndTag()}
              {renderControls()}
            </div>
          )
      }
    }

    return (
      <div
        ref={ref}
        className={cn("w-full flex items-center gap-1", className)}
        style={{ paddingLeft: 8, paddingRight: 4, paddingTop: 4, paddingBottom: 4, ...nestingPadding }}
        onClick={onClick}
      >
        {renderContent()}
      </div>
    )
  }
)
ListItem.displayName = "ListItem"

/** @deprecated Use ListItem instead */
export const FleetListCell = ListItem

// ===== UTILITY COMPONENTS =====

export interface DefaultListItemProps {
  text: string
  icon?: React.ReactNode
  secondary?: string
  className?: string
}

export const DefaultListItem = React.forwardRef<HTMLDivElement, DefaultListItemProps>(
  ({ text, icon, secondary, className }, ref) => {
    return (
      <ListItem
        ref={ref}
        variant={secondary ? "hint" : "default"}
        text={text}
        hint={secondary}
        icon={icon}
        className={className}
      />
    )
  }
)
DefaultListItem.displayName = "DefaultListItem"

export { listVariants, listItemVariants }
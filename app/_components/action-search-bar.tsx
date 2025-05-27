"use client"

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Input } from "@/app/_components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Send, BarChart2, Globe, Video, PlaneTakeoff, AudioLines, X } from "lucide-react"
import { cn } from "../_lib/utils"
import useDebounce from "../_hooks/use-debounce"
import { toast } from "sonner"

export interface Action {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  shortcut?: string
  category?: string
  onClick?: () => void
  prefix?: string
  regex?: RegExp
  placeholder?: string
}

export interface ActionSearchBarProps {
  actions?: Action[]
  defaultActions?: boolean
  autoFocus?: boolean
  isFloating?: boolean
  placeholder?: string
  onSearch?: (query: string) => void
  onActionSelect?: (actionId: string) => void
  onSuggestionSelect?: (suggestion: any) => void
  className?: string
  inputClassName?: string
  dropdownClassName?: string
  showShortcutHint?: boolean
  commandKey?: string
  value?: string
  onChange?: (value: string) => void
  activeActionId?: string | null
  onClearAction?: () => void
  showActiveAction?: boolean
}

const defaultActionsList: Action[] = [
  {
    id: "1",
    label: "Book tickets",
    icon: <PlaneTakeoff className="h-4 w-4 text-blue-500" />,
    description: "Operator",
    shortcut: "⌘K",
    category: "Agent",
  },
  {
    id: "2",
    label: "Summarize",
    icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
    description: "gpt-4o",
    shortcut: "⌘cmd+p",
    category: "Command",
  },
  {
    id: "3",
    label: "Screen Studio",
    icon: <Video className="h-4 w-4 text-purple-500" />,
    description: "gpt-4o",
    category: "Application",
  },
  {
    id: "4",
    label: "Talk to Jarvis",
    icon: <AudioLines className="h-4 w-4 text-green-500" />,
    description: "gpt-4o voice",
    category: "Active",
  },
  {
    id: "5",
    label: "Translate",
    icon: <Globe className="h-4 w-4 text-blue-500" />,
    description: "gpt-4o",
    category: "Command",
  },
]

const ActionSearchBar = forwardRef<HTMLInputElement, ActionSearchBarProps>(
  (
    {
      actions,
      defaultActions = true,
      autoFocus = false,
      isFloating = false,
      placeholder = "What's up?",
      onSearch,
      onActionSelect,
      onSuggestionSelect,
      className,
      inputClassName,
      dropdownClassName,
      showShortcutHint = true,
      commandKey = "⌘K",
      value,
      onChange,
      activeActionId,
      onClearAction,
      showActiveAction = true,
    },
    ref,
  ) => {
    const allActionsList = React.useMemo(() => {
      return defaultActions ? [...(actions || []), ...defaultActionsList] : actions || defaultActionsList
    }, [actions, defaultActions]);

    const [query, setQuery] = useState(value || "")
    const [filteredActions, setFilteredActions] = useState<Action[]>(allActionsList)
    const [isFocused, setIsFocused] = useState(autoFocus)
    const [selectedAction, setSelectedAction] = useState<Action | null>(null)
    const debouncedQuery = useDebounce(query, 200)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const activeAction = React.useMemo(() => {
      if (!activeActionId) return null;
      return allActionsList.find(action => action.id === activeActionId) || null;
    }, [activeActionId, allActionsList]);

    useEffect(() => {
      if (value !== undefined) {
        setQuery(value);
      }
    }, [value]);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus()

        // Position cursor at the end of any prefix
        if (activeAction?.prefix) {
          inputRef.current.selectionStart = activeAction.prefix.length;
          inputRef.current.selectionEnd = activeAction.prefix.length;
        }
      }
    }, [autoFocus, activeAction])

    useEffect(() => {
      if (!debouncedQuery) {
        setFilteredActions(allActionsList)
        return
      }

      const normalizedQuery = debouncedQuery.toLowerCase().trim()
      const filtered = allActionsList.filter((action) => {
        const searchableText = `${action.label} ${action.description || ""}`.toLowerCase()
        return searchableText.includes(normalizedQuery)
      })

      setFilteredActions(filtered)

      if (onSearch) {
        onSearch(debouncedQuery)
      }
    }, [debouncedQuery, allActionsList, onSearch])

    useEffect(() => {
      if (activeAction?.prefix && onChange) {
        if (!value?.startsWith(activeAction.prefix)) {
          onChange(activeAction.prefix + (value || "").replace(activeAction.prefix || "", ""));
        }
      }
    }, [activeAction, onChange, value]);

    useEffect(() => {
      if (activeAction?.prefix && onChange) {
        if (!value?.startsWith(activeAction.prefix)) {
          onChange(activeAction.prefix + (value || "").replace(activeAction.prefix || "", ""));

          // Trigger the onChange handler immediately with the prefix
          // This ensures suggestions appear right away
          if (value === "") {
            onChange(activeAction.prefix);
          }
        }
      }
    }, [activeAction, onChange, value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // More careful prefix enforcement
      if (activeAction?.prefix) {
        if (!newValue.startsWith(activeAction.prefix)) {
          // If the user is trying to delete the entire value including prefix,
          // just keep the prefix alone
          const valueWithPrefix = activeAction.prefix;

          if (onChange) {
            onChange(valueWithPrefix);
          } else {
            setQuery(valueWithPrefix);
          }

          // Restore cursor position after prefix
          setTimeout(() => {
            if (!inputRef.current || !activeAction.prefix) {
              return toast.error("Error: Input ref is null or prefix is undefined");
            }

            inputRef.current.selectionStart = activeAction.prefix.length;
            inputRef.current.selectionEnd = activeAction.prefix.length;
          }, 0);

          return;
        }
      }

      if (onChange) {
        onChange(newValue);
      } else {
        setQuery(newValue);
      }
    }

    const handleActionClick = (action: Action) => {
      setSelectedAction(action)

      if (action.onClick) {
        action.onClick()
      }

      if (onActionSelect) {
        onActionSelect(action.id)
      }

      if (onChange && action.prefix !== undefined) {
        onChange(action.prefix);
      } else {
        setQuery(action.prefix || "");
      }

      if (isFloating && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      } else {
        inputRef.current?.blur()
      }

      setSelectedAction(null);
    }

    const handleClearAction = (e: React.MouseEvent) => {
      e.stopPropagation();

      if (onClearAction) {
        onClearAction();
      }

      if (!onChange) {
        setQuery("");
      }

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        inputRef.current?.blur()
        setIsFocused(false)
      }
    }

    const container = {
      hidden: { opacity: 0, height: 0 },
      show: {
        opacity: 1,
        height: "auto",
        transition: {
          height: {
            duration: 0.4,
          },
          staggerChildren: 0.1,
        },
      },
      exit: {
        opacity: 0,
        height: 0,
        transition: {
          height: {
            duration: 0.3,
          },
          opacity: {
            duration: 0.2,
          },
        },
      },
    }

    const item = {
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
        },
      },
      exit: {
        opacity: 0,
        y: -10,
        transition: {
          duration: 0.2,
        },
      },
    }

    return (
      <div className={cn("relative w-full", isFloating ? "bg-background rounded-lg shadow-lg" : "", className)}>
        <div className="relative">
          {activeAction && showActiveAction && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center z-10 bg-muted/50 rounded-md px-1.5 py-0.5 max-w-[45%] mr-2">
              <span className="mr-1.5 flex-shrink-0">{activeAction.icon}</span>
              <span className="text-xs font-medium truncate mr-1">
                {activeAction.label.replace("Search by ", "")}
              </span>
              <button
                type="button"
                onClick={handleClearAction}
                className="flex-shrink-0 rounded-full hover:bg-muted p-0.5"
                title="Clear search type"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <Input
            ref={inputRef}
            type="text"
            placeholder={activeAction?.placeholder || placeholder}
            value={value !== undefined ? value : query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !isFloating && setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            className={cn(
              "py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0",
              activeAction ? "pl-[120px]" : "pl-3",
              "pr-9",
              inputClassName
            )}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
            <AnimatePresence mode="popLayout">
              {(value || query).length > 0 ? (
                <motion.div
                  key="send"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {(isFocused || isFloating) && filteredActions.length > 0 && !selectedAction && !activeAction && (
            <motion.div
              className={cn(
                isFloating ? "relative mt-2" : "absolute left-0 right-0 z-50",
                "border rounded-md shadow-lg overflow-hidden dark:border-gray-800 bg-background",
                dropdownClassName,
              )}
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.ul>
                {filteredActions.map((action) => (
                  <motion.li
                    key={action.id}
                    className="px-3 py-2 flex items-center justify-between hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    variants={item}
                    layout
                    onClick={() => handleActionClick(action)}
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{action.icon}</span>
                        <span className="text-sm font-medium">{action.label}</span>
                        {action.description && (
                          <span className="text-xs text-muted-foreground">{action.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.shortcut && <span className="text-xs text-muted-foreground">{action.shortcut}</span>}
                      {action.category && (
                        <span className="text-xs text-muted-foreground text-right">{action.category}</span>
                      )}
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
              {showShortcutHint && (
                <div className="mt-2 px-3 py-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Press {commandKey} to open commands</span>
                    <span>ESC to cancel</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

ActionSearchBar.displayName = "ActionSearchBar"

export default ActionSearchBar

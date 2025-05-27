"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActionSearchBar from "@/app/_components/action-search-bar";

export interface Action {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  shortcut?: string
  category?: string
  onClick?: () => void
}

export interface ActionSearchBarProps {
  actions?: Action[]
  defaultActions?: boolean
  autoFocus?: boolean
  isFloating?: boolean
  placeholder?: string
  onSearch?: (query: string) => void
  onActionSelect?: (action: Action) => void
  className?: string
  inputClassName?: string
  dropdownClassName?: string
  showShortcutHint?: boolean
  commandKey?: string
}

export const FloatingActionSearchBar = forwardRef<HTMLInputElement, ActionSearchBarProps>(
  (
    {
      actions,
      defaultActions = true,
      autoFocus = false,
      isFloating = false,
      placeholder = "What's up?",
      onSearch,
      onActionSelect,
      className,
      inputClassName,
      dropdownClassName,
      showShortcutHint = true,
      commandKey = "⌘K",
    },
    ref,
  ) => {
  const [isOpen, setIsOpen] = useState(false);
  const searchBarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && searchBarRef.current) {
      searchBarRef.current.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 lg:p-40"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg sm:max-w-xl md:max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionSearchBar
              ref={searchBarRef}
              autoFocus={true}
              isFloating={true}
              actions={actions}
              defaultActions={defaultActions}
              placeholder={placeholder}
              onSearch={onSearch}

              className={className}
              inputClassName={inputClassName}
              dropdownClassName={dropdownClassName}
              showShortcutHint={showShortcutHint}
              commandKey={commandKey}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  });

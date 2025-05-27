"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Button } from "@/app/_components/ui/button";
import { Check, Search, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { Badge } from "@/app/_components/ui/badge";
import { Input } from "@/app/_components/ui/input";
import { cn } from "@/app/_lib/utils";

type Option<T> = {
  value: T;
  prefix?: LucideIcon;
  label: string;
  subLabel?: string;
  beta?: boolean;
  isCurrent?: boolean;
};

type Variant = "outline" | "ghost";

interface DropdownSwitcherProps<T> {
  options: Option<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
  showTitle?: boolean;
  title?: string;
  prefix?: boolean;
  suffix?: LucideIcon;
  variant?: Variant;
  searchable?: boolean;
  searchPlaceholder?: string;
  currentLabel?: string;
  selectLabel?: string;
  disabled?: boolean;
}

const ICON_SIZE = 16;

const DropdownSwitcher = <T extends string>({
  options,
  selectedValue,
  onChange,
  showTitle = false,
  title = "Select",
  prefix = true,
  suffix,
  variant = "outline",
  searchable = false,
  searchPlaceholder = "Search...",
  currentLabel = "Current timezone",
  selectLabel = "Select a timezone",
  disabled = false,
}: DropdownSwitcherProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentOption = useMemo(
    () =>
      options.find((option) => option.value === selectedValue) || options[0],
    [selectedValue, options]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query) ||
        (option.subLabel && option.subLabel.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  const { currentOptions, selectableOptions } = useMemo(
    () => ({
      currentOptions: filteredOptions.filter(
        (opt) => opt.value === selectedValue
      ),
      selectableOptions: filteredOptions.filter(
        (opt) => opt.value !== selectedValue
      ),
    }),
    [filteredOptions, selectedValue]
  );

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable) {
      const timeoutId = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, searchable]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const handleOptionSelect = useCallback(
    (value: T) => {
      onChange(value);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleSearchInteraction = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
    },
    []
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={showTitle ? "sm" : "icon"}
          className={cn(
            variant !== "outline" ? "" : "border-2",
            showTitle ? "flex justify-center items-center" : ""
          )}
          aria-label={`Current selection: ${selectedValue}`}
          disabled={disabled}
        >
          {prefix && currentOption.prefix && (
            <currentOption.prefix
              size={ICON_SIZE}
              className="text-muted-foreground"
            />
          )}
          {showTitle && (
            <span className="text-muted-foreground font-medium">{title}</span>
          )}
          {!prefix &&
            suffix &&
            React.createElement(suffix, {
              size: ICON_SIZE,
              className: "text-muted-foreground",
            })}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[300px] max-h-[400px] overflow-auto"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {searchable && (
          <div
            className="sticky top-0 bg-background z-50 px-2 py-2"
            onClick={handleSearchInteraction}
            onMouseDown={handleSearchInteraction}
          >
            <div className="relative"></div>
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 h-9"
              onClick={handleSearchInteraction}
              onMouseDown={handleSearchInteraction}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setIsOpen(false);
                }
              }}
              disabled={disabled}
            />
          </div>
        )}

        {currentOptions.length > 0 && (
          <>
            <div className="px-2 py-1.5">
              <p className="text-sm text-muted-foreground mb-1">
                {currentLabel}
              </p>
              {currentOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="flex items-center justify-between py-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    {option.subLabel && (
                      <span className="text-sm text-muted-foreground">
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  <Check className="h-4 w-4" />
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <div className="px-2 py-1.5">
          <p className="text-sm text-muted-foreground mb-1">{selectLabel}</p>
          {selectableOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No timezones found
            </p>
          ) : (
            selectableOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="flex items-center justify-between py-2"
                onClick={() => handleOptionSelect(option.value)}
                disabled={disabled}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  {option.subLabel && (
                    <span className="text-sm text-muted-foreground">
                      {option.subLabel}
                    </span>
                  )}
                </div>
                {option.beta && (
                  <Badge className="w-fit bg-secondary-foreground dark:bg-muted hover:bg-secondary-foreground dark:hover:bg-muted text-[10px] rounded px-1 py-0">
                    BETA
                  </Badge>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownSwitcher;

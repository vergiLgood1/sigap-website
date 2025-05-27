"use client";

import React from "react";

import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { Laptop, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";

type Variant =
  | "link"
  | "outline"
  | "default"
  | "destructive"
  | "secondary"
  | "ghost";

interface ThemeSwitcherComponentProps {
  showTitle?: boolean;
  title?: string;
  prefix?: boolean;
  suffix?: LucideIcon;
  variant?: Variant;
}

type ThemeOption = {
  value: string;
  icon: LucideIcon;
  label: string;
};

const ICON_SIZE = 16;

const themeOptions: ThemeOption[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Laptop, label: "System" },
];

const ThemeSwitcherComponent = ({
  showTitle = false,
  title,
  prefix = true,
  suffix,
  variant = "outline",
}: ThemeSwitcherComponentProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = useMemo(
    () =>
      themeOptions.find((option) => option.value === theme) || themeOptions[2],
    [theme]
  );

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={showTitle ? "sm" : "icon"}
          className={`${variant != "outline" ? "" : "border-2"} ${showTitle ? "flex justify-center items-center" : ""}`}
          aria-label={`Current theme: ${theme}`}
        >
          {prefix && (
            <currentTheme.icon
              size={ICON_SIZE}
              className="text-muted-foreground"
            />
          )}
          {showTitle && (
            <span className="text-muted-foreground font-medium">
              {title || currentTheme.label}
            </span>
          )}
          {!prefix &&
            suffix &&
            React.createElement(suffix, {
              size: ICON_SIZE,
              className: "text-muted-foreground",
            })}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {themeOptions.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              className="flex gap-2"
              value={option.value}
            >
              <option.icon size={ICON_SIZE} className="text-muted-foreground" />
              <span>{option.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ThemeSwitcher = React.memo(ThemeSwitcherComponent);

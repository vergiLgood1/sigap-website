import React, { ReactNode } from "react";
import { ListFilter, LucideIcon } from "lucide-react";
import { Button } from "@/app/_components/ui/button";

interface FilterButtonProps {
    activeFilterCount: number;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    icon?: LucideIcon;
    label?: string;
    className?: string;
    children?: ReactNode;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
    activeFilterCount,
    onClick,
    variant = "outline",
    size = "default",
    icon: Icon = ListFilter,
    label = "Filters",
    className = "",
    children,
}) => {
    return (
        <Button
            variant={variant}
            size={size}
            className={`${activeFilterCount > 0 ? "relative" : ""} ${className}`}
            onClick={onClick}
        >
            <Icon className="h-4 w-4 mr-2" />
            {label || children}
            {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {activeFilterCount}
                </span>
            )}
        </Button>
    );
};

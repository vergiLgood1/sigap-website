import React, { ReactNode } from "react";
import { ActionMenu, ActionItem } from "@/app/_components/ui/action-menu";
import { FilterButton } from "@/app/_components/ui/filter-button";
import { LucideIcon, Plus, ListFilter } from "lucide-react";

interface ActionToolbarProps {
    // Main action button/dropdown props
    primaryAction?: {
        label: string;
        icon?: LucideIcon;
        variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
        items?: ActionItem[];
        onClick?: () => void;
    };

    // Filter button props
    filter?: {
        show: boolean;
        count: number;
        onClick: () => void;
        label?: string;
        icon?: LucideIcon;
    };

    // Additional components to render in the toolbar
    additionalControls?: ReactNode;

    // Layout and styling
    className?: string;
    align?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
    primaryAction,
    filter,
    additionalControls,
    className = "",
    align = "between"
}) => {
    // Map alignment value to Tailwind class
    const alignmentClass = {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly"
    }[align];

    return (
        <div className={`flex items-center ${alignmentClass} ${className}`}>
            {primaryAction && (
                <>
                    {primaryAction.items ? (
                        <ActionMenu
                            buttonLabel={primaryAction.label}
                            buttonIcon={primaryAction.icon || Plus}
                            items={primaryAction.items}
                            variant={primaryAction.variant || "default"}
                        />
                    ) : primaryAction.onClick && (
                        <FilterButton
                            activeFilterCount={0}
                            onClick={primaryAction.onClick}
                            icon={primaryAction.icon || Plus}
                            label={primaryAction.label}
                            variant={primaryAction.variant || "default"}
                        />
                    )}
                </>
            )}

            {additionalControls}

            {filter?.show && (
                <FilterButton
                    activeFilterCount={filter.count}
                    onClick={filter.onClick}
                    icon={filter.icon}
                    label={filter.label}
                />
            )}
        </div>
    );
};

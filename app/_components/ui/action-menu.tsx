import React from "react";
import { ChevronDown, LucideIcon, Plus } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";

export interface ActionItem {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
}

interface ActionMenuProps {
    buttonLabel: string;
    buttonIcon?: LucideIcon;
    items: ActionItem[];
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
    className?: string;
    align?: "center" | "start" | "end";
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
    buttonLabel,
    buttonIcon: ButtonIcon = Plus,
    items,
    variant = "outline",
    className = "gap-1",
    align = "end"
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} className={className}>
                    <ButtonIcon className="h-4 w-4" />
                    {buttonLabel}
                    <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <DropdownMenuItem key={index} onClick={item.onClick}>
                            <Icon className="h-4 w-4 mr-2" />
                            {item.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

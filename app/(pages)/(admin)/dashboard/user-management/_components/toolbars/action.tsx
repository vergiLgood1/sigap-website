// components/user-management/toolbar/user-actions-menu.tsx


import React from "react";
import { PlusCircle, ChevronDown, UserPlus, Mail, Plus } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";

interface UserActionsMenuProps {
    setIsAddUserDialogOpen: (isOpen: boolean) => void;
    setIsInviteUserDialogOpen: (isOpen: boolean) => void;
}

export const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
    setIsAddUserDialogOpen,
    setIsInviteUserDialogOpen,
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add User
                    <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsAddUserDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create new user
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsInviteUserDialogOpen(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send invitation
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
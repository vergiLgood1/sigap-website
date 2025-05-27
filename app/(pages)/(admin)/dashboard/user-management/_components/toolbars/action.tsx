// components/user-management/toolbar/user-actions-menu.tsx


import React from "react";
import { Plus, UserPlus, Mail } from "lucide-react";
import { ActionMenu, ActionItem } from "@/app/_components/ui/action-menu";

interface UserActionsMenuProps {
    setIsAddUserDialogOpen: (isOpen: boolean) => void;
    setIsInviteUserDialogOpen: (isOpen: boolean) => void;
}

export const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
    setIsAddUserDialogOpen,
    setIsInviteUserDialogOpen,
}) => {
    const actionItems: ActionItem[] = [
        {
            label: "Create new user",
            icon: UserPlus,
            onClick: () => setIsAddUserDialogOpen(true),
        },
        {
            label: "Send invitation",
            icon: Mail,
            onClick: () => setIsInviteUserDialogOpen(true),
        }
    ];

    return (
        <ActionMenu
            buttonLabel="Add User"
            buttonIcon={Plus}
            items={actionItems}
            variant="outline"
        />
    );
};
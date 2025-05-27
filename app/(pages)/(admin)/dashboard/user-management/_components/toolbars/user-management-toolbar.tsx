// components/user-management/toolbar/user-management-toolbar.tsx

import React from "react";
import { SearchInput } from "./search-input";
import { UserActionsMenu } from "./action";

import { calculateUserStats } from "@/app/_utils/common";
import { useGetUsersQuery } from "../../_queries/queries";
import { UserFilterButton } from "./filter-button";


interface UserManagementToolbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setIsAddUserDialogOpen: (isOpen: boolean) => void;
    setIsInviteUserDialogOpen: (isOpen: boolean) => void;
    activeFilterCount: number;
    clearFilters: () => void;
    currentPageDataCount?: number;
}

export const UserManagementToolbar: React.FC<UserManagementToolbarProps> = ({
    searchQuery,
    setSearchQuery,
    setIsAddUserDialogOpen,
    setIsInviteUserDialogOpen,
    activeFilterCount,
    clearFilters,
    currentPageDataCount,
}) => {

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
                <h2 className="text-lg font-semibold">Users in table <span className="text-muted-foreground">{currentPageDataCount}</span></h2>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <SearchInput
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
                <UserFilterButton
                    activeFilterCount={activeFilterCount}
                    clearFilters={clearFilters}
                />
                <UserActionsMenu
                    setIsAddUserDialogOpen={setIsAddUserDialogOpen}
                    setIsInviteUserDialogOpen={setIsInviteUserDialogOpen}
                />
            </div>
        </div>
    );
};
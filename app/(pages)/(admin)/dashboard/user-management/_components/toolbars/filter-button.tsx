// components/user-management/toolbar/filter-button.tsx


import React from "react";
import { FilterButton } from "@/app/_components/ui/filter-button";

interface UserFilterButtonProps {
    activeFilterCount: number;
    clearFilters: () => void;
}

export const UserFilterButton: React.FC<UserFilterButtonProps> = ({
    activeFilterCount,
    clearFilters,
}) => {
    return (
        <FilterButton
            activeFilterCount={activeFilterCount}
            onClick={clearFilters}
        />
    );
};
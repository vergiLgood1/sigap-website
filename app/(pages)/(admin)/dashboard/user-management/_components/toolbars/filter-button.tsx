// components/user-management/toolbar/filter-button.tsx


import React from "react";
import { ListFilter } from "lucide-react";
import { Button } from "@/app/_components/ui/button";

interface FilterButtonProps {
    activeFilterCount: number;
    clearFilters: () => void;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
    activeFilterCount,
    clearFilters,
}) => {
    return (
        <Button
            variant="outline"
            size="default"
            className={activeFilterCount > 0 ? "relative" : ""}
            onClick={clearFilters}
        >
            <ListFilter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {activeFilterCount}
                </span>
            )}
        </Button>
    );
};
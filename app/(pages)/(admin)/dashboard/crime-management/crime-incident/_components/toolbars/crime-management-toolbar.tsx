"use client";

import React from "react";
import { Button } from "@/app/_components/ui/button";
import { SearchInput } from "@/app/_components/ui/search-input";
import { FilterButton } from "@/app/_components/ui/filter-button";
import { Plus } from "lucide-react";

interface CrimeManagementToolbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeFilterCount: number;
    clearFilters: () => void;
    onAddNewCase?: () => void;
    currentPageDataCount?: number;
}

export function CrimeManagementToolbar({
    searchQuery,
    setSearchQuery,
    activeFilterCount,
    clearFilters,
    onAddNewCase,
    currentPageDataCount = 0,
}: CrimeManagementToolbarProps) {
    return (
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <SearchInput
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search cases..."
                    width="w-full sm:w-64 md:w-80"
                />
                <FilterButton
                    activeFilterCount={activeFilterCount}
                    onClick={clearFilters}
                    label="Filters"
                />
            </div>
            <div className="flex items-center gap-2">
                {currentPageDataCount > 0 && (
                    <span className="text-sm text-muted-foreground hidden sm:block">
                        {currentPageDataCount} result{currentPageDataCount !== 1 && "s"}
                    </span>
                )}
                {onAddNewCase && (
                    <Button onClick={onAddNewCase} className="ml-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        New Case
                    </Button>
                )}
            </div>
        </div>
    );
}

// components/user-management/toolbar/search-input.tsx


import React from "react";
import { SearchInput as ReusableSearchInput } from "@/app/_components/ui/search-input";

interface SearchInputProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    searchQuery,
    setSearchQuery,
}) => {
    return (
        <ReusableSearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search users..."
        />
    );
};
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";

interface SearchInputProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    placeholder?: string;
    width?: string;
    className?: string;
    inputClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    searchQuery,
    setSearchQuery,
    placeholder = "Search...",
    width = "w-full sm:w-72",
    className = "",
    inputClassName = "pl-8",
}) => {
    return (
        <div className={`relative ${width} ${className}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                className={inputClassName}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={() => setSearchQuery("")}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};

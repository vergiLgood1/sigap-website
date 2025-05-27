"use client";

import React from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Button } from "@/app/_components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/_components/ui/select";
import { ArrowUpDown } from "lucide-react";

export interface SortField {
    id: string;
    label: string;
}

export interface SortOption {
    field: string;
    direction: 'asc' | 'desc';
}

interface SortPopoverProps {
    fields: SortField[];
    currentSort: SortOption | null;
    onSortChange: (sort: SortOption | null) => void;
}

export function SortPopover({
    fields,
    currentSort,
    onSortChange,
}: SortPopoverProps) {
    const handleSortFieldChange = (field: string) => {
        if (!field) {
            onSortChange(null);
            return;
        }
        onSortChange({
            field,
            direction: currentSort?.direction || 'asc',
        });
    };

    const handleSortDirectionChange = (direction: 'asc' | 'desc') => {
        if (!currentSort) return;
        onSortChange({
            ...currentSort,
            direction,
        });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                    {currentSort && (
                        <span className="text-xs text-muted-foreground">
                            ({fields.find(f => f.id === currentSort.field)?.label} - {currentSort.direction === 'asc' ? 'Asc' : 'Desc'})
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px]" align="start">
                <div className="space-y-4">
                    <div className="text-sm font-medium">Sort by</div>

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Select
                            value={currentSort?.field || ""}
                            onValueChange={handleSortFieldChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {fields.map((field) => (
                                    <SelectItem key={field.id} value={field.id}>
                                        {field.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={currentSort?.direction || 'asc'}
                            onValueChange={(val: 'asc' | 'desc') => handleSortDirectionChange(val)}
                            disabled={!currentSort}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Direction" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascending</SelectItem>
                                <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

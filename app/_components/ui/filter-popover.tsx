"use client";

import React, { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import { X, Plus, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/_components/ui/select";
import { Input } from "@/app/_components/ui/input";

export interface FilterField {
    id: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date';
    options?: { value: string; label: string }[];
}

export interface FilterCondition {
    field: string;
    operator: string;
    value: string;
}

interface FilterPopoverProps {
    fields: FilterField[];
    activeFilters: FilterCondition[];
    onAddFilter: (filter: FilterCondition) => void;
    onRemoveFilter: (index: number) => void;
    onApplyFilters: () => void;
}

export function FilterPopover({
    fields,
    activeFilters,
    onAddFilter,
    onRemoveFilter,
    onApplyFilters,
}: FilterPopoverProps) {
    const [selectedField, setSelectedField] = useState<string>("");
    const [selectedOperator, setSelectedOperator] = useState<string>("=");
    const [filterValue, setFilterValue] = useState<string>("");

    const operators = [
        { value: "=", label: "=" },
        { value: "!=", label: "!=" },
        { value: ">", label: ">" },
        { value: "<", label: "<" },
        { value: ">=", label: ">=" },
        { value: "<=", label: "<=" },
        { value: "like", label: "contains" },
    ];

    const handleAddFilter = () => {
        if (selectedField && filterValue) {
            onAddFilter({
                field: selectedField,
                operator: selectedOperator,
                value: filterValue,
            });
            setFilterValue("");
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                    {activeFilters.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {activeFilters.length}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] sm:w-[400px]" align="start">
                <div className="space-y-4">
                    <div className="text-sm font-medium">Filters</div>

                    {activeFilters.map((filter, index) => (
                        <div key={index} className="flex items-center gap-2 rounded border p-2">
                            <div className="flex-grow text-xs">
                                <span className="font-medium">
                                    {fields.find(f => f.id === filter.field)?.label || filter.field}
                                </span>
                                <span className="mx-1">{filter.operator}</span>
                                <span>{filter.value}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveFilter(index)}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}

                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                            <Select
                                value={selectedField}
                                onValueChange={setSelectedField}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fields.map((field) => (
                                        <SelectItem key={field.id} value={field.id}>
                                            {field.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedOperator}
                                onValueChange={setSelectedOperator}
                            >
                                <SelectTrigger className="h-8 w-[60px]">
                                    <SelectValue placeholder="=" />
                                </SelectTrigger>
                                <SelectContent>
                                    {operators.map((op) => (
                                        <SelectItem key={op.value} value={op.value}>
                                            {op.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Enter a value"
                                className="h-8"
                            />
                        </div>

                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={handleAddFilter}
                                disabled={!selectedField || !filterValue}
                            >
                                <Plus className="mr-1 h-3 w-3" /> Add filter
                            </Button>
                            <Button
                                size="sm"
                                className="text-xs"
                                onClick={onApplyFilters}
                                disabled={activeFilters.length === 0}
                            >
                                Apply filter
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// filters/date-filter.tsx

import React from "react"
import { DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuItem } from "@/app/_components/ui/dropdown-menu"

interface DateFilterProps {
    value: string
    onChange: (value: string) => void
    onClear: () => void
    includeNever?: boolean
}

export const DateFilter: React.FC<DateFilterProps> = ({ value, onChange, onClear, includeNever = false }) => {
    return (
        <>
            <DropdownMenuCheckboxItem
                checked={value === "today"}
                onCheckedChange={() => onChange(value === "today" ? "" : "today")}
            >
                Today
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
                checked={value === "week"}
                onCheckedChange={() => onChange(value === "week" ? "" : "week")}
            >
                Last 7 days
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
                checked={value === "month"}
                onCheckedChange={() => onChange(value === "month" ? "" : "month")}
            >
                Last 30 days
            </DropdownMenuCheckboxItem>
            {includeNever && (
                <DropdownMenuCheckboxItem
                    checked={value === "never"}
                    onCheckedChange={() => onChange(value === "never" ? "" : "never")}
                >
                    Never
                </DropdownMenuCheckboxItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClear}>Clear filter</DropdownMenuItem>
        </>
    )
}
// filters/status-filter.tsx


import React from "react"
import { DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuItem } from "@/app/_components/ui/dropdown-menu"

interface StatusFilterProps {
    statusValues: string[]
    onChange: (values: string[]) => void
    onClear: () => void
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ statusValues, onChange, onClear }) => {
    const toggleStatus = (status: string) => {
        const newStatus = [...statusValues]
        if (newStatus.includes(status)) {
            newStatus.splice(newStatus.indexOf(status), 1)
        } else {
            newStatus.push(status)
        }
        onChange(newStatus)
    }

    return (
        <>
            <DropdownMenuCheckboxItem
                checked={statusValues.includes("active")}
                onCheckedChange={() => toggleStatus("active")}
            >
                Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
                checked={statusValues.includes("unconfirmed")}
                onCheckedChange={() => toggleStatus("unconfirmed")}
            >
                Unconfirmed
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
                checked={statusValues.includes("banned")}
                onCheckedChange={() => toggleStatus("banned")}
            >
                Banned
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClear}>Clear filter</DropdownMenuItem>
        </>
    )
}
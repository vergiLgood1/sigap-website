// filters/status-filter.tsx


import React from "react"
import { DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuItem } from "@/app/_components/ui/dropdown-menu"

interface AccessFilterProps {
    statusValues: string[]
    onChange: (values: string[]) => void
    onClear: () => void
}

export const AccessFilter: React.FC<AccessFilterProps> = ({ statusValues, onChange, onClear }) => {
    const toggleStatus = (status: string) => {
        const newStatus = [...statusValues]
        if (newStatus.includes(status)) {
            newStatus.splice(newStatus.indexOf(status), 1)
        } else {
            newStatus.push(status)
        }
        onChange(newStatus)
    }

    const ACCESS = [
        "Admin",
        "Super Admin",
        "Data Export",
        "Data Import",
        "Insert",
        "Update",
        "Delete",
    ]

    return (
        <>
            {ACCESS.map((access) => (
                <DropdownMenuCheckboxItem
                    key={access}
                    checked={statusValues.includes(access)}
                    onCheckedChange={() => toggleStatus(access)}
                >
                    {access}
                </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClear}>Clear filter</DropdownMenuItem>
        </>
    )
}
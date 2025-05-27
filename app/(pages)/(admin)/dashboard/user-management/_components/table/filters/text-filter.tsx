// filters/text-filter.tsx

import React from "react"
import { Input } from "@/app/_components/ui/input"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/app/_components/ui/dropdown-menu"

interface TextFilterProps {
    placeholder: string
    value: string
    onChange: (value: string) => void
    onClear: () => void
}

export const TextFilter: React.FC<TextFilterProps> = ({ placeholder, value, onChange, onClear }) => {
    return (
        <>
            <div className="p-2">
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClear}>Clear filter</DropdownMenuItem>
        </>
    )
}
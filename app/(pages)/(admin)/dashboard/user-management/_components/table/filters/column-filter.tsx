// filters/column-filter.tsx


import React from "react"
import { ListFilter } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/app/_components/ui/dropdown-menu"
import { Button } from "@/app/_components/ui/button"

interface ColumnFilterProps {
    children: React.ReactNode
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({ children }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0 ml-1">
                    <ListFilter className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
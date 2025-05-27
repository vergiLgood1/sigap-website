// columns/phone-column.tsx
"use client"

import React from "react"
import type { HeaderContext } from "@tanstack/react-table"
import { IUserSchema, IUserFilterOptionsSchema } from "@/src/entities/models/users/users.model"
import { ColumnFilter } from "../filters/column-filter"
import { TextFilter } from "../filters/text-filter"
import { PhoneCell } from "../cells/phone-cell"

export const createPhoneColumn = (
    filters: IUserFilterOptionsSchema,
    setFilters: (filters: IUserFilterOptionsSchema) => void
) => {
    return {
        id: "phone",
        header: ({ column }: HeaderContext<IUserSchema, IUserSchema>) => (
            <div className="flex items-center gap-1">
                <span>Phone</span>
                <ColumnFilter>
                    <TextFilter
                        placeholder="Filter by phone..."
                        value={filters.phone}
                        onChange={(value) => setFilters({ ...filters, phone: value })}
                        onClear={() => setFilters({ ...filters, phone: "" })}
                    />
                </ColumnFilter>
            </div>
        ),
        cell: ({ row }: { row: { original: IUserSchema } }) => <PhoneCell phone={row.original.phone} />
    }
}
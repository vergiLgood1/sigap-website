// columns/created-at-column.tsx
"use client"

import React from "react"
import type { HeaderContext } from "@tanstack/react-table"
import { IUserSchema, IUserFilterOptionsSchema } from "@/src/entities/models/users/users.model"
import { ColumnFilter } from "../filters/column-filter"
import { DateFilter } from "../filters/date-filter"
import { CreatedAtCell } from "../cells/created-at-cell"

export const createCreatedAtColumn = (
    filters: IUserFilterOptionsSchema,
    setFilters: (filters: IUserFilterOptionsSchema) => void
) => {
    return {
        id: "createdAt",
        header: ({ column }: HeaderContext<IUserSchema, IUserSchema>) => (
            <div className="flex items-center gap-1">
                <span>Created At</span>
                <ColumnFilter>
                    <DateFilter
                        value={filters.createdAt}
                        onChange={(value) => setFilters({ ...filters, createdAt: value })}
                        onClear={() => setFilters({ ...filters, createdAt: "" })}
                    />
                </ColumnFilter>
            </div>
        ),
        cell: ({ row }: { row: { original: IUserSchema } }) => (
            <CreatedAtCell createdAt={row.original.created_at instanceof Date ? row.original.created_at.toISOString() : row.original.created_at} />
        )
    }
}
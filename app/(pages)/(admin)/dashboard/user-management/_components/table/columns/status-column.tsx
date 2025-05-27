// columns/status-column.tsx
"use client"

import React from "react"
import type { HeaderContext } from "@tanstack/react-table"
import { IUserSchema, IUserFilterOptionsSchema } from "@/src/entities/models/users/users.model"
import { ColumnFilter } from "../filters/column-filter"
import { StatusFilter } from "../filters/status-filter"
import { StatusCell } from "../cells/status-cell"

export const createStatusColumn = (
    filters: IUserFilterOptionsSchema,
    setFilters: (filters: IUserFilterOptionsSchema) => void
) => {
    return {
        id: "status",
        header: ({ column }: HeaderContext<IUserSchema, IUserSchema>) => (
            <div className="flex items-center gap-1">
                <span>Status</span>
                <ColumnFilter>
                    <StatusFilter
                        statusValues={filters.status}
                        onChange={(values) => setFilters({ ...filters, status: values })}
                        onClear={() => setFilters({ ...filters, status: [] })}
                    />
                </ColumnFilter>
            </div>
        ),
        cell: ({ row }: { row: { original: IUserSchema } }) => <StatusCell user={row.original} />
    }
}
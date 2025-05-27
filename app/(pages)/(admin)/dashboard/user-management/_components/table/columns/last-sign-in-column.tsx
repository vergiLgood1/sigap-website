// columns/last-sign-in-column.tsx
"use client"

import React from "react"
import type { HeaderContext } from "@tanstack/react-table"
import { IUserSchema, IUserFilterOptionsSchema } from "@/src/entities/models/users/users.model"
import { ColumnFilter } from "../filters/column-filter"
import { DateFilter } from "../filters/date-filter"
import { LastSignInCell } from "../cells/last-sign-in-cell"

export const createLastSignInColumn = (
    filters: IUserFilterOptionsSchema,
    setFilters: (filters: IUserFilterOptionsSchema) => void
) => {
    return {
        id: "lastSignIn",
        header: ({ column }: HeaderContext<IUserSchema, IUserSchema>) => (
            <div className="flex items-center gap-1">
                <span>Last Sign In</span>
                <ColumnFilter>
                    <DateFilter
                        value={filters.lastSignIn}
                        onChange={(value) => setFilters({ ...filters, lastSignIn: value })}
                        onClear={() => setFilters({ ...filters, lastSignIn: "" })}
                        includeNever={true}
                    />
                </ColumnFilter>
            </div>
        ),
        cell: ({ row }: { row: { original: IUserSchema } }) => (
            <LastSignInCell
                lastSignInAt={
                    row.original.last_sign_in_at instanceof Date
                        ? row.original.last_sign_in_at.toISOString()
                        : row.original.last_sign_in_at
                }
            />
        )
    }
}
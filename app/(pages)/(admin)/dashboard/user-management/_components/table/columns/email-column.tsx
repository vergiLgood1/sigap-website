// columns/email-column.tsx
"use client"

import React from "react"
import type { HeaderContext } from "@tanstack/react-table"
import { IUserSchema, IUserFilterOptionsSchema } from "@/src/entities/models/users/users.model"
import { ColumnFilter } from "../filters/column-filter"
import { TextFilter } from "../filters/text-filter"
import { EmailCell } from "../cells/email-cell"

export const createEmailColumn = (
    filters: IUserFilterOptionsSchema,
    setFilters: (filters: IUserFilterOptionsSchema) => void
) => {
    return {
        id: "email",
        header: ({ column }: HeaderContext<IUserSchema, IUserSchema>) => (
            <div className="flex items-center gap-1">
                <span>Email</span>
                <ColumnFilter>
                    <TextFilter
                        placeholder="Filter by email..."
                        value={filters.email}
                        onChange={(value) => setFilters({ ...filters, email: value })}
                        onClear={() => setFilters({ ...filters, email: "" })}
                    />
                </ColumnFilter>
            </div>
        ),
        cell: ({ row }: { row: { original: IUserSchema } }) => <EmailCell user={row.original} />
    }
}
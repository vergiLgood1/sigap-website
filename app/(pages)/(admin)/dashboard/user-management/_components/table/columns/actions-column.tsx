// columns/actions-column.tsx


import React from "react"
import { IUserSchema } from "@/src/entities/models/users/users.model"
import { ActionsCell } from "../cells/actions-cell"

export const createActionsColumn = (
    handleUserUpdate: (user: IUserSchema) => void
) => {

    return {
        id: "actions",
        header: () => {
            return <span>Actions</span>
        },
        cell: ({ row }: { row: { original: IUserSchema } }) => <ActionsCell user={row.original} onUpdate={handleUserUpdate} />
    }
}
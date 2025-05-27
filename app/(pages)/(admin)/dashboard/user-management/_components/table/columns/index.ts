// columns/index.ts

import type { ColumnDef } from "@tanstack/react-table"
import { IUserSchema, IUserFilterOptionsSchema } from "@/src/entities/models/users/users.model"
import { createEmailColumn } from "./email-column"
import { createPhoneColumn } from "./phone-column"
import { createCreatedAtColumn } from "./created-at-column"
import { createStatusColumn } from "./status-column"
import { createActionsColumn } from "./actions-column"
import { createLastSignInColumn } from "./last-sign-in-column"
import { useGetCurrentUserQuery } from "../../../_queries/queries"
import { USER_ROLES } from "@/app/_utils/const/roles"
import { AuthenticationError } from "@/src/entities/errors/auth"

export type UserTableColumn = ColumnDef<IUserSchema, IUserSchema>

export const createUserColumns = (
    filters: IUserFilterOptionsSchema,
    setFilters: (filters: IUserFilterOptionsSchema) => void,
    handleUserUpdate: (user: IUserSchema) => void,
    currentUser?: IUserSchema,
): UserTableColumn[] => {

    // Check if the user is an admin
    // const { data: user, isLoading, isError, error } = useGetCurrentUserQuery();

    // console.log("Query Status:", { isLoading, isError, error, user });

    if (!currentUser || !currentUser.role) {
        return [
            createEmailColumn(filters, setFilters),
            createPhoneColumn(filters, setFilters),
            createLastSignInColumn(filters, setFilters),
            createCreatedAtColumn(filters, setFilters),
            createStatusColumn(filters, setFilters),
            // Kolom actions tidak disertakan karena memerlukan role
        ]
    }

    const allowedRoles = USER_ROLES.ALLOWED_ROLES_TO_ACTIONS
    let isAllowed = allowedRoles.includes(currentUser.role.name)

    console.log("User Role:", currentUser.role.name, "Allowed Roles:", allowedRoles, "Is Allowed:", isAllowed)

    return [
        createEmailColumn(filters, setFilters),
        createPhoneColumn(filters, setFilters),
        createLastSignInColumn(filters, setFilters),
        createCreatedAtColumn(filters, setFilters),
        createStatusColumn(filters, setFilters),
        ...(isAllowed ? [createActionsColumn(handleUserUpdate)] : []),
    ]
}
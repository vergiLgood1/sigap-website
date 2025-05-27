// cells/actions-cell.tsx

import React, { useEffect, useState } from "react"
import { MoreHorizontal, PenIcon as UserPen, Trash2, ShieldAlert, ShieldCheck } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/app/_components/ui/dropdown-menu"
import { Button } from "@/app/_components/ui/button"
import { ConfirmDialog } from "@/app/_components/confirm-dialog"

import { IUserSchema } from "@/src/entities/models/users/users.model"
import { useUserActionsHandler } from "../../../_handlers/actions/use-user-actions"
import { BanUserDialog } from "../../dialogs/ban-user-dialog"
import { useCreateUserColumn } from "../../../_handlers/use-create-user-column"

import { useGetCurrentUserQuery } from "../../../_queries/queries"
import { Badge } from "@/app/_components/ui/badge"
import { useCheckPermissionsQuery } from "@/app/(pages)/(auth)/_queries/queries"

interface ActionsCellProps {
    user: IUserSchema
    onUpdate: (user: IUserSchema) => void
}

export const ActionsCell: React.FC<ActionsCellProps> = ({ user, onUpdate }) => {
    const {
        deleteDialogOpen,
        setDeleteDialogOpen,
        handleDeleteConfirm,
        isDeletePending,
        banDialogOpen,
        setBanDialogOpen,
        handleBanConfirm,
        unbanDialogOpen,
        setUnbanDialogOpen,
        isBanPending,
        isUnbanPending,
        handleUnbanConfirm,
        selectedUser,
        setSelectedUser,
    } = useCreateUserColumn()

    const { data: currentUser } = useGetCurrentUserQuery()

    if (!currentUser) return <Badge variant={"destructive"}>user not found</Badge>

    let { data: isAllowedToDelete } = useCheckPermissionsQuery(currentUser.email, "delete", "users")
    let { data: isAllowedToUpdate } = useCheckPermissionsQuery(currentUser.email, "update", "users")

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {isAllowedToUpdate && (
                    <DropdownMenuItem onClick={() => onUpdate(user)}>
                        <UserPen className="h-4 w-4 mr-2 text-blue-500" />
                        Update
                    </DropdownMenuItem>
                    )}
                    {isAllowedToDelete && (
                        <DropdownMenuItem
                            onClick={(e) => {
                                setSelectedUser({ id: user.id, email: user.email! })
                                setDeleteDialogOpen(true)
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                            Delete
                        </DropdownMenuItem>
                    )}
                    {isAllowedToUpdate && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            if (user.banned_until != null) {
                                setSelectedUser({ id: user.id, email: user.email! })
                                setUnbanDialogOpen(true)
                            } else {
                                setSelectedUser({ id: user.id, email: user.email! })
                                setBanDialogOpen(true)
                            }
                        }}
                    >
                        <ShieldAlert className="h-4 w-4 mr-2 text-yellow-500" />
                        {user.banned_until != null ? "Unban" : "Ban"}
                    </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Alert Dialog for Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Are you absolutely sure?"
                description="This action cannot be undone. This will permanently delete the user account and remove their data from our servers."
                confirmText="Delete"
                onConfirm={handleDeleteConfirm}
                isPending={isDeletePending}
                pendingText="Deleting..."
                variant="destructive"
                size="sm"
            />

            {/* Alert Dialog for Ban Confirmation */}
            <BanUserDialog
                open={banDialogOpen}
                onOpenChange={setBanDialogOpen}
                onConfirm={handleBanConfirm}
                isPending={isBanPending}
            />

            {/* Alert Dialog for Unban Confirmation */}
            <ConfirmDialog
                open={unbanDialogOpen}
                onOpenChange={setUnbanDialogOpen}
                title="Unban User"
                description="This will restore the user's access to the system. Are you sure you want to unban this user?"
                confirmText="Unban"
                onConfirm={handleUnbanConfirm}
                isPending={isUnbanPending}
                pendingText="Unbanning..."
                variant="default"
                size="sm"
                confirmIcon={<ShieldCheck className="h-4 w-4" />}
            />
        </div>
    )
}
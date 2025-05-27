import { ConfirmDialog } from "@/app/_components/confirm-dialog"
import { AddUserDialog } from "./add-user-dialog"
import { InviteUserDialog } from "./invite-user-dialog"
import { BanUserDialog } from "./ban-user-dialog"
import { ShieldCheck } from "lucide-react"
import { useCreateUserColumn } from "../../_handlers/use-create-user-column"
import { useUserManagementHandlers } from "../../_handlers/use-user-management"
import { useAddUserDialogHandler } from "../../_handlers/use-add-user-dialog"
import { useInviteUserHandler } from "../../_handlers/use-invite-user"


export const UserDialogs = () => {

    // User management handler
    const {
        isAddUserDialogOpen,
        setIsAddUserDialogOpen,
    } = useAddUserDialogHandler({
        onOpenChange: (open) => setIsAddUserDialogOpen(open),
    })

    const {
        isInviteUserDialogOpen,
        setIsInviteUserDialogOpen,
    } = useInviteUserHandler({
        onOpenChange: (open) => setIsInviteUserDialogOpen(open),
    })

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

    return (
        <>
            <AddUserDialog
                open={isAddUserDialogOpen}
                onOpenChange={setIsAddUserDialogOpen}
            />

            <InviteUserDialog
                open={isInviteUserDialogOpen}
                onOpenChange={setIsInviteUserDialogOpen}
            />

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
        </>
    )
}
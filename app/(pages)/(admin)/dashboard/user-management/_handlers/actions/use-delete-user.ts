import { useState } from "react"
import { toast } from "sonner"
import { useUserActionsHandler } from "./use-user-actions"
import { useDeleteUserMutation } from "../../_queries/mutations"

export const useDeleteUserHandler = () => {
    const { selectedUser, invalidateUsers } = useUserActionsHandler()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const { mutateAsync: deleteUser, isPending: isDeletePending } = useDeleteUserMutation()

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return toast.error("No user selected to delete")

        await deleteUser(selectedUser.id, {
            onSuccess: () => {
                invalidateUsers()
                toast.success(`${selectedUser.email} has been deleted`)
                setDeleteDialogOpen(false)
            },
            onError: () => {
                toast.error("Failed to delete user. Please try again later.")
                setDeleteDialogOpen(false)
            },
        })
    }

    return {
        deleteDialogOpen,
        setDeleteDialogOpen,
        handleDeleteConfirm,
        isDeletePending,
    }
}
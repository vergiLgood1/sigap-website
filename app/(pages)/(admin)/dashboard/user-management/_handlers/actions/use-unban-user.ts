import { toast } from "sonner"
import { useUserActionsHandler } from "./use-user-actions"
import { useState } from "react"
import { useUnbanUserMutation } from "../../_queries/mutations"

export const useUnbanUserHandler = () => {
    const { selectedUser, invalidateUsers } = useUserActionsHandler()
    const [unbanDialogOpen, setUnbanDialogOpen] = useState(false)
    const { mutateAsync: unbanUser, isPending: isUnbanPending } = useUnbanUserMutation()

    const handleUnbanConfirm = async () => {
        if (!selectedUser) return toast.error("No user selected to unban")

        await unbanUser({ id: selectedUser.id }, {
            onSuccess: () => {
                invalidateUsers()
                toast.success(`${selectedUser.email} has been unbanned`)
                setUnbanDialogOpen(false)
            },
            onError: () => {
                toast.error("Failed to unban user. Please try again later.")
                setUnbanDialogOpen(false)
            },
        })
    }

    return {
        unbanDialogOpen,
        setUnbanDialogOpen,
        handleUnbanConfirm,
        isUnbanPending,
    }
}
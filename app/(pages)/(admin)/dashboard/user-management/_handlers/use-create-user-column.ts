import { useState } from "react"
import { useBanUserMutation, useDeleteUserMutation, useUnbanUserMutation } from "../_queries/mutations"
import { ValidBanDuration } from "@/app/_utils/types/ban-duration"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useForm } from "react-hook-form"



export const useCreateUserColumn = () => {

    const queryClient = useQueryClient()

    // Delete user state and handlers
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const { mutateAsync: deleteUser, isPending: isDeletePending } = useDeleteUserMutation()

    // Ban user state and handlers
    const [banDialogOpen, setBanDialogOpen] = useState(false)
    const { mutateAsync: banUser, isPending: isBanPending } = useBanUserMutation()

    // Unban user state and handlers
    const [unbanDialogOpen, setUnbanDialogOpen] = useState(false)
    const { mutateAsync: unbanUser, isPending: isUnbanPending } = useUnbanUserMutation()

    // Store selected user info
    const [selectedUser, setSelectedUser] = useState<{ id: string, email: string } | null>(null)

    const handleDeleteConfirm = async () => {

        if (!selectedUser?.id) return toast.error("No user selected to delete")

        await deleteUser(selectedUser?.id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["users"] })

                toast.success(`${selectedUser.email} has been deleted`)

                setDeleteDialogOpen(false)
                setSelectedUser(null)
            },
            onError: (error) => {
                toast.error("Failed to delete user. Please try again later.")
                setDeleteDialogOpen(false)
            }
        })

    }

    const handleBanConfirm = async (duration: ValidBanDuration) => {

        if (!selectedUser) return toast.error("No user selected to ban")

        await banUser({ id: selectedUser.id, ban_duration: duration }, {
            onSuccess: () => {
                toast(`${selectedUser.email} has been banned`)

                queryClient.invalidateQueries({ queryKey: ["users"] })

                toast.success(`${selectedUser.email} has been banned`)

                setBanDialogOpen(false)
                setSelectedUser(null)
            },
            onError: () => {
                toast.error("Failed to ban user. Please try again later.")

                setBanDialogOpen(false)
                setSelectedUser(null)
            },
        })
    }

    const handleUnbanConfirm = async () => {

        if (!selectedUser?.id) return toast.error("No user selected to unban")

        await unbanUser({ id: selectedUser?.id }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["users"] })

                toast(`${selectedUser?.email} has been unbanned`)

                setUnbanDialogOpen(false)
                setSelectedUser(null)
            },
            onError: (error) => {
                toast.error("Failed to unban user. Please try again later.")
                setUnbanDialogOpen(false)
            }
        })
    }

    return {
        // Delete
        deleteDialogOpen,
        setDeleteDialogOpen,
        handleDeleteConfirm,
        isDeletePending,

        // Ban
        banDialogOpen,
        setBanDialogOpen,
        handleBanConfirm,
        isBanPending,

        // Unban
        unbanDialogOpen,
        setUnbanDialogOpen,
        handleUnbanConfirm,
        isUnbanPending,

        // Selected user
        selectedUser,
        setSelectedUser,
    }
}
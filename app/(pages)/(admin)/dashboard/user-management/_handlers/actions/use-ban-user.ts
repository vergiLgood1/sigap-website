"use client"

import { useState } from "react"
import { useBanUserMutation } from "../../_queries/mutations"
import type { ValidBanDuration } from "@/app/_utils/types/ban-duration"
import { toast } from "sonner"
import { useUserActionsHandler } from "./use-user-actions"

export const useBanUserHandler = () => {
  const { selectedUser, invalidateUsers } = useUserActionsHandler()
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const { mutateAsync: banUser, isPending: isBanPending } = useBanUserMutation()

  const handleBanConfirm = async (duration: ValidBanDuration) => {
    if (!selectedUser) return toast.error("No user selected to ban")

    await banUser(
      { id: selectedUser.id, ban_duration: duration },
      {
        onSuccess: () => {
          invalidateUsers()
          toast.success(`${selectedUser.email} has been banned`)
          setBanDialogOpen(false)
        },
        onError: () => {
          toast.error("Failed to ban user. Please try again later.")
          setBanDialogOpen(false)
        },
      },
    )
  }

  return {
    banDialogOpen,
    setBanDialogOpen,
    handleBanConfirm,
    isBanPending,
  }
}


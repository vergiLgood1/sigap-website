"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

// This is a shared hook that contains common functionality
export const useUserActionsHandler = () => {
    const queryClient = useQueryClient()
    const [selectedUser, setSelectedUser] = useState<{ id: string, email: string } | null>(null)

    const invalidateUsers = () => {
        queryClient.invalidateQueries({ queryKey: ["users"] })
    }

    const invalidateUser = (userId: string) => {
        queryClient.invalidateQueries({ queryKey: ["user", "current", userId] })
    }

    const invalidateCurrentUser = () => {
        queryClient.invalidateQueries({ queryKey: ["user", "current"] })
    }

    return {
        selectedUser,
        setSelectedUser,
        invalidateUsers,
        invalidateUser,
        invalidateCurrentUser,
        queryClient,
    }
}


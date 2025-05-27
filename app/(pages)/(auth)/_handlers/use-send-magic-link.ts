"use client"

import type { IUserSchema } from "@/src/entities/models/users/users.model"
import { useSendMagicLinkMutation, useSendPasswordRecoveryMutation } from "@/app/(pages)/(auth)/_queries/mutations"
import { toast } from "sonner"

export const useSendMagicLinkHandler = (user: IUserSchema, onOpenChange: (open: boolean) => void) => {
    const { mutateAsync: sendMagicLink, isPending } = useSendMagicLinkMutation()

    const handleSendMagicLink = async () => {
        if (user.email) {
            await sendMagicLink(user.email, {
                onSuccess: () => {
                    toast.success(`Magic link sent to ${user.email}`)
                    onOpenChange(false)
                },
                onError: (error) => {
                    toast.error(error.message)
                    onOpenChange(false)
                },
            })
        }
    }

    return {
        handleSendMagicLink,
        isPending,
    }
}


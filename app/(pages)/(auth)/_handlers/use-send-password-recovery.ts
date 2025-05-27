"use client"

import type { IUserSchema } from "@/src/entities/models/users/users.model"
import { useSendMagicLinkMutation, useSendPasswordRecoveryMutation } from "@/app/(pages)/(auth)/_queries/mutations"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { ISendPasswordRecoverySchema, SendPasswordRecoverySchema } from "@/src/entities/models/auth/send-password-recovery.model"
import { zodResolver } from "@hookform/resolvers/zod"

export const useSendPasswordRecoveryHandler = () => {
    const { mutateAsync: sendPasswordRecovery, isPending, error } =
        useSendPasswordRecoveryMutation()

    const {
        register,
        handleSubmit: handleFormSubmit,
        reset,
        formState: { errors: formErrors },
        setError: setFormError,
    } = useForm<ISendPasswordRecoverySchema>({
        defaultValues: {
            email: "",
        },
        resolver: zodResolver(SendPasswordRecoverySchema),
    })

    const onSubmit = handleFormSubmit(async (data) => {
        if (isPending) return

        const email = data.email;

        try {
            toast.promise(sendPasswordRecovery(email), {
                loading: "Sending password recovery...",
                success: () => {
                    reset()
                    return "An email has been sent to you. Please check your inbox."
                },
                error: (err) => {
                    const errorMessage = err?.message || "Failed to send email."
                    setFormError("email", { message: errorMessage })
                    return errorMessage
                },
            })
        } catch (err: any) {
            setFormError("email", { message: err?.message || "An error occurred while sending the email." })
        }
    })

    return {
        register,
        handleSubmit: onSubmit,
        reset,
        formErrors,
        isPending,
        error: !!error,
        errors: !!error || formErrors.email,
        sendPasswordRecovery,
    }
}


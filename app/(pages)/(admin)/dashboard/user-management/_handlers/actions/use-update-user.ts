import { type IUpdateUserSchema, UpdateUserSchema } from "@/src/entities/models/users/update-user.model"
import type { IUserSchema } from "@/src/entities/models/users/users.model"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useUpdateUserMutation } from "../../_queries/mutations"
import { toast } from "sonner"
import { useUserActionsHandler } from "./use-user-actions"

export const useUpdateUserHandler = (userData: IUserSchema) => {
    const { invalidateUsers } = useUserActionsHandler()
    const { mutateAsync: updateUser, isPending } = useUpdateUserMutation()

    // Initialize form with user data
    const form = useForm<IUpdateUserSchema>({
        resolver: zodResolver(UpdateUserSchema),
        defaultValues: {
            email: userData?.email || undefined,
            encrypted_password: userData?.encrypted_password || undefined,
            role: (userData?.role as "user" | "staff" | "admin") || "user",
            phone: userData?.phone || undefined,
            invited_at: userData?.invited_at || undefined,
            confirmed_at: userData?.confirmed_at || undefined,
            // recovery_sent_at: userData?.recovery_sent_at || undefined,
            last_sign_in_at: userData?.last_sign_in_at || undefined,
            created_at: userData?.created_at || undefined,
            updated_at: userData?.updated_at || undefined,
            is_anonymous: userData?.is_anonymous || false,
            profile: {
                // id: userData?.profile?.id || undefined,
                // user_id: userData?.profile?.user_id || undefined,
                avatar: userData?.profile?.avatar || undefined,
                username: userData?.profile?.username || undefined,
                first_name: userData?.profile?.first_name || undefined,
                last_name: userData?.profile?.last_name || undefined,
                bio: userData?.profile?.bio || undefined,
                address: userData?.profile?.address || {
                    street: "",
                    city: "",
                    state: "",
                    country: "",
                    postal_code: "",
                },
                birth_date: userData?.profile?.birth_date ? new Date(userData.profile.birth_date) : undefined,
            },
        },
    })

    const handleUpdateUser = async (onSuccess?: () => void, onError?: () => void) => {
        await updateUser(
            { id: userData.id, data: form.getValues() },
            {
                onSuccess: () => {
                    invalidateUsers()
                    toast.success("User updated successfully")
                    onSuccess?.()
                },
                onError: () => {
                    toast.error("Failed to update user")
                    onError?.()
                },
            },
        )
    }

    return {
        form,
        handleUpdateUser,
        isPending,
    }
}


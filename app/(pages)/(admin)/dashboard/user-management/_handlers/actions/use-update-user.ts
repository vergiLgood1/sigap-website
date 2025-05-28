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
            roles_id: userData?.roles_id || undefined, // Using roles_id instead of role string
            phone: userData?.phone || undefined,
            invited_at: userData?.invited_at || undefined,
            confirmed_at: userData?.confirmed_at || undefined,
            last_sign_in_at: userData?.last_sign_in_at || undefined,
            created_at: userData?.created_at || undefined,
            updated_at: userData?.updated_at || undefined,
            is_anonymous: userData?.is_anonymous || false,
            is_banned: (userData as any)?.is_banned || false,
            banned_until: (userData as any)?.banned_until || undefined,
            banned_reason: (userData as any)?.banned_reason || undefined,
            profile: {
                avatar: userData?.profile?.avatar || undefined,
                nik: userData?.profile?.nik || undefined,
                birth_date: typeof userData?.profile?.birth_date === 'string' ? new Date(userData.profile.birth_date) : userData?.profile?.birth_date || undefined,
                birth_place: userData?.profile?.birth_place || undefined,
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
            },
        },
    })

    const handleUpdateUser = async (onSuccess?: () => void, onError?: () => void) => {
        try {
            await updateUser(
                { id: userData.id, data: form.getValues() },
                {
                    onSuccess: () => {
                        invalidateUsers()
                        toast.success("User updated successfully")
                        onSuccess?.()
                    },
                    onError: (error) => {
                        console.error("Error updating user:", error)
                        toast.error("Failed to update user")
                        onError?.()
                    },
                },
            )
        } catch (error) {
            console.error("Unexpected error updating user:", error)
            toast.error("An unexpected error occurred")
            onError?.()
        }
    }

    return {
        form,
        handleUpdateUser,
        isPending,
    }
}


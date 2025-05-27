import { IUpdateUserSchema, UpdateUserSchema } from "@/src/entities/models/users/update-user.model";
import { IUserSchema } from "@/src/entities/models/users/users.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUpdateUserMutation } from "../_queries/mutations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserActionsHandler } from "./actions/use-user-actions";


export const useUpdateUserSheetHandlers = ({ open, onOpenChange, userData }: {
    open: boolean;
    userData: IUserSchema;
    onOpenChange: (open: boolean) => void;
}) => {

    const { invalidateUsers } = useUserActionsHandler()

    const {
        mutateAsync: updateUser,
        isPending,
    } = useUpdateUserMutation()

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

    const handleUpdateUser = async () => {
        await updateUser({ id: userData.id, data: form.getValues() }, {
            onSuccess: () => {

                invalidateUsers()

                toast.success("User updated successfully")

                onOpenChange(false);
            },
            onError: () => {

                toast.error("Failed to update user")

                onOpenChange(false);
            },
        });
    }

    return {
        handleUpdateUser,
        form,
        isPending,
    };
}
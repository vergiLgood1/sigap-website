import { CreateUserSchema, type ICreateUserSchema } from "@/src/entities/models/users/create-user.model"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useUserActionsHandler } from "./use-user-actions"
import { useCreateUserMutation } from "../../_queries/mutations"

export const useCreateUserHandler = () => {
    const { invalidateUsers } = useUserActionsHandler()
    const { mutateAsync: createUser, isPending } = useCreateUserMutation()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setError,
        getValues,
        clearErrors,
        watch,
    } = useForm<ICreateUserSchema>({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: {
            email: "",
            password: "",
            email_confirm: true,
        },
    })

    const emailConfirm = watch("email_confirm")

    const handleCreateUser = async (onSuccess?: () => void, onError?: (error: Error) => void) => {
        return handleSubmit(async (data) => {
            await createUser(data, {
                onSuccess: () => {
                    invalidateUsers()
                    reset()
                    onSuccess?.()
                },
                onError: (error) => {
                    reset()
                    toast.error(error.message)
                    onError?.(error)
                },
            })
        })()
    }

    return {
        register,
        handleCreateUser,
        reset,
        errors,
        isPending,
        getValues,
        clearErrors,
        emailConfirm,
        handleSubmit,
    }
}


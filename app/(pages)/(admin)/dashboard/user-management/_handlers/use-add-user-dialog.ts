import { useQueryClient } from "@tanstack/react-query";
import { useCreateUserMutation } from "../_queries/mutations";
import { CreateUserSchema, ICreateUserSchema } from "@/src/entities/models/users/create-user.model";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { useUserActionsHandler } from "./actions/use-user-actions";

export const useAddUserDialogHandler = ({ onOpenChange }: {
    onOpenChange: (open: boolean) => void;
}) => {

    const { invalidateUsers } = useUserActionsHandler()

    const { mutateAsync: createdUser, isPending } = useCreateUserMutation()

    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors: errors },
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
        }
    });

    const emailConfirm = watch("email_confirm");

    const onSubmit = handleSubmit(async (data) => {

        await createdUser(data, {
            onSuccess: () => {
                invalidateUsers();

                toast.success("User created successfully");

                onOpenChange(false);
                reset();
            },
            onError: (error) => {
                reset();
                toast.error(error.message);
            }
        })

    });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            reset();
        }
        onOpenChange(open);
    };

    return {
        register,
        handleSubmit: onSubmit,
        reset,
        errors,
        isPending,
        getValues,
        clearErrors,
        emailConfirm,
        handleOpenChange,
        isAddUserDialogOpen,
        setIsAddUserDialogOpen,
    };
}
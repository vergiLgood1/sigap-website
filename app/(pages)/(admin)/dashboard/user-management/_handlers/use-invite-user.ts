import { defaulIInviteUserSchemaValues, IInviteUserSchema, InviteUserSchema } from "@/src/entities/models/users/invite-user.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
import { useUserActionsHandler } from "./actions/use-user-actions";
import { useInviteUserMutation } from "../_queries/mutations";


export const useInviteUserHandler = ({ onOpenChange }: {
    onOpenChange: (open: boolean) => void;
}) => {

    const { invalidateUsers } = useUserActionsHandler()

    const { mutateAsync: inviteUser, isPending } = useInviteUserMutation();

    const [isInviteUserDialogOpen, setIsInviteUserDialogOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors: errors },
        setError,
        getValues,
        clearErrors,
        watch,
    } = useForm<IInviteUserSchema>({
        resolver: zodResolver(InviteUserSchema),
        defaultValues: defaulIInviteUserSchemaValues
    })

    const onSubmit = handleSubmit(async (data) => {

        const { email } = data;

        await inviteUser(email, {
            onSuccess: () => {

                invalidateUsers();

                toast.success("Invitation sent");

                onOpenChange(false);
                reset();
            },
            onError: () => {
                reset();
                toast.error("Failed to send invitation");
            },
        });
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
        handleOpenChange,
        reset,
        getValues,
        clearErrors,
        watch,
        errors,
        isPending,
        isInviteUserDialogOpen,
        setIsInviteUserDialogOpen,
    };
}
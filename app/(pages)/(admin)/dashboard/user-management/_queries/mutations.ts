import { ICreateUserSchema } from "@/src/entities/models/users/create-user.model";
import { useMutation } from "@tanstack/react-query";
import { banUser, createUser, deleteUser, inviteUser, unbanUser, updateUser, uploadAvatar } from "../action";
import { IUpdateUserSchema } from "@/src/entities/models/users/update-user.model";
import { ICredentialsInviteUserSchema } from "@/src/entities/models/users/invite-user.model";
import { IBanUserSchema, ICredentialsBanUserSchema } from "@/src/entities/models/users/ban-user.model";
import { ICredentialsUnbanUserSchema } from "@/src/entities/models/users/unban-user.model";
import { ValidBanDuration } from "@/app/_utils/types/ban-duration";

export const useCreateUserMutation = () => {
    return useMutation({
        mutationKey: ["user", "create"],
        mutationFn: (data: ICreateUserSchema) => createUser(data),
    })
}

export const useUpdateUserMutation = () => {
    return useMutation({
        mutationKey: ["user", "update"],
        mutationFn: (args: { id: string; data: IUpdateUserSchema }) => updateUser(args.id, args.data)
    })
}

export const useDeleteUserMutation = () => {
    return useMutation({
        mutationKey: ["user", "delete"],
        mutationFn: (id: string) => deleteUser(id),
    })
}

export const useInviteUserMutation = () => {
    return useMutation({
        mutationKey: ["user", "invite"],
        mutationFn: (email: string) => inviteUser({ email }),
    })
}


export const useBanUserMutation = () => {
    return useMutation({
        mutationKey: ["user", "ban"],
        mutationFn: (args: { id: string; ban_duration: ValidBanDuration }) => banUser({ id: args.id }, { ban_duration: args.ban_duration }),
    })
}

export const useUnbanUserMutation = () => {
    return useMutation({
        mutationKey: ["user", "unban"],
        mutationFn: (credential: ICredentialsUnbanUserSchema) => unbanUser(credential),
    })
}

export const useUploadAvatarMutation = () => {
    return useMutation({
        mutationKey: ["user", "upload-avatar"],
        mutationFn: (args: { userId: string; file: File }) => uploadAvatar(args.userId, args.file),
    })
}
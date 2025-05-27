import { IUserSchema } from "@/src/entities/models/users/users.model";
import { toast } from "sonner";
import { useBanUserMutation, useDeleteUserMutation, useUnbanUserMutation } from "../_queries/mutations";
import { useSendMagicLinkMutation, useSendPasswordRecoveryMutation } from "@/app/(pages)/(auth)/_queries/mutations";
import { ValidBanDuration } from "@/app/_utils/types/ban-duration";
import { copyItem } from "@/app/_utils/common";
import { useQueryClient } from "@tanstack/react-query";
import { useUserActionsHandler } from "./actions/use-user-actions";

export const useUserDetailSheetHandlers = ({ open, selectedUser, onOpenChange }: {
    open: boolean;
    selectedUser: IUserSchema;
    onOpenChange: (open: boolean) => void;
}) => {

    const { invalidateUsers } = useUserActionsHandler()

    const { mutateAsync: deleteUser, isPending: isDeletePending } = useDeleteUserMutation();
    const { mutateAsync: sendPasswordRecovery, isPending: isSendPasswordRecoveryPending } = useSendPasswordRecoveryMutation();
    const { mutateAsync: sendMagicLink, isPending: isSendMagicLinkPending } = useSendMagicLinkMutation();
    const { mutateAsync: banUser, isPending: isBanPending } = useBanUserMutation();
    const { mutateAsync: unbanUser, isPending: isUnbanPending } = useUnbanUserMutation();

    const handleDeleteUser = async () => {
        await deleteUser(selectedUser.id, {
            onSuccess: () => {
                invalidateUsers();
                toast.success(`${selectedUser.email} has been deleted`);

                onOpenChange(false);
            }
        });
    };

    const handleSendPasswordRecovery = async () => {
        if (selectedUser.email) {
            await sendPasswordRecovery(selectedUser.email, {
                onSuccess: () => {
                    toast.success(`Password recovery email sent to ${selectedUser.email}`);

                    onOpenChange(false);
                },
                onError: (error) => {
                    toast.error(error.message);

                    onOpenChange(false);
                }
            });
        };
    }

    const handleSendMagicLink = async () => {
        if (selectedUser.email) {
            await sendMagicLink(selectedUser.email, {
                onSuccess: () => {
                    toast.success(`Magic link sent to ${selectedUser.email}`);

                    onOpenChange(false);
                },
                onError: (error) => {
                    toast.error(error.message);

                    onOpenChange(false);
                }
            });
        }
    };

    const handleBanUser = async (ban_duration: ValidBanDuration = "24h") => {
        await banUser({ id: selectedUser.id, ban_duration: ban_duration }, {
            onSuccess: () => {
                invalidateUsers();
                toast(`${selectedUser.email} has been banned`);


            }
        });
    };

    const handleUnbanUser = async () => {
        await unbanUser({ id: selectedUser.id }, {
            onSuccess: () => {
                invalidateUsers();
                toast(`${selectedUser.email} has been unbanned`);


            }
        });
    };

    const handleToggleBan = async (ban_duration: ValidBanDuration = "24h") => {
        if (selectedUser.banned_until) {
            await unbanUser({ id: selectedUser.id }, {
                onSuccess: () => {
                    invalidateUsers();

                    toast(`${selectedUser.email} has been unbanned`);

                }
            });
        } else {
            await banUser({ id: selectedUser.id, ban_duration: ban_duration }, {
                onSuccess: () => {
                    invalidateUsers();

                    toast(`${selectedUser.email} has been banned`);

                }
            });
        }
    };

    const handleCopyItem = async (item: string, label: string) => {
        if (item) copyItem(item, { label: label });
    }

    return {
        handleDeleteUser,
        handleSendPasswordRecovery,
        handleSendMagicLink,
        handleBanUser,
        handleUnbanUser,
        handleToggleBan,
        handleCopyItem,
        isDeletePending,
        isSendPasswordRecoveryPending,
        isSendMagicLinkPending,
        isBanPending,
        isUnbanPending,
    };
};
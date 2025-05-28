
import { Badge } from "@/app/_components/ui/badge";
import { Separator } from "@/app/_components/ui/separator";
import {
    Mail,
    Trash2,
    Ban,
    SendHorizonal,
    CheckCircle,
    XCircle,
    Copy,
    Loader2,
} from "lucide-react";
import { IUserSchema } from "@/src/entities/models/users/users.model";
import { formatDate } from "@/app/_utils/common";
import { CAlertDialog } from "@/app/_components/alert-dialog";
import { useUserDetailSheetHandlers } from "../../_handlers/use-detail-sheet";
import { useGetCurrentUserQuery } from "../../_queries/queries";
import { AuthenticationError } from "@/src/entities/errors/auth";
import { useCheckPermissionsHandler } from "@/app/(pages)/(auth)/_handlers/use-check-permissions";
import { useCallback } from "react";
import { cn } from "@/app/_lib/utils";

import { InfoRow } from "@/app/_components/info-row";
import { ProviderInfo } from "@/app/_components/provider-info";
import { ActionRow } from "@/app/_components/action-row";
import { DangerAction } from "@/app/_components/danger-action";
import { Section } from "@/app/_components/section";


interface UserOverviewTabProps {
    selectedUser: IUserSchema;
    handleCopyItem: (text: string, label: string) => void;
}

export function UserOverviewTab({ selectedUser, handleCopyItem }: UserOverviewTabProps) {
    const { data: currentUser } = useGetCurrentUserQuery();

    if (!currentUser) {
        throw new AuthenticationError("Authentication error. Please log in again.");
    }

    const {
        handleDeleteUser,
        handleSendPasswordRecovery,
        handleSendMagicLink,
        handleToggleBan,
        isBanPending,
        isUnbanPending,
        isDeletePending,
        isSendPasswordRecoveryPending,
        isSendMagicLinkPending,
    } = useUserDetailSheetHandlers({ open: true, selectedUser, onOpenChange: () => { } });

    const {
        isAllowedToDelete,
        isAllowedToBan,
        isAllowedToSendPasswordRecovery,
        isAllowedToSendMagicLink,
        isAllowedToSendEmail,
    } = useCheckPermissionsHandler(currentUser.email);

    const memoizedHandleCopyItem = useCallback(
        (text: string, label: string) => handleCopyItem(text, label),
        [handleCopyItem]
    );

    return (
        <div className="space-y-8">
            {/* User Information Section */}
            <Section title="User Information">
                <InfoRow
                    label="User UID"
                    value={selectedUser.id}
                    onCopy={() => memoizedHandleCopyItem(selectedUser.id, "UID")}
                />
                <InfoRow label="Created at" value={formatDate(selectedUser.created_at)} />
                <InfoRow label="Last signed in" value={formatDate(selectedUser.last_sign_in_at)} />
                <InfoRow
                    label="SSO"
                    value={<XCircle className="h-4 w-4 text-muted-foreground" />}
                />
            </Section>

            <Separator />

            {/* Provider Information Section */}
            <Section title="Provider Information" description="The user has the following providers">
                <ProviderInfo
                    icon={<Mail className="h-5 w-5" />}
                    title="Email"
                    description="Signed in with an email account"
                    badge={
                        <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-500 border-green-500/20"
                        >
                            <CheckCircle className="h-3 w-3 mr-1" /> Enabled
                        </Badge>
                    }
                />

                {isAllowedToSendEmail && (
                    <Separator className="my-4" />
                )}

                {isAllowedToSendEmail && (
                    <div className="border rounded-md p-4 space-y-4 bg-secondary/80">
                        {isAllowedToSendPasswordRecovery && (
                            <ActionRow
                                title="Reset password"
                                description="Send a password recovery email to the user"
                                onClick={handleSendPasswordRecovery}
                                isPending={isSendPasswordRecoveryPending}
                                pendingText="Sending..."
                                icon={<Mail className="h-4 w-4 mr-2" />}
                                actionText="Send password recovery"
                                buttonVariant="outline"
                                buttonClassName="bg-secondary/80 border-secondary-foreground/20 hover:border-secondary-foreground/30"
                            />
                        )}

                        {isAllowedToSendMagicLink && <Separator />}

                        {isAllowedToSendMagicLink && (
                            <ActionRow
                                title="Send magic link"
                                description="Passwordless login via email for the user"
                                onClick={handleSendMagicLink}
                                isPending={isSendMagicLinkPending}
                                pendingText="Sending..."
                                icon={<SendHorizonal className="h-4 w-4 mr-2" />}
                                actionText="Send magic link"
                                buttonVariant="outline"
                                buttonClassName="bg-secondary/80 border-secondary-foreground/20 hover:border-secondary-foreground/30"
                            />
                        )}
                    </div>
                )}
            </Section>

            <Separator />

            {/* Danger Zone Section */}
            {isAllowedToDelete && (
                <Section
                    title="Danger zone"
                    titleClassName="text-destructive"
                    description="Be wary of the following features as they cannot be undone."
                    contentClassName="space-y-0"
                >
                    {selectedUser.banned_until ? (
                        <DangerAction
                            title="Unban user"
                            description="Revoke access to the project for a set duration"
                            onClick={handleToggleBan}
                            isPending={isUnbanPending}
                            pendingText="Unbanning..."
                            icon={<Ban className="h-4 w-4" />}
                            actionText="Unban user"
                            className="rounded-b-none"
                            buttonVariant="outline"
                        />
                    ) : (
                        <DangerAction
                            title="Ban user"
                            description="Revoke access to the project for a set duration"
                            isDialog
                            dialogProps={{
                                triggerText: "Ban user",
                                triggerIcon: <Ban className="h-4 w-4" />,
                                title: "Select ban duration",
                                description:
                                    "The user will not be able to access the project for the selected duration.",
                                confirmText: "Ban",
                                onConfirm: handleToggleBan,
                                isPending: isBanPending,
                                pendingText: "Banning...",
                                variant: "outline",
                                size: "sm",
                            }}
                        />
                    )}

                    <DangerAction
                        className="rounded-t-none"
                        title="Delete user"
                        description="User will no longer have access to the project"
                        isDialog
                        dialogProps={{
                            triggerText: "Delete user",
                            triggerIcon: <Trash2 className="h-4 w-4" />,
                            title: "Are you absolutely sure?",
                            description:
                                "This action cannot be undone. This will permanently delete the user account and remove their data from our servers.",
                            confirmText: "Delete",
                            onConfirm: handleDeleteUser,
                            isPending: isDeletePending,
                            pendingText: "Deleting...",
                            variant: "destructive",
                            size: "sm",
                        }}
                    />
                </Section>
            )}
        </div>
    );
}


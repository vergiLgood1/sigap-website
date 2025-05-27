// components/selectedUser-management/sheet/tabs/selectedUser-details-tab.tsx
import { IUserSchema } from "@/src/entities/models/users/users.model";
import { formatDate } from "@/app/_utils/common";
import { Separator } from "@/app/_components/ui/separator";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Edit2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface UserDetailsTabProps {
    selectedUser: IUserSchema;
}

export function UserDetailsTab({ selectedUser }: UserDetailsTabProps) {
    const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

    const toggleSensitiveInfo = () => {
        setShowSensitiveInfo(!showSensitiveInfo);
    };

    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">SelectedUser Details</h3>
                    <Button variant="outline" size="sm" onClick={() => { /* Implement edit functionality */ }}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
                        <div className="border rounded-md p-4 space-y-3">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium">{selectedUser.email || "—"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm font-medium">{selectedUser.phone || "—"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Role</p>
                                <p className="text-sm font-medium">{selectedUser.role?.name || "—"}</p>
                            </div>

                            {selectedUser.is_anonymous !== undefined && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Anonymous</p>
                                    <Badge variant={selectedUser.is_anonymous ? "default" : "outline"}>
                                        {selectedUser.is_anonymous ? "Yes" : "No"}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Profile Information</h4>
                        <div className="border rounded-md p-4 space-y-3">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Username</p>
                                <p className="text-sm font-medium">{selectedUser.profile?.username || "—"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">First Name</p>
                                <p className="text-sm font-medium">{selectedUser.profile?.first_name || "—"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Last Name</p>
                                <p className="text-sm font-medium">{selectedUser.profile?.last_name || "—"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Birth Date</p>
                                <p className="text-sm font-medium">
                                    {selectedUser.profile?.birth_date ? formatDate(selectedUser.profile.birth_date) : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                <div className="border rounded-md p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Street</p>
                            <p className="text-sm font-medium">{selectedUser.profile?.address?.street || "—"}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">City</p>
                            <p className="text-sm font-medium">{selectedUser.profile?.address?.city || "—"}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">State</p>
                            <p className="text-sm font-medium">{selectedUser.profile?.address?.state || "—"}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Country</p>
                            <p className="text-sm font-medium">{selectedUser.profile?.address?.country || "—"}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Postal Code</p>
                            <p className="text-sm font-medium">{selectedUser.profile?.address?.postal_code || "—"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Advanced Information */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">System Information</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleSensitiveInfo}
                    >
                        {showSensitiveInfo ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show
                            </>
                        )}
                    </Button>
                </div>

                <div className="border rounded-md p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">SelectedUser ID</p>
                            <p className="text-sm font-medium font-mono">{selectedUser.id}</p>
                        </div>

                        {showSensitiveInfo && selectedUser.encrypted_password && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Password Status</p>
                                <Badge variant="outline">
                                    {selectedUser.encrypted_password ? "Set" : "Not Set"}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border rounded-md p-4">
                    <h4 className="text-sm font-medium mb-3">Timestamps</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Created At</p>
                            <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Updated At</p>
                            <p className="text-sm">{formatDate(selectedUser.updated_at)}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Last Sign In</p>
                            <p className="text-sm">{formatDate(selectedUser.last_sign_in_at)}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Email Confirmed At</p>
                            <p className="text-sm">{formatDate(selectedUser.email_confirmed_at)}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Invited At</p>
                            <p className="text-sm">{formatDate(selectedUser.invited_at)}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Recovery Sent At</p>
                            <p className="text-sm">{formatDate(selectedUser.recovery_sent_at)}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Confirmed At</p>
                            <p className="text-sm">{formatDate(selectedUser.confirmed_at)}</p>
                        </div>

                        {selectedUser.banned_until && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Banned Until</p>
                                <p className="text-sm text-destructive">{formatDate(selectedUser.banned_until)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {selectedUser.profile?.bio && (
                    <div className="border rounded-md p-4">
                        <h4 className="text-sm font-medium mb-2">Bio</h4>
                        <p className="text-sm whitespace-pre-wrap">{selectedUser.profile.bio}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
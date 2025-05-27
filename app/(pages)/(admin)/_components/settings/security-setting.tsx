"use client";


import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import { IUserSchema } from "@/src/entities/models/users/users.model";
import { useGetCurrentUserQuery } from "../../dashboard/user-management/_queries/queries";

export function SecuritySettings() {

  const { data: user } = useGetCurrentUserQuery();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Email</h4>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline">Change email</Button>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Password</h4>
            <p className="text-sm text-muted-foreground">
              Set a permanent password to login to your account.
            </p>
          </div>
          <Button variant="outline">Change password</Button>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Two-step verification</h4>
            <p className="text-sm text-muted-foreground">
              Add an additional layer of security to your account during login.
            </p>
          </div>
          <Button variant="outline">Add verification method</Button>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Passkeys</h4>
            <p className="text-sm text-muted-foreground">
              Securely sign-in with on-device biometric authentication.
            </p>
          </div>
          <Button variant="outline">Add passkey</Button>
        </div>
      </div>
    </div>
  );
}

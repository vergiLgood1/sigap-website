import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { inviteUser } from "@/app/(pages)/(admin)/dashboard/user-management/action";
import { toast } from "sonner";
import { ReactHookFormField } from "@/app/_components/react-hook-form-field";
import { Loader2, MailIcon } from "lucide-react";
import { Separator } from "@/app/_components/ui/separator";
import { useInviteUserHandler } from "../../_handlers/use-invite-user";



interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
}: InviteUserDialogProps) {

  const {
    register,
    handleSubmit,
    reset,
    errors,
    isPending,
    handleOpenChange
  } = useInviteUserHandler({ onOpenChange });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation email to a new user.
          </DialogDescription>
        </DialogHeader>
        <Separator className="" />
        <form onSubmit={handleSubmit} className="space-y-8">
          <ReactHookFormField
            label="Email"
            icon={MailIcon}
            placeholder="example@gmail.com"
            error={errors.email}
            registration={register("email")}
          />

          <DialogFooter>
            <Button className="flex w-full" type="submit" disabled={isPending}>
              {
                isPending ? (
                  <>
                    <span className="mr-2">Invite user...</span>
                    <Loader2 className="animate-spin" />
                  </>
                ) : "Invite User"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

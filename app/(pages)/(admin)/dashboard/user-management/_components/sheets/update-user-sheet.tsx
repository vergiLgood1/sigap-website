
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"

import { Loader2 } from "lucide-react"

import { IUserSchema } from "@/src/entities/models/users/users.model"

// UI Components
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/app/_components/ui/sheet"
import { Form } from "@/app/_components/ui/form"

import { Button } from "@/app/_components/ui/button"
import { FormSection } from "@/app/_components/form-section"
import { FormFieldWrapper } from "@/app/_components/form-wrapper"
import { useMutation } from "@tanstack/react-query"
import { updateUser } from "../../action"
import { toast } from "sonner"
import { UpdateUserSchema } from "@/src/entities/models/users/update-user.model"
import { useUpdateUserSheetHandlers } from "../../_handlers/use-profile-sheet"

type UserProfileFormValues = z.infer<typeof UpdateUserSchema>

interface UpdateUserSheetProps {
  open: boolean
  userData: IUserSchema
  onOpenChange: (open: boolean) => void
}

export function UpdateUserSheet({ open, onOpenChange, userData }: UpdateUserSheetProps) {

  const {
    form,
    handleUpdateUser,
    isPending,
  } = useUpdateUserSheetHandlers({ open, userData, onOpenChange })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6 border-b-2 pb-4">
          <SheetTitle>Update User Profile</SheetTitle>
          <SheetDescription>Make changes to the user profile here. Click save when you&apos;re done.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-6">
            {/* User Information Section */}
            <FormSection
              title="User Information"
              description="Update the user information below. Fields marked with an asterisk (*) are required."
            >
              <FormFieldWrapper
                name="email"
                label="Email"
                type="string"
                control={form.control}
                placeholder="email@example.com"
                rows={4}
                disabled={true}
              />
              <FormFieldWrapper
                name="phone"
                label="Phone"
                type="tel"
                control={form.control}
                placeholder="+1234567890"
                disabled={true}

              />
              <FormFieldWrapper
                name="role"
                label="Role"
                type="string (select)"
                control={form.control}
                options={[
                  { value: "user", label: "User" },
                  { value: "admin", label: "Admin" },
                  { value: "staff", label: "Staff" },
                ]}
              />
              <FormFieldWrapper
                name="is_anonymous"
                label="Is Anonymous"
                type="boolean"
                control={form.control}
                isBoolean={true}
                booleanType="select"
              />
              <FormFieldWrapper
                name="encrypted_password_hash"
                label="Encrypted_password Hash"
                type="string"
                control={form.control}
                placeholder="Encrypted_password Hash"
              />
              <FormFieldWrapper name="invited_at" label="Invited At" type="date" control={form.control} isDate={true} />
              <FormFieldWrapper
                name="confirmed_at"
                label="Confirmed At"
                type="date"
                control={form.control}
                isDate={true}
              />
              <FormFieldWrapper
                name="recovery_sent_at"
                label="Recovery Sent At"
                type="date"
                control={form.control}
                isDate={true}
              />
              <FormFieldWrapper
                name="last_sign_in_at"
                label="Last Sign In At"
                type="date"
                control={form.control}
                isDate={true}
              />
              <FormFieldWrapper name="created_at" label="Created At" type="date" control={form.control} isDate={true} />
              <FormFieldWrapper name="updated_at" label="Updated At" type="date" control={form.control} isDate={true} />
            </FormSection>

            {/* Profile Information Section */}
            <FormSection title="Profile Information" description="Update the user profile information below.">
              <FormFieldWrapper
                name="profile.username"
                label="Username"
                type="string"
                control={form.control}
                placeholder="username"
              />
              <FormFieldWrapper
                name="profile.first_name"
                label="First Name"
                type="string"
                control={form.control}
                placeholder="John"
              />
              <FormFieldWrapper
                name="profile.last_name"
                label="Last Name"
                type="string"
                control={form.control}
                placeholder="Doe"
              />
              <FormFieldWrapper
                name="profile.bio"
                label="Bio"
                type="string"
                control={form.control}
                placeholder="Tell us about yourself"
                rows={4}
              />
              <FormFieldWrapper
                name="profile.birth_date"
                label="Date of birth"
                type="date"
                control={form.control}
                isDate={true}
              />
              <FormFieldWrapper
                name="profile.avatar"
                label="Avatar URL"
                type="string (URL)"
                control={form.control}
                placeholder="https://example.com/avatar.jpg"
              />
            </FormSection>

            {/* Address Section */}
            <FormSection title="Address" description="Update the user address information below.">
              <FormFieldWrapper
                name="profile.address.street"
                label="Street Address"
                type="string"
                control={form.control}
                placeholder="123 Main St"
              />
              <FormFieldWrapper
                name="profile.address.city"
                label="City"
                type="string"
                control={form.control}
                placeholder="City"
              />
              <FormFieldWrapper
                name="profile.address.state"
                label="State"
                type="string"
                control={form.control}
                placeholder="State"
              />
              <FormFieldWrapper
                name="profile.address.country"
                label="Country"
                type="string"
                control={form.control}
                placeholder="Country"
              />
              <FormFieldWrapper
                name="profile.address.postal_code"
                label="Postal Code"
                type="string"
                control={form.control}
                placeholder="Postal Code"
              />
            </FormSection>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => !isPending && onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button size="xs" type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}


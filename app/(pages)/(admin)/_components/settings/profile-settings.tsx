"use client"
import { Loader2, ImageIcon } from "lucide-react"

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/app/_components/ui/form"
import { Input } from "@/app/_components/ui/input"
import { Button } from "@/app/_components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Label } from "@/app/_components/ui/label"
import { Separator } from "@/app/_components/ui/separator"
import { Switch } from "@/app/_components/ui/switch"
import { useProfileFormHandlers } from "../../dashboard/user-management/_handlers/use-profile-form"
import { CTexts } from "@/app/_utils/const/texts"

export function ProfileSettings() {
  const { form, fileInputRef, handleFileChange, handleAvatarClick, isPending, user } = useProfileFormHandlers()

  const email = user?.email || ""
  const username = user?.profile?.username || ""

  return (
    <div className="space-y-14 w-full max-w-4xl mx-auto">
      <div className="space-y-14 p-8 max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={() => { }} className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-4 mb-4">
                <h3 className="text-lg font-semibold">Account</h3>
                <Separator className="" />
              </div>
              <div className="flex items-start gap-4">
                <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                  <Avatar className="h-16 w-16">
                    {isPending ? (
                      <div className="h-full w-full bg-muted animate-pulse rounded-full" />
                    ) : (
                      <>
                          <AvatarImage src={user?.profile?.avatar || ""} alt={username} />
                          <AvatarFallback>{username?.[0]?.toUpperCase() || email?.[0]?.toUpperCase()}</AvatarFallback>
                      </>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPending ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={CTexts.ALLOWED_FILE_TYPES.join(",")}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isPending}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label>Preferred name</Label>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            // placeholder={user?.profile?.username || ""}
                            className="bg-muted/50 w-80"
                            {...field}
                            value={field.value || user?.profile?.username || ""}
                            disabled={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            {/* <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={isPending || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button> */}
          </form>
        </Form>

        <div className="">
          <div className="space-y-4 mb-4">
            <h3 className="text-base font-medium">Account security</h3>
            <Separator className="" />
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
              <Button variant="outline" size="sm">
                Change email
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Password</Label>
                <p className="text-sm text-muted-foreground">Set a permanent password to login to your account.</p>
              </div>
              <Button variant="outline" size="sm">
                Change password
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>2-step verification</Label>
                <p className="text-sm text-muted-foreground">
                  Add an additional layer of security to your account during login.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Add verification method
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Passkeys</Label>
                <p className="text-sm text-muted-foreground">
                  Securely sign-in with on-device biometric authentication.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Add passkey
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="space-y-4 mb-4">
            <h3 className="text-base font-medium">Notifications</h3>
            <Separator className="" />
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <Label>Support access</Label>
                <p className="text-sm text-muted-foreground">
                  Grant temporary access to your account for support purposes.
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-destructive">Delete account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete the account and remove access from all workspaces.
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-destructive">
                Delete account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

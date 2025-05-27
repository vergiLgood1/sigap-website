import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/_components/ui/dialog"
import { Button } from "@/app/_components/ui/button"
import { Mail, Lock, Loader2 } from "lucide-react"
import { ReactHookFormField } from "@/app/_components/react-hook-form-field"
import { useAddUserDialogHandler } from "../../_handlers/use-add-user-dialog"

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const {
    register,
    errors,
    isPending,
    handleSubmit,
    handleOpenChange,
  } = useAddUserDialogHandler({ onOpenChange });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 space-x-4 pb-4">
          <DialogTitle className="text-xl font-semibold">Create a new user</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <ReactHookFormField
              label="Email address"
              icon={Mail}
              placeholder="user@example.com"
              error={errors.email}
              registration={register("email")}
            />

            <ReactHookFormField
              label="Password"
              icon={Lock}
              placeholder="••••••••"
              type="password"
              error={errors.password}
              registration={register("password")}
            />
          </div>

          <div className="space-y-2">
            {/* <div className="flex items-center space-x-2">
              <Checkbox
                id="email_confirm"
                {...register("email_confirm")}
                className="border-zinc-700"
              />
              <label htmlFor="email_confirm" className="text-sm">
                Auto Confirm User?
              </label>
            </div> */}
            <p className="text-sm text-zinc-500">
              A confirmation email will not be sent when creating a user via this form.
            </p>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create user"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


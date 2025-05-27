
import type React from "react"
import { Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog"
import { Button, type ButtonProps } from "@/app/_components/ui/button"

interface CAlertDialogProps {
    triggerText?: React.ReactNode
    triggerIcon?: React.ReactNode
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    isPending?: boolean
    pendingText?: string
    variant?: ButtonProps["variant"]
    size?: ButtonProps["size"]
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CAlertDialog({
    triggerText,
    triggerIcon,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    isPending = false,
    pendingText = "Processing...",
    variant = "default",
    size = "default",
    open,
    onOpenChange,
}: CAlertDialogProps) {
    // If open and onOpenChange are provided, use them for controlled behavior
    const isControlled = open !== undefined && onOpenChange !== undefined

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {/* Only render the trigger if not in controlled mode */}
            {!isControlled && (
                <AlertDialogTrigger asChild>
                    <Button variant={variant} size={size} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {pendingText}
                            </>
                        ) : (
                            <>
                                {triggerIcon && <span className="mr-2">{triggerIcon}</span>}
                                {triggerText}
                            </>
                        )}
                    </Button>
                </AlertDialogTrigger>
            )}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={
                            variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
                        }
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {pendingText}
                            </>
                        ) : (
                            confirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


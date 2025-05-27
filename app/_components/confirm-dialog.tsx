import type React from "react"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/_components/ui/dialog"
import { Button, type ButtonProps } from "@/app/_components/ui/button"

interface ConfirmDialogProps {
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
    confirmIcon?: React.ReactNode
}

export function ConfirmDialog({
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
    confirmIcon,
}: ConfirmDialogProps) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-0">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={isPending}>
                        {cancelText}
                    </Button>
                    <Button type="submit" variant={variant} onClick={onConfirm} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {pendingText}
                            </>
                        ) : (
                            <>
                                {confirmIcon && <span className="">{confirmIcon}</span>}
                                {confirmText}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


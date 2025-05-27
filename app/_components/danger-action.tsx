import { ReactNode } from "react";
import { Button } from "@/app/_components/ui/button";
import { Loader2 } from "lucide-react";
import { CAlertDialog } from "@/app/_components/alert-dialog";
import { cn } from "@/app/_lib/utils";

interface DangerActionProps {
    title: string;
    description: string;
    onClick?: () => void;
    isPending?: boolean;
    pendingText?: string;
    icon?: ReactNode;
    actionText?: string;
    isDialog?: boolean;
    dialogProps?: any;
    className?: string;
    contentClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    buttonClassName?: string;
    containerClassName?: string;
    buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    buttonSize?: "default" | "sm" | "lg" | "icon";
}

export function DangerAction({
    title,
    description,
    onClick,
    isPending = false,
    pendingText = "Loading...",
    icon,
    actionText,
    isDialog,
    dialogProps,
    className,
    contentClassName,
    titleClassName,
    descriptionClassName,
    buttonClassName,
    containerClassName,
    buttonVariant = "outline",
    buttonSize = "sm"
}: DangerActionProps) {
    return (
        <div className={cn("border border-destructive rounded-md p-4 flex justify-between items-center", containerClassName, className)}>
            <div className={cn(contentClassName)}>
                <h4 className={cn("font-medium", titleClassName)}>{title}</h4>
                <p className={cn("text-xs text-muted-foreground", descriptionClassName)}>{description}</p>
            </div>
            {isDialog ? (
                <div className={cn(buttonClassName)}>
                    <CAlertDialog {...dialogProps} />
                </div>
            ) : (
                <Button
                    variant={buttonVariant}
                    size={buttonSize}
                    onClick={onClick}
                    disabled={isPending}
                    className={cn(buttonClassName)}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {pendingText}
                        </>
                    ) : (
                        <>
                            {icon}
                            {actionText}
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}

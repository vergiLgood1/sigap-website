import { ReactNode } from "react";
import { Button } from "@/app/_components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/app/_lib/utils";

interface ActionRowProps {
    title: string;
    description: string;
    onClick: () => void;
    isPending?: boolean;
    pendingText?: string;
    icon?: ReactNode;
    actionText: string;
    className?: string;
    contentClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    buttonClassName?: string;
    buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    buttonSize?: "default" | "sm" | "lg" | "icon";
}

export function ActionRow({
    title,
    description,
    onClick,
    isPending = false,
    pendingText = "Loading...",
    icon,
    actionText,
    className,
    contentClassName,
    titleClassName,
    descriptionClassName,
    buttonClassName,
    buttonVariant = "outline",
    buttonSize = "sm"
}: ActionRowProps) {
    return (
        <div className={cn("flex justify-between items-center", className)}>
            <div className={cn(contentClassName)}>
                <h4 className={cn("font-medium", titleClassName)}>{title}</h4>
                <p className={cn("text-xs text-muted-foreground", descriptionClassName)}>{description}</p>
            </div>
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
        </div>
    );
}

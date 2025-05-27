import { ReactNode } from "react";
import { cn } from "@/app/_lib/utils";

interface ProviderInfoProps {
    icon: ReactNode;
    title: string;
    description: string;
    badge: ReactNode;
    className?: string;
    containerClassName?: string;
    headerClassName?: string;
    titleContainerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    badgeClassName?: string;
}

export function ProviderInfo({
    icon,
    title,
    description,
    badge,
    className,
    containerClassName,
    headerClassName,
    titleContainerClassName,
    titleClassName,
    descriptionClassName,
    badgeClassName
}: ProviderInfoProps) {
    return (
        <div className={cn("border rounded-md p-4 space-y-3 bg-secondary/80", containerClassName, className)}>
            <div className={cn("flex items-center justify-between", headerClassName)}>
                <div className={cn("flex items-center gap-2", titleContainerClassName)}>
                    {icon}
                    <div>
                        <div className={cn("font-medium", titleClassName)}>{title}</div>
                        <div className={cn("text-xs text-muted-foreground", descriptionClassName)}>{description}</div>
                    </div>
                </div>
                <div className={cn(badgeClassName)}>
                    {badge}
                </div>
            </div>
        </div>
    );
}

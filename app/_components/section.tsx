import { ReactNode } from "react";
import { cn } from "@/app/_lib/utils";

interface SectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    contentClassName?: string;
}

export function Section({
    title,
    description,
    children,
    className,
    titleClassName,
    descriptionClassName,
    contentClassName
}: SectionProps) {
    return (
        <div className={cn("space-y-4", className)}>
            <div className={cn("flex flex-col gap-1")}>
                <h3 className={cn("text-lg font-semibold", titleClassName)}>{title}</h3>
                {description && <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>{description}</p>}
            </div>
            <div className={cn(contentClassName)}>
                {children}
            </div>
        </div>
    );
}

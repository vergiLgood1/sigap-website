import { cn } from "@/app/_lib/utils"
import type React from "react"
import type { HTMLAttributes } from "react"

// Define specific types for colSpan and rowSpan
export type GridSpan = "1" | "2" | "3"

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
    className?: string
    children: React.ReactNode
}

export function BentoGrid({ className, children, ...props }: BentoGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)} {...props}>
            {children}
        </div>
    )
}

export interface BentoGridItemProps extends HTMLAttributes<HTMLDivElement> {
    className?: string
    title?: string
    description?: string
    header?: React.ReactNode
    icon?: React.ReactNode
    children?: React.ReactNode
    colSpan?: GridSpan
    rowSpan?: GridSpan
    suffixMenu?: React.ReactNode
    component?: React.ReactNode
}

export function BentoGridItem({
    className,
    title,
    description,
    header,
    icon,
    children,
    colSpan = "1",
    rowSpan = "1",
    suffixMenu,
    ...props
}: BentoGridItemProps) {
    return (
        <div
            className={cn(
                "row-span-1 col-span-1 rounded-xl group/bento overflow-hidden border bg-background p-4 shadow-sm transition-all hover:shadow-md",
                colSpan === "2" && "md:col-span-2",
                colSpan === "3" && "md:col-span-3",
                rowSpan === "2" && "md:row-span-2",
                rowSpan === "3" && "md:row-span-3",
                className,
            )}
            {...props}
        >
            {header && <div className="mb-4">{header}</div>}
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2 w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-muted">{icon}</div>
                    )}
                    {(title || description) && (
                        <div className="space-y-1">
                            {title && <h3 className="font-semibold tracking-tight">{title}</h3>}
                            {description && <p className="text-sm text-muted-foreground">{description}</p>}
                        </div>
                    )}
                </div>
                {suffixMenu && <div>{suffixMenu}</div>}
            </div>
            {children && <div>{children}</div>}
        </div>
    )
}

import { ReactNode } from "react";
import { Button } from "@/app/_components/ui/button";
import { Copy } from "lucide-react";
import { cn } from "@/app/_lib/utils";

interface InfoRowProps {
    label: string;
    value: ReactNode;
    onCopy?: () => void;
    className?: string;
    labelClassName?: string;
    valueClassName?: string;
    copyButtonClassName?: string;
}

export function InfoRow({
    label,
    value,
    onCopy,
    className,
    labelClassName,
    valueClassName,
    copyButtonClassName
}: InfoRowProps) {
    return (
        <div className={cn("flex justify-between items-center py-1", className)}>
            <span className={cn("text-muted-foreground", labelClassName)}>{label}</span>
            <div className="flex items-center">
                {typeof value === "string" ? (
                    <span className={cn("font-mono", valueClassName)}>{value}</span>
                ) : value}
                {onCopy && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-4 w-4 ml-2", copyButtonClassName)}
                        onClick={onCopy}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface KMeansDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    mode: "incremental" | "batch";
    isLoading?: boolean;
}

export default function KMeansDialog({
    open,
    onOpenChange,
    onConfirm,
    mode,
    isLoading = false,
}: KMeansDialogProps) {

    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This will ensure that the document is only used in the client-side context
        setIsClient(true);
    }, []);

    const container = isClient ? document.getElementById("root") : null;

    const handleConfirm = () => {
        onConfirm();
    };

    const dialogTitle = mode === "incremental"
        ? "Incremental K-Means Update"
        : "Full K-Means Recomputation";

    const dialogDescription = mode === "incremental"
        ? "This will process recent incident logs and perform incremental clustering updates. This operation takes a few seconds to complete."
        : "This will recompute all clusters across districts based on the latest data. This operation may take several minutes depending on the data size.";

    return (
        <div ref={containerRef} className="mapboxgl-kmeans-dialog">
            <AlertDialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
                <AlertDialogContent
                    container={containerRef.current || container || undefined}
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-background"
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {dialogTitle}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogDescription}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="relative"
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {mode === "incremental" ? "Process Now" : "Recompute Clusters"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center">
                    <div className="bg-background p-4 rounded-lg flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                        <span className="text-sm">
                            {mode === "incremental"
                                ? "Processing incident logs and updating clusters..."
                                : "Recalculating all clusters across districts..."}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}